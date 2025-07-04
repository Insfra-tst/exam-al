require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const authRoutes = require('./auth-routes');
const paymentRoutes = require('./payment-routes');
const onboarding = require('./onboarding');
const auth = require('./auth-mysql'); // Use MySQL version
const { initializeDatabase, closeDatabase } = require('./database');

const app = express();

// Environment configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await auth.findUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.verified) {
            return done(null, false, { message: 'Please verify your email first' });
        }

        const isValidPassword = await auth.comparePassword(password, user.password);
        if (!isValidPassword) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await auth.findUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Routes
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);

// API Routes
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'running', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/onboarding.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'onboarding.html'));
});

app.get('/subjects.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'subjects.html'));
});

app.get('/visual-analyzer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'visual-analyzer.html'));
});

app.get('/debug-onboarding.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-onboarding.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

// Initialize and start server
const startServer = async () => {
    try {
        // Initialize database
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.error('❌ Failed to initialize database. Exiting...');
            process.exit(1);
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${NODE_ENV}`);
            console.log(`📧 Email verification: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled'}`);
            console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Enabled' : 'Disabled'}`);
            console.log(`📘 Facebook OAuth: ${process.env.FACEBOOK_APP_ID ? 'Enabled' : 'Disabled'}`);
            console.log(`🧠 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Connected' : 'Not configured'}`);
            console.log(`💾 MySQL Database: Connected`);
            
            if (NODE_ENV === 'development') {
                console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
            } else {
                console.log(`🌐 Application deployed successfully!`);
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 