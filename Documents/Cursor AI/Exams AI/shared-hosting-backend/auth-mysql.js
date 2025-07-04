const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { userOperations, subjectOperations } = require('./database');

// Email transporter
const createTransporter = () => {
    // Skip email configuration if not set
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email configuration not found, skipping email setup');
        return null;
    }
    
    return nodemailer.createTransporter({
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

    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
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
    
    // Auto-verify users in development mode
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const autoVerify = isDevelopment || provider !== 'local';
    
    const hashedPassword = password ? await hashPassword(password) : null;
    
    const user = await userOperations.createUser({
        email,
        password: hashedPassword,
        name,
        provider,
        verified: autoVerify ? 1 : 0
    });

    // Send verification email for local signup in production (but don't block if it fails)
    if (provider === 'local' && !autoVerify) {
        const verificationToken = uuidv4();
        await userOperations.createVerificationToken(email, verificationToken);
        
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (error) {
            console.error('Failed to send verification email, but continuing with signup:', error);
        }
    }

    return user;
};

// Find user by email
const findUserByEmail = async (email) => {
    return await userOperations.findUserByEmail(email);
};

// Find user by ID
const findUserById = async (userId) => {
    return await userOperations.findUserById(userId);
};

// Verify email
const verifyEmail = async (token) => {
    return await userOperations.verifyEmail(token);
};

// Update user onboarding data
const updateUserOnboarding = async (userId, examData) => {
    return await userOperations.updateUserOnboarding(userId, examData);
};

// Subject management
const getUserSubjects = async (userId) => {
    return await subjectOperations.getUserSubjects(userId);
};

const addUserSubject = async (userId, subjectData) => {
    return await subjectOperations.addUserSubject(userId, subjectData);
};

const updateUserSubject = async (userId, subjectId, subjectData) => {
    return await subjectOperations.updateUserSubject(userId, subjectId, subjectData);
};

const deleteUserSubject = async (userId, subjectId) => {
    return await subjectOperations.deleteUserSubject(userId, subjectId);
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
        return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
};

// Require verification middleware
const requireVerification = (req, res, next) => {
    if (!req.user.verified) {
        return res.status(403).json({ error: 'Email verification required' });
    }
    next();
};

// Require onboarding middleware
const requireOnboarding = (req, res, next) => {
    if (!req.user.onboarding_completed) {
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
    sendVerificationEmail
}; 