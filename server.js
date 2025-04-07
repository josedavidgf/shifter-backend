require('dotenv').config();
const express = require('express');
const app = express();

const workerRoutes = require('./src/routes/workerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes'); // Nuevo enrutado de usuarios
const protectRoute = require('./src/middlewares/authMiddleware');

app.use(express.json());

// Rutas de autenticación (registro, login)
app.use('/api/auth', authRoutes);

// Rutas protegidas (workers)
app.use('/api/workers', protectRoute, workerRoutes);

// Rutas de usuarios (CRUD)
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
