// Production Environment Configuration for elaraix.com/exam
require('dotenv').config();

// Database Configuration
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'iextqmxf_exams';
process.env.DB_PASSWORD = 'D#3ItY3za(BZ';
process.env.DB_NAME = 'iextqmxf_exams';
process.env.DB_PORT = '3306';

// OpenAI Configuration (Required)
process.env.OPENAI_API_KEY = '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';

// JWT Configuration
process.env.JWT_SECRET = 'elaraix_exam_analyzer_jwt_secret_2024_secure_key_change_in_production';

// Server Configuration
process.env.PORT = '3000';
process.env.NODE_ENV = 'production';
process.env.HOST = '0.0.0.0';

// Base URL
process.env.BASE_URL = 'https://elaraix.com/exam';

// Email Configuration (Optional - can be configured later)
process.env.EMAIL_HOST = 'smtp.gmail.com';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'your_email@gmail.com';
process.env.EMAIL_PASS = 'your_email_app_password';

// Token Configuration
process.env.TOKEN_PRICE_USD = '10.00';
process.env.TOKENS_PER_PURCHASE = '300';
process.env.TOKEN_VALIDITY_DAYS = '365';
process.env.TOKEN_COST_SUBJECT_ANALYSIS = '15';
process.env.TOKEN_COST_TOPIC_ANALYSIS = '20';
process.env.TOKEN_COST_VISUAL_DATA = '25';
process.env.TOKEN_COST_EXAM_VALIDATION = '10';
process.env.TOKEN_COST_SUBJECT_GENERATION = '12';

// Security
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Frontend URL
process.env.FRONTEND_URL = 'https://elaraix.com/exam';
process.env.CLIENT_URL = 'https://elaraix.com/exam';

// Logging
process.env.LOG_LEVEL = 'info';
process.env.LOG_FILE = 'logs/app.log';

// Payment Gateway (for fake payments)
process.env.FAKE_PAYMENT_ENABLED = 'true';
process.env.FAKE_PAYMENT_SUCCESS_RATE = '0.95';

console.log('✅ Production environment configured for elaraix.com/exam');
console.log('📊 Database:', process.env.DB_NAME);
console.log('🌐 Base URL:', process.env.BASE_URL);
console.log('🔐 JWT Secret configured');
console.log('🤖 OpenAI API configured'); 