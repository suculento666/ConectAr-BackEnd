import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import supabase from './src/configs/supabase.js';
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import friendshipRoutes from './src/routes/friendshipRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    const baseOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    const envOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
      : [];
    const allowed = [...new Set([...baseOrigins, ...envOrigins])];
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
app.use('/api/friendships', friendshipRoutes);
app.use('/api/notifications', notificationRoutes);

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
