require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import modules
const auth = require('./auth-mysql');
const database = require('./database');
const tokenManager = require('./token-manager');
const paymentProcessor = require('./payment-processor');

// Import routes
const authRoutes = require('./auth-routes');
const paymentRoutes = require('./payment-routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.openai.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3004',
            // Add your shared hosting domain here
            'https://yourdomain.com',
            'https://www.yourdomain.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// API routes
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);
app.use('/tokens', require('./token-routes'));

// Token balance endpoint
app.get('/tokens/balance', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = await auth.verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userTokens = await tokenManager.getUserTokens(decoded.id);
        res.json({
            success: true,
            tokens: userTokens
        });
    } catch (error) {
        console.error('Error getting token balance:', error);
        res.status(500).json({ error: 'Failed to get token balance' });
    }
});

// Token history endpoint
app.get('/tokens/history', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = await auth.verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const history = await tokenManager.getTokenUsageHistory(decoded.id);
        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        console.error('Error getting token history:', error);
        res.status(500).json({ error: 'Failed to get token history' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS policy violation' });
    }
    
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    database.closeConnections();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    database.closeConnections();
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Initialize database
        await database.initialize();
        console.log('✅ Database initialized successfully');
        
        // Start server
        app.listen(PORT, () => {
            console.log('🚀 Production server running on port', PORT);
            console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
            console.log('🔐 CORS enabled for production domains');
            console.log('🛡️ Security middleware enabled');
            console.log('📊 Rate limiting enabled');
            console.log('🌐 Health check available at /health');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 