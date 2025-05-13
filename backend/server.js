const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require("./src/routes/productRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { port } = require('./src/config');
const { errorMiddleware } = require('./src/middleware/errorMiddleware');
const { protect } = require('./src/middleware/authMiddleware');
const { order } = require('./src/config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/admin', adminRoutes);




// Protected route example
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`GAMEDROP Backend server listening on port ${port}`);
});