// Repositorio de mensajes directos (DMs) entre usuarios
import pool from '../configs/db.js';

/**
 * Envía un mensaje directo de sender a receiver.
 * Devuelve el mensaje con los datos del sender incluidos.
 */
const sendDM = async ({ sender_id, receiver_id, content }) => {
  const { rows } = await pool.query(
    `WITH inserted AS (
       INSERT INTO direct_messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *
     )
     SELECT
       i.id,
       i.sender_id,
       i.receiver_id,
       i.content,
       i.read,
       i.created_at,
       u.username,
       u.full_name,
       u.avatar_url
     FROM inserted i
     JOIN users u ON u.id = i.sender_id`,
    [sender_id, receiver_id, content]
  );
  return rows[0];
};

/**
 * Devuelve los mensajes de la conversación entre dos usuarios,
 * ordenados de más viejo a más nuevo.
 * Soporta paginación por cursor (before_id).
 */
const getConversation = async ({ user_a, user_b, limit = 50, before_id = null }) => {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);

  let query;
  let params;

  if (before_id) {
    query = `
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.read,
        m.created_at,
        u.username,
        u.full_name,
        u.avatar_url
      FROM direct_messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (
        (m.sender_id = $1 AND m.receiver_id = $2) OR
        (m.sender_id = $2 AND m.receiver_id = $1)
      )
      AND m.created_at < (
        SELECT created_at FROM direct_messages WHERE id = $3
      )
      ORDER BY m.created_at DESC
      LIMIT $4
    `;
    params = [user_a, user_b, before_id, safeLimit];
  } else {
    query = `
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.read,
        m.created_at,
        u.username,
        u.full_name,
        u.avatar_url
      FROM direct_messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (
        (m.sender_id = $1 AND m.receiver_id = $2) OR
        (m.sender_id = $2 AND m.receiver_id = $1)
      )
      ORDER BY m.created_at DESC
      LIMIT $3
    `;
    params = [user_a, user_b, safeLimit];
  }

  const { rows } = await pool.query(query, params);

  return rows.reverse().map(r => ({
    id:          r.id,
    sender_id:   r.sender_id,
    receiver_id: r.receiver_id,
    content:     r.content,
    read:        r.read,
    created_at:  r.created_at,
    sender: {
      id:         r.sender_id,
      username:   r.username,
      full_name:  r.full_name,
      avatar_url: r.avatar_url,
    },
  }));
};

/**
 * Lista de conversaciones del usuario: una entrada por cada persona
 * con la que habló, mostrando el último mensaje y los no leídos.
 */
const getInbox = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (other_id)
       other_id,
       m.id          AS last_message_id,
       m.content     AS last_content,
       m.created_at  AS last_at,
       m.sender_id,
       m.read,
       u.username,
       u.full_name,
       u.avatar_url,
       (
         SELECT COUNT(*) FROM direct_messages
         WHERE receiver_id = $1
           AND sender_id = other_id
           AND read = false
       )::int AS unread_count
     FROM direct_messages m
     JOIN LATERAL (
       SELECT CASE
         WHEN m.sender_id = $1 THEN m.receiver_id
         ELSE m.sender_id
       END AS other_id
     ) sub ON true
     JOIN users u ON u.id = other_id
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY other_id, m.created_at DESC`,
    [user_id]
  );

  return rows.map(r => ({
    user: {
      id:         r.other_id,
      username:   r.username,
      full_name:  r.full_name,
      avatar_url: r.avatar_url,
    },
    last_message: {
      id:         r.last_message_id,
      content:    r.last_content,
      created_at: r.last_at,
      is_mine:    r.sender_id === user_id,
      read:       r.read,
    },
    unread_count: r.unread_count,
  }));
};

/**
 * Marca como leídos todos los mensajes que el otro usuario le envió al usuario actual.
 */
const markConversationRead = async ({ reader_id, sender_id }) => {
  await pool.query(
    `UPDATE direct_messages
     SET read = true
     WHERE receiver_id = $1 AND sender_id = $2 AND read = false`,
    [reader_id, sender_id]
  );
};

/**
 * Elimina un mensaje. Solo lo puede borrar su autor.
 */
const deleteDM = async ({ message_id, user_id }) => {
  const { rowCount } = await pool.query(
    `DELETE FROM direct_messages WHERE id = $1 AND sender_id = $2`,
    [message_id, user_id]
  );
  if (!rowCount) throw new Error('Mensaje no encontrado o no tenés permiso para eliminarlo');
};

export { sendDM, getConversation, getInbox, markConversationRead, deleteDM };
