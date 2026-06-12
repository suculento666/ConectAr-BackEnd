// Middleware de autenticación - verifica el JWT de Supabase
import supabase from '../configs/supabase.js';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Adjuntamos el usuario al request para usarlo en controllers
  req.user = data.user;
  next();
};

export { authenticate };
