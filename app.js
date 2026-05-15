import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import db from './src/configs/db.js';
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'ConectAr API funcionando' });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
