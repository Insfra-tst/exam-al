const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// In-memory user storage (replace with database in production)
const users = new Map();
const verificationTokens = new Map();

// Export verificationTokens for external access
module.exports.verificationTokens = verificationTokens;

// Email transporter
const createTransporter = () => {
    // Skip email configuration if not set
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email configuration not found, skipping email setup');
        return null;
    }
    
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'default_jwt_secret_change_in_production', { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_change_in_production');
    } catch (error) {
        return null;
    }
};

// Hash password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
    // Skip email sending if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email not configured, skipping verification email');
        return true; // Return true to avoid blocking signup
    }

    const transporter = createTransporter();
    if (!transporter) {
        console.log('⚠️  Email transporter not available, skipping verification email');
        return true; // Return true to avoid blocking signup
    }

    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3002'}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        html: `
            <h2>Welcome to Exam Pattern Analyzer!</h2>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false; // Return false but don't block signup
    }
};

// Create user
const createUser = async (userData) => {
    const { email, password, name, provider = 'local' } = userData;
    
    // Check if user already exists
    if (users.has(email)) {
        throw new Error('User already exists');
    }

    const userId = uuidv4();
    const hashedPassword = password ? await hashPassword(password) : null;
    
    const user = {
        id: userId,
        email,
        name,
        password: hashedPassword,
        provider,
        verified: provider !== 'local', // OAuth users are pre-verified
        onboardingCompleted: false,
        examData: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    users.set(email, user);

    // Send verification email for local signup (but don't block if it fails)
    if (provider === 'local') {
        const verificationToken = uuidv4();
        verificationTokens.set(verificationToken, {
            email,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (error) {
            console.error('Failed to send verification email, but continuing with signup:', error);
        }
    }

    return user;
};

// Find user by email
const findUserByEmail = (email) => {
    return users.get(email);
};

// Find user by ID
const findUserById = (userId) => {
    for (const user of users.values()) {
        if (user.id === userId) {
            return user;
        }
    }
    return null;
};

// Verify email
const verifyEmail = (token) => {
    const verificationData = verificationTokens.get(token);
    if (!verificationData) {
        throw new Error('Invalid or expired verification token');
    }

    if (new Date() > verificationData.expiresAt) {
        verificationTokens.delete(token);
        throw new Error('Verification token has expired');
    }

    const user = findUserByEmail(verificationData.email);
    if (!user) {
        throw new Error('User not found');
    }

    user.verified = true;
    user.updatedAt = new Date();
    verificationTokens.delete(token);

    return user;
};

// Update user onboarding data
const updateUserOnboarding = (userId, examData) => {
    const user = findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    user.examData = examData;
    user.onboardingCompleted = true;
    user.updatedAt = new Date();

    return user;
};

// Subject management
const getUserSubjects = (userId) => {
    const user = findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user.subjects || [];
};

const addUserSubject = (userId, subjectData) => {
    const user = findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!user.subjects) {
        user.subjects = [];
    }

    const subject = {
        id: uuidv4(),
        name: subjectData.name,
        type: subjectData.type,
        createdAt: new Date()
    };

    user.subjects.push(subject);
    user.updatedAt = new Date();

    return subject;
};

const updateUserSubject = (userId, subjectId, subjectData) => {
    const user = findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!user.subjects) {
        throw new Error('No subjects found');
    }

    const subjectIndex = user.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) {
        throw new Error('Subject not found');
    }

    user.subjects[subjectIndex] = {
        ...user.subjects[subjectIndex],
        name: subjectData.name,
        type: subjectData.type,
        updatedAt: new Date()
    };

    user.updatedAt = new Date();
    return user.subjects[subjectIndex];
};

const deleteUserSubject = (userId, subjectId) => {
    const user = findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!user.subjects) {
        throw new Error('No subjects found');
    }

    const subjectIndex = user.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) {
        throw new Error('Subject not found');
    }

    user.subjects.splice(subjectIndex, 1);
    user.updatedAt = new Date();
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = findUserById(decoded.userId);
    if (!user) {
        return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
};

// Check if user is verified (now optional - just for tracking)
const requireVerification = (req, res, next) => {
    // Allow access even if not verified, but track the status
    next();
};

// Check if onboarding is completed
const requireOnboarding = (req, res, next) => {
    if (!req.user.onboardingCompleted) {
        return res.status(403).json({ error: 'Onboarding required' });
    }
    next();
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getUserById: findUserById, // Alias for compatibility
    verifyEmail,
    updateUserOnboarding,
    getUserSubjects,
    addUserSubject,
    updateUserSubject,
    deleteUserSubject,
    authenticateToken,
    requireVerification,
    requireOnboarding,
    generateToken,
    verifyToken,
    comparePassword,
    sendVerificationEmail,
    verificationTokens
}; 