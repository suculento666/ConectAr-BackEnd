// achievement.repository.js - logros del usuario
import pool from '../configs/db.js';

// Definición de todos los logros posibles
// condition_type: 'join_count' | 'create_count' | 'like_count' | 'rate_count' | 'profile_complete'
export const ACHIEVEMENTS = [
  {
    id: 'primer_evento',
    name: 'Primer paso',
    description: 'Te uniste a tu primer evento',
    icon: '🎉',
    condition_type: 'join_count',
    condition_value: 1,
  },
  {
    id: 'explorador',
    name: 'Explorador',
    description: 'Te uniste a 5 eventos',
    icon: '🗺️',
    condition_type: 'join_count',
    condition_value: 5,
  },
  {
    id: 'social',
    name: 'Alma social',
    description: 'Te uniste a 10 eventos',
    icon: '🤝',
    condition_type: 'join_count',
    condition_value: 10,
  },
  {
    id: 'creador',
    name: 'Creador',
    description: 'Creaste tu primer evento',
    icon: '✨',
    condition_type: 'create_count',
    condition_value: 1,
  },
  {
    id: 'anfitrion',
    name: 'Anfitrión',
    description: 'Creaste 3 eventos',
    icon: '🏆',
    condition_type: 'create_count',
    condition_value: 3,
  },
  {
    id: 'critico',
    name: 'Crítico',
    description: 'Calificaste tu primer evento',
    icon: '⭐',
    condition_type: 'rate_count',
    condition_value: 1,
  },
  {
    id: 'likes_10',
    name: 'Fan',
    description: 'Le diste like a 10 eventos',
    icon: '❤️',
    condition_type: 'like_count',
    condition_value: 10,
  },
  {
    id: 'perfil_completo',
    name: 'Perfil completo',
    description: 'Completaste tu bio, avatar y username',
    icon: '👤',
    condition_type: 'profile_complete',
    condition_value: 1,
  },
];

// Trae los logros ya desbloqueados por el usuario
export const getUserAchievements = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT achievement_id, unlocked_at
     FROM user_achievements
     WHERE user_id = $1
     ORDER BY unlocked_at DESC`,
    [user_id]
  );

  // Mergear con la definición para devolver info completa
  return rows
    .map((row) => {
      const def = ACHIEVEMENTS.find((a) => a.id === row.achievement_id);
      if (!def) return null; // logro obsoleto en DB, ignorar
      return { ...def, unlocked_at: row.unlocked_at };
    })
    .filter(Boolean);
};

// Desbloquea un logro si todavía no lo tiene
// Devuelve el logro si fue nuevo, null si ya existía
export const unlockAchievement = async (user_id, achievement_id) => {
  const { rows } = await pool.query(
    `INSERT INTO user_achievements (user_id, achievement_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, achievement_id) DO NOTHING
     RETURNING *`,
    [user_id, achievement_id]
  );
  return rows[0] || null;
};

// Cuenta eventos a los que se unió el usuario
export const countJoins = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total FROM event_participants WHERE user_id = $1`,
    [user_id]
  );
  return parseInt(rows[0].total, 10);
};

// Cuenta eventos creados por el usuario
export const countCreated = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total FROM events WHERE creator_id = $1`,
    [user_id]
  );
  return parseInt(rows[0].total, 10);
};

// Cuenta likes dados por el usuario
export const countLikes = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total FROM event_likes WHERE user_id = $1`,
    [user_id]
  );
  return parseInt(rows[0].total, 10);
};

// Cuenta calificaciones dadas por el usuario
export const countRatings = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total FROM event_ratings WHERE user_id = $1`,
    [user_id]
  );
  return parseInt(rows[0].total, 10);
};

// Verifica si el usuario tiene perfil completo (bio + avatar + username)
export const checkProfileComplete = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT bio, avatar_url, username FROM users WHERE id = $1`,
    [user_id]
  );
  if (!rows[0]) return false;
  const { bio, avatar_url, username } = rows[0];
  return !!(bio && avatar_url && username);
};
