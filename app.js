import express from 'express';
import cors from 'cors';
import supabase from './src/configs/supabase.js';
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    const allowed = (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map(u => u.trim());
    // Permitir también requests sin origin (ej: Postman, curl)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origen no permitido → ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT} (accesible en la red local)`);
});
