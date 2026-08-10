// Middleware de autenticación - verifica el JWT de Supabase
import { createClient } from '@supabase/supabase-js';

// Cliente con ANON KEY — necesario para que getUser() valide el token
// correctamente. Con SERVICE_ROLE KEY, getUser() ignora el token y siempre
// devuelve el mismo usuario admin.
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data?.user) {
      console.error('❌ JWT inválido:', error?.message);
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = data.user;  // tiene id, email, user_metadata, etc.
    next();
  } catch (err) {
    console.error('❌ Error en authenticate:', err.message);
    return res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};

export { authenticate };