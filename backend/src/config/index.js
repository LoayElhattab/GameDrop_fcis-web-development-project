require('dotenv').config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-fallback-secret-key', // Fallback for safety
    port: process.env.PORT || 3001, // Default port if not in .env
    databaseUrl: process.env.DATABASE_URL,
};