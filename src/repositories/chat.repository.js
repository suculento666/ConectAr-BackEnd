// Repositorio Chat - mensajes del chat grupal por evento
import pool from '../configs/db.js';

/**
 * Verifica si un usuario es participante o creador de un evento.
 * Se usa para autorizar el envío de mensajes.
 */
const isParticipantOrCreator = async ({ user_id, event_id }) => {
  const { rows } = await pool.query(
    `SELECT 1
     FROM events
     WHERE id = $1 AND creator_id = $2
     UNION ALL
     SELECT 1
     FROM event_participants
     WHERE event_id = $1 AND user_id = $2
     LIMIT 1`,
    [event_id, user_id]
  );
  return rows.length > 0;
};

/**
 * Inserta un nuevo mensaje en el chat de un evento.
 * Devuelve el mensaje con los datos del autor incluidos.
 */
const createMessage = async ({ event_id, user_id, content }) => {
  const { rows } = await pool.query(
    `WITH inserted AS (
       INSERT INTO event_messages (event_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *
     )
     SELECT
       i.id,
       i.event_id,
       i.content,
       i.created_at,
       u.id         AS user_id,
       u.username,
       u.full_name,
       u.avatar_url
     FROM inserted i
     JOIN users u ON u.id = i.user_id`,
    [event_id, user_id, content]
  );
  return rows[0];
};

/**
 * Trae los mensajes de un evento, ordenados de más viejo a más nuevo.
 * Soporta paginación por cursor (before_id) para cargar mensajes anteriores.
 *
 * @param {string}  event_id  - UUID del evento
 * @param {number}  limit     - cantidad de mensajes a traer (default 50, máx 100)
 * @param {string}  before_id - UUID del mensaje; trae solo los anteriores a ese (opcional)
 */
const getMessages = async ({ event_id, limit = 50, before_id = null }) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);

  let query;
  let params;

  if (before_id) {
    // Paginación hacia atrás: mensajes anteriores al cursor
    query = `
      SELECT
        m.id,
        m.event_id,
        m.content,
        m.created_at,
        u.id         AS user_id,
        u.username,
        u.full_name,
        u.avatar_url
      FROM event_messages m
      JOIN users u ON u.id = m.user_id
      WHERE m.event_id = $1
        AND m.created_at < (
          SELECT created_at FROM event_messages WHERE id = $2
        )
      ORDER BY m.created_at DESC
      LIMIT $3
    `;
    params = [event_id, before_id, safeLimit];
  } else {
    // Primera carga: los últimos N mensajes
    query = `
      SELECT
        m.id,
        m.event_id,
        m.content,
        m.created_at,
        u.id         AS user_id,
        u.username,
        u.full_name,
        u.avatar_url
      FROM event_messages m
      JOIN users u ON u.id = m.user_id
      WHERE m.event_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2
    `;
    params = [event_id, safeLimit];
  }

  const { rows } = await pool.query(query, params);

  // Normalizar: devolver siempre de más viejo a más nuevo
  const messages = rows.reverse().map(r => ({
    id:         r.id,
    event_id:   r.event_id,
    content:    r.content,
    created_at: r.created_at,
    user: {
      id:          r.user_id,
      username:    r.username,
      full_name:   r.full_name,
      avatar_url:  r.avatar_url,
    },
  }));

  return messages;
};

/**
 * Elimina un mensaje. Solo lo puede borrar su autor.
 */
const deleteMessage = async ({ message_id, user_id }) => {
  const { rowCount } = await pool.query(
    `DELETE FROM event_messages WHERE id = $1 AND user_id = $2`,
    [message_id, user_id]
  );
  if (!rowCount) throw new Error('Mensaje no encontrado o no tenés permiso para eliminarlo');
  return { message: 'Mensaje eliminado' };
};

export { isParticipantOrCreator, createMessage, getMessages, deleteMessage };
