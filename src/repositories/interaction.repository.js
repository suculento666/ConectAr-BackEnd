// Repositorio Interactions - likes, saves y comments sobre eventos
import pool from '../configs/db.js';

// ── LIKES ──────────────────────────────────────────────────────────────────

const likeEvent = async ({ user_id, event_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO event_likes (user_id, event_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, event_id) DO NOTHING
     RETURNING *`,
    [user_id, event_id]
  );
  return rows[0] || { user_id, event_id, already: true };
};

const unlikeEvent = async ({ user_id, event_id }) => {
  await pool.query(
    `DELETE FROM event_likes WHERE user_id = $1 AND event_id = $2`,
    [user_id, event_id]
  );
  return { message: 'like eliminado' };
};

const getLikedEvents = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT e.*, el.created_at AS liked_at
     FROM event_likes el
     JOIN events e ON e.id = el.event_id
     WHERE el.user_id = $1
     ORDER BY el.created_at DESC`,
    [user_id]
  );
  return rows;
};

// Todos los likes de un evento (para GET /events/:id/like)
const getEventLikes = async (event_id) => {
  const { rows } = await pool.query(
    `SELECT user_id FROM event_likes WHERE event_id = $1`,
    [event_id]
  );
  return rows; // [{ user_id }, { user_id }, ...]
};

// Contar likes de un evento y si el usuario lo likeó
const getEventLikeStatus = async ({ user_id, event_id }) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       BOOL_OR(user_id = $1) AS liked
     FROM event_likes
     WHERE event_id = $2`,
    [user_id, event_id]
  );
  return { total: parseInt(rows[0].total), liked: rows[0].liked };
};

// Estado de likes para múltiples eventos de una sola query
const getBulkLikeStatus = async ({ user_id, event_ids }) => {
  if (!event_ids.length) return {};
  const { rows } = await pool.query(
    `SELECT
       event_id,
       COUNT(*) AS total,
       BOOL_OR(user_id = $1) AS liked
     FROM event_likes
     WHERE event_id = ANY($2::uuid[])
     GROUP BY event_id`,
    [user_id, event_ids]
  );
  const map = {};
  rows.forEach(r => {
    map[r.event_id] = { total: parseInt(r.total), liked: r.liked };
  });
  return map;
};

// ── SAVES ──────────────────────────────────────────────────────────────────

const saveEvent = async ({ user_id, event_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO event_saves (user_id, event_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, event_id) DO NOTHING
     RETURNING *`,
    [user_id, event_id]
  );
  return rows[0] || { user_id, event_id, already: true };
};

const unsaveEvent = async ({ user_id, event_id }) => {
  await pool.query(
    `DELETE FROM event_saves WHERE user_id = $1 AND event_id = $2`,
    [user_id, event_id]
  );
  return { message: 'Guardado eliminado' };
};

const getSavedEvents = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT e.*, es.created_at AS saved_at
     FROM event_saves es
     JOIN events e ON e.id = es.event_id
     WHERE es.user_id = $1
     ORDER BY es.created_at DESC`,
    [user_id]
  );
  return rows;
};

// Estado de saves para múltiples eventos
const getBulkSaveStatus = async ({ user_id, event_ids }) => {
  if (!event_ids.length) return {};
  const { rows } = await pool.query(
    `SELECT event_id
     FROM event_saves
     WHERE user_id = $1 AND event_id = ANY($2::uuid[])`,
    [user_id, event_ids]
  );
  const map = {};
  rows.forEach(r => { map[r.event_id] = true; });
  return map;
};

// ── COMMENTS ───────────────────────────────────────────────────────────────

const addComment = async ({ user_id, event_id, content }) => {
  const { rows } = await pool.query(
    `INSERT INTO event_comments (user_id, event_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, event_id, content]
  );
  return rows[0];
};

const getComments = async (event_id) => {
  const { rows } = await pool.query(
    `SELECT ec.id, ec.content, ec.created_at,
            u.id AS user_id, u.username, u.full_name, u.avatar_url
     FROM event_comments ec
     JOIN users u ON u.id = ec.user_id
     WHERE ec.event_id = $1
     ORDER BY ec.created_at ASC`,
    [event_id]
  );
  return rows.map(r => ({
    id: r.id,
    content: r.content,
    created_at: r.created_at,
    user: {
      id: r.user_id,
      username: r.username,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
    }
  }));
};

const deleteComment = async ({ comment_id, user_id }) => {
  const { rowCount } = await pool.query(
    `DELETE FROM event_comments WHERE id = $1 AND user_id = $2`,
    [comment_id, user_id]
  );
  if (!rowCount) throw new Error('Comentario no encontrado o no tenés permiso para eliminarlo');
  return { message: 'Comentario eliminado' };
};

export {
  likeEvent, unlikeEvent, getLikedEvents, getEventLikes, getEventLikeStatus, getBulkLikeStatus,
  saveEvent, unsaveEvent, getSavedEvents, getBulkSaveStatus,
  addComment, getComments, deleteComment,
};
