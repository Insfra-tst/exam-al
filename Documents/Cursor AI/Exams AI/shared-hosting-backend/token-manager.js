const { v4: uuidv4 } = require('uuid');
const { getConnection } = require('./database');

// In-memory storage for testing
const inMemoryTokens = new Map();
const inMemoryUsageLogs = new Map();

class TokenManager {
    constructor() {
        this.tokenCosts = {
            subjectAnalysis: parseInt(process.env.TOKEN_COST_SUBJECT_ANALYSIS) || 15,
            topicAnalysis: parseInt(process.env.TOKEN_COST_TOPIC_ANALYSIS) || 20,
            visualData: parseInt(process.env.TOKEN_COST_VISUAL_DATA) || 25,
            examValidation: parseInt(process.env.TOKEN_COST_EXAM_VALIDATION) || 10,
            subjectGeneration: parseInt(process.env.TOKEN_COST_SUBJECT_GENERATION) || 12
        };
    }

    // Get user's token balance
    async getUserTokens(userId) {
        try {
            if (!userId) {
                console.error('getUserTokens: userId is undefined or null');
                throw new Error('User ID is required');
            }

            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                if (!inMemoryTokens.has(userId)) {
                    inMemoryTokens.set(userId, {
                        tokens_available: 50,
                        tokens_used: 0,
                        total_purchased: 50
                    });
                }
                return inMemoryTokens.get(userId);
            }

            // Use MySQL for production
            const connection = await getConnection();
            
            // First check if user exists
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if (userRows.length === 0) {
                console.error(`getUserTokens: User with ID ${userId} not found in database`);
                // Return default tokens for non-existent users (fallback)
                return {
                    tokens_available: 50,
                    tokens_used: 0,
                    total_purchased: 50
                };
            }

            const [rows] = await connection.execute(
                'SELECT tokens_available, tokens_used, total_purchased FROM user_tokens WHERE user_id = ?',
                [userId]
            );

            if (rows.length === 0) {
                // Create token record for new user
                try {
                    await this.createUserTokenRecord(userId);
                } catch (createError) {
                    console.error('Failed to create user token record:', createError);
                    // Return default tokens if creation fails
                    return {
                        tokens_available: 50,
                        tokens_used: 0,
                        total_purchased: 50
                    };
                }
                return {
                    tokens_available: 50, // Return the free tokens we just gave
                    tokens_used: 0,
                    total_purchased: 50
                };
            }

            return rows[0];
        } catch (error) {
            console.error('Error getting user tokens:', error);
            // Fallback to in-memory storage if database fails
            if (!inMemoryTokens.has(userId)) {
                inMemoryTokens.set(userId, {
                    tokens_available: 50,
                    tokens_used: 0,
                    total_purchased: 50
                });
            }
            return inMemoryTokens.get(userId);
        }
    }

    // Create token record for new user
    async createUserTokenRecord(userId) {
        try {
            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                inMemoryTokens.set(userId, {
                    tokens_available: 50,
                    tokens_used: 0,
                    total_purchased: 50
                });
                return uuidv4();
            }

            // Use MySQL for production
            const connection = await getConnection();
            
            // First verify the user exists
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if (userRows.length === 0) {
                console.error(`createUserTokenRecord: User with ID ${userId} not found in database`);
                throw new Error(`User with ID ${userId} not found`);
            }
            
            const tokenId = uuidv4();
            const freeTokens = 50;
            await connection.execute(
                'INSERT INTO user_tokens (id, user_id, tokens_available, tokens_used, total_purchased) VALUES (?, ?, ?, 0, ?)',
                [tokenId, userId, freeTokens, freeTokens]
            );
            return tokenId;
        } catch (error) {
            console.error('Error creating user token record:', error);
            throw error;
        }
    }

    // Check if user has enough tokens for an action
    async hasEnoughTokens(userId, actionType) {
        try {
            const userTokens = await this.getUserTokens(userId);
            const requiredTokens = this.tokenCosts[actionType] || 10;
            
            return {
                hasEnough: userTokens.tokens_available >= requiredTokens,
                available: userTokens.tokens_available,
                required: requiredTokens,
                actionType: actionType
            };
        } catch (error) {
            console.error('Error checking token balance:', error);
            throw error;
        }
    }

    // Ensure user has tokens (for new users)
    async ensureUserHasTokens(userId) {
        try {
            const userTokens = await this.getUserTokens(userId);
            if (userTokens.tokens_available === 0) {
                // Give free tokens to new users
                await this.addTokens(userId, 50, 'welcome_bonus');
            }
        } catch (error) {
            console.error('Error ensuring user has tokens:', error);
            throw error;
        }
    }

    // Deduct tokens for an action
    async deductTokens(userId, actionType, description = '', metadata = {}) {
        try {
            const requiredTokens = this.tokenCosts[actionType] || 10;
            const userTokens = await this.getUserTokens(userId);

            if (userTokens.tokens_available < requiredTokens) {
                throw new Error('Insufficient tokens');
            }

            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                const currentTokens = inMemoryTokens.get(userId);
                currentTokens.tokens_available -= requiredTokens;
                currentTokens.tokens_used += requiredTokens;
                inMemoryTokens.set(userId, currentTokens);

                // Log usage
                await this.logTokenUsage(userId, actionType, requiredTokens, description, metadata);

                return {
                    success: true,
                    tokens_deducted: requiredTokens,
                    remaining_tokens: currentTokens.tokens_available
                };
            }

            // Use MySQL for production
            const connection = await getConnection();
            
            // Update token balance
            await connection.execute(
                'UPDATE user_tokens SET tokens_available = tokens_available - ?, tokens_used = tokens_used + ? WHERE user_id = ?',
                [requiredTokens, requiredTokens, userId]
            );

            // Log token usage
            await this.logTokenUsage(userId, actionType, requiredTokens, description, metadata);

            return {
                success: true,
                tokens_deducted: requiredTokens,
                remaining_tokens: userTokens.tokens_available - requiredTokens
            };
        } catch (error) {
            console.error('Error deducting tokens:', error);
            throw error;
        }
    }

    // Add tokens to user account
    async addTokens(userId, tokensToAdd, source = 'purchase') {
        try {
            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                const currentTokens = inMemoryTokens.get(userId) || {
                    tokens_available: 0,
                    tokens_used: 0,
                    total_purchased: 0
                };
                currentTokens.tokens_available += tokensToAdd;
                currentTokens.total_purchased += tokensToAdd;
                inMemoryTokens.set(userId, currentTokens);

                // Log token addition
                await this.logTokenUsage(userId, 'token_purchase', 0, `Added ${tokensToAdd} tokens via ${source}`, {
                    tokens_added: tokensToAdd,
                    source: source
                });

                return {
                    success: true,
                    tokens_added: tokensToAdd,
                    new_balance: currentTokens
                };
            }

            // Use MySQL for production
            const connection = await getConnection();
            const tokenId = uuidv4();
            
            // Update token balance
            await connection.execute(
                'UPDATE user_tokens SET tokens_available = tokens_available + ?, total_purchased = total_purchased + ? WHERE user_id = ?',
                [tokensToAdd, tokensToAdd, userId]
            );

            // Log token addition
            await this.logTokenUsage(userId, 'token_purchase', 0, `Added ${tokensToAdd} tokens via ${source}`, {
                tokens_added: tokensToAdd,
                source: source
            });

            return {
                success: true,
                tokens_added: tokensToAdd,
                new_balance: await this.getUserTokens(userId)
            };
        } catch (error) {
            console.error('Error adding tokens:', error);
            throw error;
        }
    }

    // Log token usage
    async logTokenUsage(userId, actionType, tokensUsed, description = '', metadata = {}) {
        try {
            const logId = uuidv4();
            
            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                const logs = inMemoryUsageLogs.get(userId) || [];
                logs.push({
                    id: logId,
                    user_id: userId,
                    action_type: actionType,
                    tokens_used: tokensUsed,
                    description: description,
                    exam_type: metadata.exam_type || null,
                    subject: metadata.subject || null,
                    topic: metadata.topic || null,
                    created_at: new Date()
                });
                inMemoryUsageLogs.set(userId, logs);
                return logId;
            }

            // Use MySQL for production
            const connection = await getConnection();
            
            // First verify the user exists
            const [userRows] = await connection.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if (userRows.length === 0) {
                console.error(`logTokenUsage: User with ID ${userId} not found in database`);
                // Don't throw error, just return without logging
                return null;
            }
            
            await connection.execute(
                'INSERT INTO token_usage_logs (id, user_id, action_type, tokens_used, description, exam_type, subject, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    logId,
                    userId,
                    actionType,
                    tokensUsed,
                    description,
                    metadata.exam_type || null,
                    metadata.subject || null,
                    metadata.topic || null
                ]
            );
            return logId;
        } catch (error) {
            console.error('Error logging token usage:', error);
            // Don't throw error, just return without logging
            return null;
        }
    }

    // Get token usage history
    async getTokenUsageHistory(userId, limit = 50) {
        try {
            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                const logs = inMemoryUsageLogs.get(userId) || [];
                return logs.slice(0, limit);
            }

            // Use MySQL for production
            const connection = await getConnection();
            const [rows] = await connection.execute(
                'SELECT * FROM token_usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
                [userId, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error getting token usage history:', error);
            throw error;
        }
    }

    // Get token statistics
    async getTokenStatistics(userId) {
        try {
            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                const logs = inMemoryUsageLogs.get(userId) || [];
                const usageByAction = {};
                let totalPurchased = 0;

                logs.forEach(log => {
                    if (log.action_type === 'token_purchase') {
                        totalPurchased += log.tokens_used;
                    } else {
                        usageByAction[log.action_type] = (usageByAction[log.action_type] || 0) + log.tokens_used;
                    }
                });

                return {
                    usage_by_action: Object.entries(usageByAction).map(([action, total]) => ({
                        action_type: action,
                        total_used: total
                    })),
                    total_purchased: totalPurchased
                };
            }

            // Use MySQL for production
            const connection = await getConnection();
            const [usageRows] = await connection.execute(
                'SELECT action_type, SUM(tokens_used) as total_used FROM token_usage_logs WHERE user_id = ? GROUP BY action_type',
                [userId]
            );

            const [purchaseRows] = await connection.execute(
                'SELECT SUM(tokens_used) as total_purchased FROM token_usage_logs WHERE user_id = ? AND action_type = "token_purchase"',
                [userId]
            );

            return {
                usage_by_action: usageRows,
                total_purchased: purchaseRows[0]?.total_purchased || 0
            };
        } catch (error) {
            console.error('Error getting token statistics:', error);
            throw error;
        }
    }

    // Get token pricing
    getTokenPricing() {
        return {
            prices: {
                100: 9.99,
                250: 19.99,
                500: 34.99,
                1000: 59.99,
                2500: 129.99
            },
            costs: this.tokenCosts
        };
    }

    // Validate token purchase
    async validateTokenPurchase(userId, amount, tokensToPurchase) {
        try {
            if (!userId || !amount || !tokensToPurchase) {
                throw new Error('Missing required parameters: userId, amount, and tokensToPurchase are required');
            }

            if (process.env.NODE_ENV === 'test' || !getConnection) {
                // Use in-memory storage for testing
                const transactionId = uuidv4();
                
                // Add tokens to user account
                await this.addTokens(userId, tokensToPurchase, 'purchase');

                return {
                    success: true,
                    transaction_id: transactionId,
                    tokens_added: tokensToPurchase,
                    new_balance: await this.getUserTokens(userId)
                };
            }

            // Use MySQL for production
            const connection = await getConnection();
            const transactionId = uuidv4();
            
            // Record the purchase transaction
            await connection.execute(
                'INSERT INTO payment_transactions (id, user_id, amount, tokens_purchased, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
                [transactionId, userId, amount, tokensToPurchase, 'completed', 'credit_card']
            );

            // Add tokens to user account
            await this.addTokens(userId, tokensToPurchase, 'purchase');

            return {
                success: true,
                transaction_id: transactionId,
                tokens_added: tokensToPurchase,
                new_balance: await this.getUserTokens(userId)
            };
        } catch (error) {
            console.error('Error validating token purchase:', error);
            throw error;
        }
    }
}

module.exports = new TokenManager(); 