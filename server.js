require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const workerRoutes = require('./src/routes/workerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const protectRoute = require('./src/middlewares/authMiddleware');
const workerTypeRoutes = require('./src/routes/workerTypeRoutes');

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workers', protectRoute, workerRoutes);
app.use('/api/workerTypes', workerTypeRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
