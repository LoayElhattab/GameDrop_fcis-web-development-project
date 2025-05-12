const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const { port } = require('./src/config');
const { errorMiddleware } = require('./src/middleware/errorMiddleware');
const { protect } = require('./src/middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`GAMEDROP Backend server listening on port ${port}`);
});