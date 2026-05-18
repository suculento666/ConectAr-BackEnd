import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import supabase from './src/configs/supabase.js';
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
app.get('/', (_req, res) => {
  res.json({ message: 'ConectAr API funcionando' });
});

// Verificar conexión con Supabase
supabase.from('_test_').select('*').limit(1).then(({ error }) => {
  // PGRST116 = tabla vacía, 42P01 = tabla no existe → ambos significan que la conexión funciona
  if (!error || error.code === 'PGRST116' || error.code === '42P01' || error.message.includes('schema cache')) {
    console.log('✅ Conectado a Supabase');
  } else {
    console.error('❌ Error conectando a Supabase:', error.message);
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
