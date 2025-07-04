const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'exam_analyzer',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create connection pool
let pool = null;

const createPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
        console.log('✅ MySQL connection pool created');
    }
    return pool;
};

// Get database connection
const getConnection = async () => {
    if (!pool) {
        createPool();
    }
    return pool;
};

// Test database connection
const testConnection = async () => {
    try {
        const connection = await getConnection();
        await connection.execute('SELECT 1');
        console.log('✅ MySQL database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        return false;
    }
};

// User operations
const userOperations = {
    // Create user
    async createUser(userData) {
        const { email, password, name, provider = 'local' } = userData;
        const connection = await getConnection();
        
        // Check if user already exists
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            throw new Error('User already exists');
        }

        const userId = uuidv4();
        // Auto-verify users in development mode
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const autoVerify = isDevelopment || provider !== 'local';
        
        const [result] = await connection.execute(
            'INSERT INTO users (id, email, name, password, provider, verified) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, email, name, password, provider, autoVerify ? 1 : 0]
        );

        return { id: userId, email, name, provider, verified: autoVerify, onboardingCompleted: false };
    },

    // Find user by email
    async findUserByEmail(email) {
        const connection = await getConnection();
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return users[0] || null;
    },

    // Find user by ID
    async findUserById(userId) {
        const connection = await getConnection();
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        return users[0] || null;
    },

    // Update user onboarding
    async updateUserOnboarding(userId, examData) {
        if (!userId) {
            console.error('updateUserOnboarding: userId is undefined!', { userId, examData });
            throw new Error('User ID is required for onboarding update.');
        }
        if (typeof examData === 'undefined') {
            console.error('updateUserOnboarding: examData is undefined!', { userId, examData });
            throw new Error('Exam data is required for onboarding update.');
        }
        const connection = await getConnection();
        // Ensure examData is a valid object or string
        const examDataString = examData ? JSON.stringify(examData) : '{}';
        await connection.execute(
            'UPDATE users SET exam_data = ?, onboarding_completed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [examDataString, userId]
        );
        return this.findUserById(userId);
    },

    // Verify email
    async verifyEmail(token) {
        const connection = await getConnection();
        
        // Get verification token
        const [tokens] = await connection.execute(
            'SELECT * FROM verification_tokens WHERE token = ? AND expires_at > NOW()',
            [token]
        );
        
        if (tokens.length === 0) {
            throw new Error('Invalid or expired verification token');
        }

        const verificationData = tokens[0];
        
        // Update user verification status
        await connection.execute(
            'UPDATE users SET verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
            [verificationData.email]
        );
        
        // Delete verification token
        await connection.execute(
            'DELETE FROM verification_tokens WHERE token = ?',
            [token]
        );
        
        return this.findUserByEmail(verificationData.email);
    },

    // Create verification token
    async createVerificationToken(email, token) {
        const connection = await getConnection();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await connection.execute(
            'INSERT INTO verification_tokens (token, email, expires_at) VALUES (?, ?, ?)',
            [token, email, expiresAt]
        );
    },

    // Clean expired verification tokens
    async cleanExpiredTokens() {
        const connection = await getConnection();
        await connection.execute(
            'DELETE FROM verification_tokens WHERE expires_at < NOW()'
        );
    }
};

// Subject operations
const subjectOperations = {
    // Get user subjects
    async getUserSubjects(userId) {
        const connection = await getConnection();
        const [subjects] = await connection.execute(
            'SELECT * FROM user_subjects WHERE user_id = ? ORDER BY created_at',
            [userId]
        );
        return subjects;
    },

    // Add user subject
    async addUserSubject(userId, subjectData) {
        const connection = await getConnection();
        const subjectId = uuidv4();
        
        await connection.execute(
            'INSERT INTO user_subjects (id, user_id, name, type) VALUES (?, ?, ?, ?)',
            [subjectId, userId, subjectData.name, subjectData.type || 'optional']
        );
        
        return { id: subjectId, name: subjectData.name, type: subjectData.type || 'optional' };
    },

    // Update user subject
    async updateUserSubject(userId, subjectId, subjectData) {
        const connection = await getConnection();
        
        await connection.execute(
            'UPDATE user_subjects SET name = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [subjectData.name, subjectData.type, subjectId, userId]
        );
        
        return this.getUserSubjects(userId);
    },

    // Delete user subject
    async deleteUserSubject(userId, subjectId) {
        const connection = await getConnection();
        
        await connection.execute(
            'DELETE FROM user_subjects WHERE id = ? AND user_id = ?',
            [subjectId, userId]
        );
        
        return this.getUserSubjects(userId);
    }
};

// Cache operations
const cacheOperations = {
    // Get cached exam data
    async getCachedExamData(examName, gradeLevel = null, stream = null) {
        const connection = await getConnection();
        const [cache] = await connection.execute(
            'SELECT * FROM exam_data_cache WHERE exam_name = ? AND (grade_level = ? OR grade_level IS NULL) AND (stream = ? OR stream IS NULL) ORDER BY created_at DESC LIMIT 1',
            [examName, gradeLevel, stream]
        );
        return cache[0] || null;
    },

    // Cache exam data
    async cacheExamData(examName, gradeLevel, stream, subjects, examInfo) {
        const connection = await getConnection();
        const cacheId = uuidv4();
        
        await connection.execute(
            'INSERT INTO exam_data_cache (id, exam_name, grade_level, stream, subjects, exam_info) VALUES (?, ?, ?, ?, ?, ?)',
            [cacheId, examName, gradeLevel, stream, JSON.stringify(subjects), JSON.stringify(examInfo)]
        );
        
        return cacheId;
    },

    // Clean old cache entries (older than 30 days)
    async cleanOldCache() {
        const connection = await getConnection();
        await connection.execute(
            'DELETE FROM exam_data_cache WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );
    }
};

// Analytics operations
const analyticsOperations = {
    // Track user action
    async trackAction(userId, action, examType = null, subject = null, topic = null, data = null) {
        const connection = await getConnection();
        
        await connection.execute(
            'INSERT INTO analytics (user_id, action, exam_type, subject, topic, data) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, action, examType, subject, topic, data ? JSON.stringify(data) : null]
        );
    },

    // Get analytics for user
    async getUserAnalytics(userId, limit = 100) {
        const connection = await getConnection();
        const [analytics] = await connection.execute(
            'SELECT * FROM analytics WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
        );
        return analytics;
    }
};

// Initialize database
const initializeDatabase = async () => {
    try {
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }

        // Clean expired tokens and old cache on startup
        await userOperations.cleanExpiredTokens();
        await cacheOperations.cleanOldCache();
        
        console.log('✅ Database initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
};

// Close database connections
const closeDatabase = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✅ Database connections closed');
    }
};

module.exports = {
    createPool,
    getConnection,
    testConnection,
    initializeDatabase,
    closeDatabase,
    userOperations,
    subjectOperations,
    cacheOperations,
    analyticsOperations
}; 