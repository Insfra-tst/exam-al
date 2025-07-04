const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const tokenManager = require('./token-manager');

class PaymentProcessor {
    constructor() {
        // Fake credit card data for testing
        this.fakeCards = {
            'visa': {
                number: '4242424242424242',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                brand: 'visa'
            },
            'mastercard': {
                number: '5555555555554444',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                brand: 'mastercard'
            },
            'amex': {
                number: '378282246310005',
                exp_month: '12',
                exp_year: '2025',
                cvc: '1234',
                brand: 'amex'
            },
            'discover': {
                number: '6011111111111117',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                brand: 'discover'
            }
        };

        this.successRate = parseFloat(process.env.FAKE_PAYMENT_SUCCESS_RATE) || 0.95;
    }

    // Process fake payment
    async processFakePayment(userId, paymentData) {
        try {
            const transactionId = uuidv4();
            const { cardNumber, expMonth, expYear, cvc, amount, tokensToPurchase } = paymentData;

            // Validate card format
            const cardValidation = this.validateCard(cardNumber, expMonth, expYear, cvc);
            if (!cardValidation.isValid) {
                throw new Error(cardValidation.error);
            }

            // Simulate payment processing delay
            await this.simulateProcessingDelay();

            // Determine if payment succeeds (based on success rate)
            const paymentSuccess = Math.random() < this.successRate;

            if (!paymentSuccess) {
                // Log failed transaction
                await this.logTransaction(userId, transactionId, amount, tokensToPurchase, 'failed', {
                    card_last4: cardNumber.slice(-4),
                    card_brand: cardValidation.brand,
                    error: 'Payment declined by bank'
                });

                throw new Error('Payment declined. Please try again or use a different card.');
            }

            // Validate token purchase
            await tokenManager.validateTokenPurchase(userId, amount, tokensToPurchase);

            // Add tokens to user account
            await tokenManager.addTokens(userId, tokensToPurchase, 'credit_card_purchase');

            // Log successful transaction
            await this.logTransaction(userId, transactionId, amount, tokensToPurchase, 'completed', {
                card_last4: cardNumber.slice(-4),
                card_brand: cardValidation.brand
            });

            return {
                success: true,
                transaction_id: transactionId,
                amount: amount,
                tokens_purchased: tokensToPurchase,
                card_brand: cardValidation.brand,
                card_last4: cardNumber.slice(-4)
            };

        } catch (error) {
            console.error('Error processing fake payment:', error);
            throw error;
        }
    }

    // Validate credit card
    validateCard(cardNumber, expMonth, expYear, cvc) {
        // Remove spaces and dashes
        const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');

        // Basic Luhn algorithm check
        if (!this.luhnCheck(cleanNumber)) {
            return { isValid: false, error: 'Invalid card number' };
        }

        // Check expiration
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (parseInt(expYear) < currentYear || 
            (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
            return { isValid: false, error: 'Card has expired' };
        }

        // Determine card brand
        const brand = this.getCardBrand(cleanNumber);

        // Validate CVC length
        const expectedCvcLength = brand === 'amex' ? 4 : 3;
        if (cvc.length !== expectedCvcLength) {
            return { isValid: false, error: `Invalid CVC length for ${brand}` };
        }

        return { isValid: true, brand: brand };
    }

    // Luhn algorithm for card validation
    luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    // Determine card brand
    getCardBrand(cardNumber) {
        if (/^4/.test(cardNumber)) return 'visa';
        if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
        if (/^3[47]/.test(cardNumber)) return 'amex';
        if (/^6(?:011|5)/.test(cardNumber)) return 'discover';
        return 'unknown';
    }

    // Simulate processing delay
    async simulateProcessingDelay() {
        const delay = Math.random() * 2000 + 1000; // 1-3 seconds
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Log transaction
    async logTransaction(userId, transactionId, amount, tokensPurchased, status, metadata = {}) {
        try {
            await db.execute(
                'INSERT INTO payment_transactions (id, user_id, amount, tokens_purchased, payment_method, transaction_status, card_last4, card_brand) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    transactionId,
                    userId,
                    amount,
                    tokensPurchased,
                    'credit_card',
                    status,
                    metadata.card_last4 || null,
                    metadata.card_brand || null
                ]
            );
            return transactionId;
        } catch (error) {
            console.error('Error logging transaction:', error);
            throw error;
        }
    }

    // Get transaction history
    async getTransactionHistory(userId, limit = 50) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM payment_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
                [userId, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error getting transaction history:', error);
            throw error;
        }
    }

    // Get fake card suggestions
    getFakeCardSuggestions() {
        return Object.keys(this.fakeCards).map(brand => ({
            brand: brand,
            number: this.fakeCards[brand].number,
            exp_month: this.fakeCards[brand].exp_month,
            exp_year: this.fakeCards[brand].exp_year,
            cvc: this.fakeCards[brand].cvc
        }));
    }

    // Get payment statistics
    async getPaymentStatistics(userId) {
        try {
            const [transactionRows] = await db.execute(
                'SELECT transaction_status, COUNT(*) as count, SUM(amount) as total_amount FROM payment_transactions WHERE user_id = ? GROUP BY transaction_status',
                [userId]
            );

            const [totalTokens] = await db.execute(
                'SELECT SUM(tokens_purchased) as total_tokens FROM payment_transactions WHERE user_id = ? AND transaction_status = "completed"',
                [userId]
            );

            return {
                transactions: transactionRows,
                total_tokens_purchased: totalTokens[0]?.total_tokens || 0,
                total_amount_spent: transactionRows
                    .filter(t => t.transaction_status === 'completed')
                    .reduce((sum, t) => sum + parseFloat(t.total_amount), 0)
            };
        } catch (error) {
            console.error('Error getting payment statistics:', error);
            throw error;
        }
    }

    // Refund transaction (for admin use)
    async refundTransaction(transactionId, userId) {
        try {
            const [transaction] = await db.execute(
                'SELECT * FROM payment_transactions WHERE id = ? AND user_id = ?',
                [transactionId, userId]
            );

            if (transaction.length === 0) {
                throw new Error('Transaction not found');
            }

            if (transaction[0].transaction_status !== 'completed') {
                throw new Error('Transaction cannot be refunded');
            }

            // Update transaction status
            await db.execute(
                'UPDATE payment_transactions SET transaction_status = "refunded" WHERE id = ?',
                [transactionId]
            );

            // Deduct tokens from user account
            await tokenManager.deductTokens(userId, 'refund', `Refund for transaction ${transactionId}`, {
                transaction_id: transactionId,
                refund_amount: transaction[0].amount
            });

            return {
                success: true,
                transaction_id: transactionId,
                refunded_amount: transaction[0].amount,
                tokens_deducted: transaction[0].tokens_purchased
            };

        } catch (error) {
            console.error('Error refunding transaction:', error);
            throw error;
        }
    }
}

module.exports = new PaymentProcessor(); 