const express = require('express');
const app = express();
const config = require('./src/config');
const workerRoutes = require('./src/routes/workerRoutes');

app.use(express.json());

// Rutas
app.use('/api/workers', workerRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Shifter Backend is running');
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
