// Repositorio People - sugerencias de personas basadas en eventos compartidos
import pool from '../configs/db.js';

// Devuelve usuarios con los que el usuario comparte al menos un evento,
// excluyendo: el propio usuario, sus amigos actuales y solicitudes pendientes.
const getSuggestions = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.username,
       u.full_name,
       u.bio,
       u.avatar_url,
       u.xp,
       u.level,
       COUNT(DISTINCT ep.event_id)::int AS shared_count,
       JSON_AGG(
         DISTINCT JSONB_BUILD_OBJECT('id', e.id, 'title', e.title, 'event_type', e.event_type)
       ) AS shared_events
     FROM event_participants ep
     JOIN events e ON e.id = ep.event_id
     JOIN users u ON u.id = ep.user_id
     WHERE ep.event_id IN (
       -- eventos donde el usuario logueado participa como participante
       SELECT event_id FROM event_participants WHERE user_id = $1
       UNION
       -- eventos que el usuario logueado creó
       SELECT id FROM events WHERE creator_id = $1
     )
     AND ep.user_id != $1
     -- excluir usuarios que ya tienen cualquier relación (amigo, pendiente, bloqueado)
     AND ep.user_id NOT IN (
       SELECT friend_id FROM friendships WHERE user_id = $1
       UNION
       SELECT user_id FROM friendships WHERE friend_id = $1
     )
     GROUP BY u.id, u.username, u.full_name, u.bio, u.avatar_url, u.xp, u.level
     ORDER BY shared_count DESC`,
    [user_id]
  );
  return rows;
};

export { getSuggestions };
