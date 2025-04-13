require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const workerRoutes = require('./src/routes/workerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const protectRoute = require('./src/middlewares/authMiddleware');
const workerTypeRoutes = require('./src/routes/workerTypeRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const specialityRoutes = require('./src/routes/specialityRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');
const swapRoutes = require('./src/routes/swapRoutes');


// Configurar CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://shifter-frontend-preproduction-3dc7.up.railway.app' // pon tu dominio exacto
    'https://shifter-frontend-production.up.railway.app'
  ],
  credentials: true
}));


app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workers', protectRoute, workerRoutes);
app.use('/api/workerTypes', workerTypeRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/specialities', specialityRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/swaps', swapRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


