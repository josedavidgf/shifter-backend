require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const workerRoutes = require('./src/routes/workerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const protectRoute = require('./src/middlewares/authMiddleware');

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000', // Permitir el frontend local
  credentials: true, // Permitir envío de cookies y headers de autenticación
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', protectRoute, workerRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
