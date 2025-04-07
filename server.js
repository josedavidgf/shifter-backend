require('dotenv').config();
const express = require('express');
const app = express();

const workerRoutes = require('./src/routes/workerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const protectRoute = require('./src/middlewares/authMiddleware');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workers', protectRoute, workerRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
