// Load production environment configuration
require('./env-production');
const express = require('express');
const cors = require('cors');
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

// Shared hosting configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// CORS for shared hosting
app.use(cors({
    origin: true, // Allow all origins for shared hosting
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

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

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/auth.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/onboarding.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/onboarding.html'));
});

app.get('/subjects.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/subjects.html'));
});

app.get('/visual-analyzer.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/visual-analyzer.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
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
        app.listen(PORT, HOST, () => {
            console.log('🚀 Shared hosting server running on', HOST + ':' + PORT);
            console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
            console.log('🔐 CORS enabled for all origins');
            console.log('📁 Static files served from public directory');
            console.log('🌐 Health check available at /health');
            console.log('📱 Frontend available at /');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 