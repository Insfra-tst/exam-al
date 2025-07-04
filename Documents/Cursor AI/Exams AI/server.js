// Load production environment configuration
require('./env-production');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Shared hosting configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// CORS for shared hosting
app.use(cors({
    origin: true,
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: '1.0.0',
        database: process.env.DB_NAME
    });
});

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/auth.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/onboarding.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/onboarding.html'));
});

app.get('/subjects.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/subjects.html'));
});

app.get('/visual-analyzer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/visual-analyzer.html'));
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

// Start server
async function startServer() {
    try {
        console.log('🚀 Starting Exam Pattern Analyzer...');
        console.log('📊 Database:', process.env.DB_NAME);
        console.log('🌐 Base URL:', process.env.BASE_URL);
        
        app.listen(PORT, HOST, () => {
            console.log('🚀 Server running on', HOST + ':' + PORT);
            console.log('🌍 Environment:', process.env.NODE_ENV || 'production');
            console.log('🔐 CORS enabled for all origins');
            console.log('📁 Static files served from public directory');
            console.log('🌐 Health check available at /health');
            console.log('�� Frontend available at /');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
