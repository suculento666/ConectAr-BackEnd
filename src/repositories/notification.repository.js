// Repositorio Notifications - lee y escribe en la tabla notifications persistida
import pool from '../configs/db.js';

/**
 * Inserta una notificación.
 * Llamado internamente por otros repositorios/servicios cuando ocurre un evento.
 *
 * @param {string} user_id   - destinatario
 * @param {string} type      - 'like' | 'friend_request' | 'message'
 * @param {string} actor_id  - quién generó la acción
 * @param {string} [event_id] - evento relacionado (opcional)
 */
const insertNotification = async ({ user_id, type, actor_id, event_id = null }) => {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, actor_id, event_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, type, actor_id, event_id]
  );
  return rows[0];
};

/**
 * Trae todas las notificaciones de un usuario, ordenadas por fecha descendente.
 * Hace JOIN con users (actor) y events para devolver el formato completo.
 *
 * Devuelve:
 * [{ id, type, read, created_at, actor: { full_name, username, avatar_url }, event: { id, title } | null }]
 */
const getNotificationsByUser = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT
       n.id,
       n.type,
       n.read,
       n.created_at,
       -- actor
       u.id          AS actor_id,
       u.full_name   AS actor_full_name,
       u.username    AS actor_username,
       u.avatar_url  AS actor_avatar_url,
       -- evento (puede ser NULL)
       e.id          AS event_id,
       e.title       AS event_title
     FROM notifications n
     LEFT JOIN users  u ON u.id = n.actor_id
     LEFT JOIN events e ON e.id = n.event_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC`,
    [user_id]
  );

  return rows.map(r => ({
    id:         r.id,
    type:       r.type,
    read:       r.read,
    created_at: r.created_at,
    actor: r.actor_id ? {
      full_name:  r.actor_full_name,
      username:   r.actor_username,
      avatar_url: r.actor_avatar_url,
    } : null,
    event: r.event_id ? {
      id:    r.event_id,
      title: r.event_title,
    } : null,
  }));
};

/**
 * Marca una notificación como leída.
 * Verifica que pertenezca al usuario que hace el request.
 */
const markNotificationAsRead = async ({ notification_id, user_id }) => {
  const { rowCount } = await pool.query(
    `UPDATE notifications
     SET read = true
     WHERE id = $1 AND user_id = $2`,
    [notification_id, user_id]
  );
  if (!rowCount) throw new Error('Notificación no encontrada o no tenés permiso');
  return { message: 'Notificación marcada como leída' };
};

export { insertNotification, getNotificationsByUser, markNotificationAsRead };
