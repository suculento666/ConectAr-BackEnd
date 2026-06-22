// Repositorio Friendship - acceso directo a PostgreSQL (bypasea RLS de Supabase)
// Estructura: id, user_id, friend_id, status (pending|accepted|blocked), created_at, updated_at
import pool from '../configs/db.js';

// Enviar solicitud de amistad (status: pending)
const sendRequest = async ({ user_id, friend_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO friendships (user_id, friend_id, status)
     VALUES ($1, $2, 'pending')
     RETURNING *`,
    [user_id, friend_id]
  );
  return rows[0];
};

// Aceptar solicitud (el friend_id acepta al user_id original)
const acceptRequest = async ({ user_id, friend_id }) => {
  const { rows } = await pool.query(
    `UPDATE friendships
     SET status = 'accepted', updated_at = NOW()
     WHERE user_id = $1 AND friend_id = $2
     RETURNING *`,
    [user_id, friend_id]
  );
  if (!rows[0]) throw new Error('No se encontró la solicitud para aceptar');
  return rows[0];
};

// Eliminar / rechazar amistad (borra el registro en ambas direcciones)
const removeFriendship = async ({ user_id, friend_id }) => {
  await pool.query(
    `DELETE FROM friendships
     WHERE (user_id = $1 AND friend_id = $2)
        OR (user_id = $2 AND friend_id = $1)`,
    [user_id, friend_id]
  );
  return { message: 'Amistad eliminada' };
};

// Obtener el estado de la relación entre dos usuarios
// Devuelve: null | { id, status, direction: 'sent'|'received' }
const getFriendshipStatus = async ({ user_id, friend_id }) => {
  const { rows } = await pool.query(
    `SELECT id, status, user_id, friend_id
     FROM friendships
     WHERE (user_id = $1 AND friend_id = $2)
        OR (user_id = $2 AND friend_id = $1)
     LIMIT 1`,
    [user_id, friend_id]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id,
    status: row.status,
    direction: row.user_id === user_id ? 'sent' : 'received'
  };
};

// Traer todos los amigos aceptados de un usuario (con perfil)
const getAcceptedFriends = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.full_name, u.bio, u.avatar_url, u.xp, u.level
     FROM friendships f
     JOIN users u
       ON u.id = CASE
                   WHEN f.user_id = $1 THEN f.friend_id
                   ELSE f.user_id
                 END
     WHERE (f.user_id = $1 OR f.friend_id = $1)
       AND f.status = 'accepted'`,
    [user_id]
  );
  return rows;
};

// Solicitudes pendientes recibidas por el usuario
const getPendingRequests = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT f.id, f.user_id, f.created_at,
            u.id AS "sender_id", u.username, u.full_name, u.avatar_url
     FROM friendships f
     JOIN users u ON u.id = f.user_id
     WHERE f.friend_id = $1
       AND f.status = 'pending'`,
    [user_id]
  );
  // Formatear igual que antes para no romper el frontend
  return rows.map(r => ({
    id: r.id,
    user_id: r.user_id,
    created_at: r.created_at,
    users: {
      id: r.sender_id,
      username: r.username,
      full_name: r.full_name,
      avatar_url: r.avatar_url
    }
  }));
};

export { sendRequest, acceptRequest, removeFriendship, getFriendshipStatus, getAcceptedFriends, getPendingRequests };
