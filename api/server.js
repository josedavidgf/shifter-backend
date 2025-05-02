require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Rutas existentes
const workerRoutes = require('./src/routes/workerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const protectRoute = require('./src/middlewares/authMiddleware');
const workerTypeRoutes = require('./src/routes/workerTypeRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const specialityRoutes = require('./src/routes/specialityRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');
const swapRoutes = require('./src/routes/swapRoutes');
const userPreferencesRoutes = require('./src/routes/userPreferencesRoutes');
const accessCodeRoutes = require('./src/routes/accessCodeRoutes');
const swapPreferencesRoutes = require('./src/routes/swapPreferencesRoutes');
const gptShiftsRoutes = require('./src/routes/gptshifts'); // 🆕 Añadido
const supportRoutes = require('./src/routes/supportRoutes');

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: function (origin, callback) {
    // Permite peticiones sin origen (como Postman) o si el origen está permitido
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));


// Middleware JSON
app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/workers', protectRoute, workerRoutes);
app.use('/api/workerTypes', workerTypeRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/specialities', specialityRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/preferences', userPreferencesRoutes);
app.use('/api/access-codes', accessCodeRoutes);
app.use('/api/swap-preferences', swapPreferencesRoutes);
app.use('/api/gpt-shifts', gptShiftsRoutes); // 🧠 GPT endpoint
app.use('/api/support', supportRoutes);


// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
