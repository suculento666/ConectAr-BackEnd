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

  // Notificar al que envió la solicitud (user_id) que fue aceptado
  pool.query(
    `INSERT INTO notifications (user_id, type, actor_id)
     VALUES ($1, 'friend_request_accepted', $2)`,
    [user_id, friend_id]
  ).catch(err => console.error('⚠️ No se pudo crear notificación de amistad aceptada:', err.message));

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
  // Formato legacy (no rompe el frontend existente)
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

// ── Funciones para las rutas nuevas del front ─────────────────────────────

/**
 * Enviar solicitud usando receiver_id como nombre del campo.
 * Reutiliza sendRequest internamente (user_id = sender, friend_id = receiver).
 * Dispara notificación friend_request al receptor.
 */
const sendRequestByReceiver = async ({ sender_id, receiver_id }) => {
  if (sender_id === receiver_id) throw new Error('No podés agregarte a vos mismo');
  const existing = await getFriendshipStatus({ user_id: sender_id, friend_id: receiver_id });
  if (existing) throw new Error('Ya existe una relación con este usuario');
  const { rows } = await pool.query(
    `INSERT INTO friendships (user_id, friend_id, status)
     VALUES ($1, $2, 'pending')
     RETURNING *`,
    [sender_id, receiver_id]
  );

  // Notificar al receptor de forma no bloqueante — si falla no interrumpe el flujo
  pool.query(
    `INSERT INTO notifications (user_id, type, actor_id)
     VALUES ($1, 'friend_request', $2)`,
    [receiver_id, sender_id]
  ).catch(() => {});

  return rows[0];
};

/**
 * Solicitudes pendientes recibidas — formato nuevo del front:
 * { id, sender_id, sender: { id, full_name, username, avatar_url }, created_at }
 */
const getPendingRequestsNew = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT f.id, f.user_id AS sender_id, f.created_at,
            u.id AS u_id, u.username, u.full_name, u.avatar_url
     FROM friendships f
     JOIN users u ON u.id = f.user_id
     WHERE f.friend_id = $1
       AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [user_id]
  );
  return rows.map(r => ({
    id:         r.id,
    sender_id:  r.sender_id,
    sender: {
      id:         r.u_id,
      full_name:  r.full_name,
      username:   r.username,
      avatar_url: r.avatar_url,
    },
    created_at: r.created_at,
  }));
};

/**
 * Aceptar solicitud por ID de fila (friendships.id).
 * Verifica que el receptor sea el usuario logueado.
 * Emite notificación 'friend_request_accepted' al que envió la solicitud.
 */
const acceptRequestById = async ({ friendship_id, current_user_id }) => {
  const { rows } = await pool.query(
    `UPDATE friendships
     SET status = 'accepted', updated_at = NOW()
     WHERE id = $1
       AND friend_id = $2
       AND status = 'pending'
     RETURNING *`,
    [friendship_id, current_user_id]
  );
  if (!rows[0]) throw new Error('Solicitud no encontrada o no tenés permiso para aceptarla');

  // Notificar al que envió la solicitud (user_id) que fue aceptado
  const sender_id = rows[0].user_id;
  pool.query(
    `INSERT INTO notifications (user_id, type, actor_id)
     VALUES ($1, 'friend_request_accepted', $2)`,
    [sender_id, current_user_id]
  ).catch(err => console.error('⚠️ No se pudo crear notificación de amistad aceptada:', err.message));

  return rows[0];
};

/**
 * Rechazar solicitud por ID de fila (friendships.id).
 * Verifica que el receptor sea el usuario logueado.
 */
const rejectRequestById = async ({ friendship_id, current_user_id }) => {
  const { rowCount } = await pool.query(
    `DELETE FROM friendships
     WHERE id = $1
       AND friend_id = $2
       AND status = 'pending'`,
    [friendship_id, current_user_id]
  );
  if (!rowCount) throw new Error('Solicitud no encontrada o no tenés permiso para rechazarla');
  return { message: 'Solicitud rechazada' };
};

export {
  sendRequest, acceptRequest, removeFriendship, getFriendshipStatus, getAcceptedFriends, getPendingRequests,
  sendRequestByReceiver, getPendingRequestsNew, acceptRequestById, rejectRequestById,
};
