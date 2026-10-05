// Repositorio User - acceso a la base de datos (tabla: users + auth)
import supabase from '../configs/supabase.js';
import pool    from '../configs/db.js';

// Auth: registro con email/password, los metadatos van al trigger
const signUp = async ({ email, password, username, full_name, bio, avatar_url, birth_date }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name, bio, avatar_url, birth_date }
    }
  });
  if (error) throw new Error(error.message);
  return data;
};

// Auth: login con email/password, devuelve session + user
const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
};

// Perfil: trae todos los usuarios de public.users
const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date, created_at');
  if (error) throw new Error(error.message);
  return data;
};

// Perfil: trae un usuario por id
const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date, created_at')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Perfil: actualiza datos del perfil (no toca auth)
const updateUser = async (id, fields) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date')
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Auth: cierra sesión del usuario actual
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

// Perfil: busca usuarios por username o full_name (búsqueda parcial)
const searchUsersByUsername = async (query) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date, created_at')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
  if (error) throw new Error(error.message);
  return data;
};

// Participaciones: trae los eventos en los que participa un usuario
const getUserEvents = async (user_id) => {
  const { data, error } = await supabase
    .from('event_participants')
    .select('event_id')
    .eq('user_id', user_id);
  if (error) throw new Error(error.message);
  return data;
};

// Eventos pasados a los que asistió un usuario (para GET /users/:id/events/attended)
const getAttendedEvents = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT
       e.id,
       e.title,
       e.event_date,
       e.event_type
     FROM event_participants ep
     JOIN events e ON e.id = ep.event_id
     WHERE ep.user_id = $1
       AND e.event_date < NOW()
     ORDER BY e.event_date DESC`,
    [user_id]
  );
  return rows;
};

// Auth: envía email de recuperación de contraseña
const sendPasswordReset = async ({ email, redirectTo }) => {
  const redirect = redirectTo || `${process.env.FRONTEND_URL}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirect,
  });
  if (error) throw new Error(error.message);
};

// Auth: actualiza la contraseña del usuario usando su access_token de sesión
const updatePassword = async ({ accessToken, newPassword }) => {
  const { createClient } = await import('@supabase/supabase-js');
  const userClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data, error } = await userClient.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return data;
};

// --- Logros ---

/**
 * Calcula los logros del usuario en tiempo real contra las tablas existentes.
 * Devuelve los 6 logros definidos con su estado unlocked y el progreso actual.
 */
const getAchievements = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM event_participants WHERE user_id = $1)                                             AS participations,
       (SELECT COUNT(*)::int FROM friendships        WHERE (user_id = $1 OR friend_id = $1) AND status = 'accepted') AS friends,
       (SELECT COUNT(*)::int FROM events             WHERE creator_id = $1)                                         AS events_created,
       (SELECT COUNT(*)::int FROM event_comments     WHERE user_id = $1)                                            AS comments
    `,
    [user_id]
  );

  const { participations, friends, events_created, comments } = rows[0];

  const achievements = [
    {
      id:          'primer_paso',
      name:        'Primer paso',
      description: 'Participá en tu primer evento',
      icon:        '🎉',
      unlocked:    participations >= 1,
      progress:    Math.min(participations, 1),
      goal:        1,
    },
    {
      id:          'explorador',
      name:        'Explorador',
      description: 'Participá en 5 eventos',
      icon:        '🗺️',
      unlocked:    participations >= 5,
      progress:    Math.min(participations, 5),
      goal:        5,
    },
    {
      id:          'veterano',
      name:        'Veterano',
      description: 'Participá en 10 eventos',
      icon:        '🏆',
      unlocked:    participations >= 10,
      progress:    Math.min(participations, 10),
      goal:        10,
    },
    {
      id:          'social',
      name:        'Social',
      description: 'Hacé 3 amigos',
      icon:        '🤝',
      unlocked:    friends >= 3,
      progress:    Math.min(friends, 3),
      goal:        3,
    },
    {
      id:          'organizador',
      name:        'Organizador',
      description: 'Creá tu primer evento',
      icon:        '📋',
      unlocked:    events_created >= 1,
      progress:    Math.min(events_created, 1),
      goal:        1,
    },
    {
      id:          'critico',
      name:        'Crítico',
      description: 'Escribí 3 comentarios en eventos',
      icon:        '💬',
      unlocked:    comments >= 3,
      progress:    Math.min(comments, 3),
      goal:        3,
    },
  ];

  return {
    user_id,
    unlocked_count: achievements.filter(a => a.unlocked).length,
    total:          achievements.length,
    achievements,
  };
};

export {
  signUp,
  signIn,
  signOut,
  getAllUsers,
  getUserById,
  updateUser,
  searchUsersByUsername,
  getUserEvents,
  getAttendedEvents,
  sendPasswordReset,
  updatePassword,
  getAchievements,
};
