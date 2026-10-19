import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import supabase from './src/configs/supabase.js';
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import friendshipRoutes from './src/routes/friendshipRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import dmRoutes from './src/routes/dmRoutes.js';
import invitationRoutes from './src/routes/invitationRoutes.js';

const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,  // el panel HTML usa JS inline; la CSP lo bloquearía
  // El backend es una API consumida entre orígenes (cross-origin) desde Vercel/localhost.
  // Estos encabezados por defecto en "same-origin" bloquearían la lectura de
  // las respuestas desde el frontend aunque el CORS esté bien configurado.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));
app.use(cors({
  origin: function (origin, callback) {
    const baseOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://10.152.2.108:5174',
      'http://localhost:3000',
      // Producción en Vercel (estable)
      'https://conect-ar-front-end-xp8c-21w369i2g-conect-ar.vercel.app',
    ];
    const envOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean)
      : [];
    const allowed = [...new Set([...baseOrigins, ...envOrigins])];

    // Permitir peticiones sin origen (ej: Postman, curl, servidor a servidor)
    if (!origin) {
      return callback(null, true);
    }
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    // Permitir cualquier subdominio *.vercel.app del proyecto (vistas previas / despliegues)
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    // Origen no permitido: NO lanzamos error (evita un 500 sin encabezados CORS).
    // Simplemente no agregamos los encabezados CORS y el navegador lo bloqueará.
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  // Asegura respuestas correctas a las verificaciones previas (preflight) OPTIONS
  optionsSuccessStatus: 204,
  preflightContinue: false,
}));
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', dmRoutes);
app.use('/api/invitations', invitationRoutes);

// Verificar conexión con Supabase
supabase.from('_test_').select('*').limit(1).then(({ error }) => {
  // PGRST116 = tabla vacía, 42P01 = tabla no existe → ambos significan que la conexión funciona
  if (!error || error.code === 'PGRST116' || error.code === '42P01' || error.message.includes('schema cache')) {
    console.log('✅ Conectado a Supabase');
  } else {
    console.error('❌ Error conectando a Supabase:', error.message);
  }
});

// Manejo centralizado de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT} (accesible en la red local)`);
});
