// backend/server.js (simplified example)
const express = require('express');
const cors = require('cors');
//const mainRouter = require('./src/routes'); // Assuming src/routes/index.js exports your combined routes
const { port } = require('./src/config');
const { errorMiddleware } = require('./src/middleware/errorMiddleware'); // Assuming you have one

const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/api', (req, res) => { // Basic test route
    res.json({ message: 'Welcome to GAMEDROP API!' });
});

//app.use('/api', mainRouter); // Mount your main application routes

// Global error handler (must be last)
//app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`GAMEDROP Backend server listening on port ${port}`);
});