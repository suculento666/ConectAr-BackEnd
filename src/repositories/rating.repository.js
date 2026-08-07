// Repositorio Rating - calificaciones de eventos
import pool from '../configs/db.js';

/**
 * Inserta una calificación.
 * Valida previamente:
 *   1. Que el evento ya pasó (event_date < NOW())
 *   2. Que el usuario participó del evento
 *   3. Que no haya calificado antes (lo garantiza también el UNIQUE de la tabla)
 *
 * Lanza errores con mensajes exactos que el controller reenvía al cliente.
 */
const createRating = async ({ event_id, user_id, score }) => {
  // 1. Verificar que el evento existe y ya pasó
  const { rows: eventRows } = await pool.query(
    `SELECT id, event_date FROM events WHERE id = $1 LIMIT 1`,
    [event_id]
  );
  if (!eventRows[0]) throw new Error('Evento no encontrado');
  if (new Date(eventRows[0].event_date) >= new Date()) {
    throw new Error('Solo podés calificar eventos que ya ocurrieron');
  }

  // 2. Verificar que el usuario participó
  const { rows: partRows } = await pool.query(
    `SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2 LIMIT 1`,
    [event_id, user_id]
  );
  if (!partRows.length) throw new Error('No participaste en este evento');

  // 3. Insertar (el UNIQUE dispara error si ya calificó)
  try {
    const { rows } = await pool.query(
      `INSERT INTO event_ratings (event_id, user_id, score)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [event_id, user_id, score]
    );
    return rows[0];
  } catch (err) {
    // Código 23505 = unique_violation en PostgreSQL
    if (err.code === '23505') throw new Error('Ya calificaste este evento');
    throw err;
  }
};

/**
 * Promedio y total de calificaciones de un evento.
 * Devuelve { average: 4.2, total: 18 }
 * Si no hay calificaciones devuelve { average: null, total: 0 }
 */
const getEventRating = async (event_id) => {
  const { rows } = await pool.query(
    `SELECT
       ROUND(AVG(score)::numeric, 1) AS average,
       COUNT(*)::int                 AS total
     FROM event_ratings
     WHERE event_id = $1`,
    [event_id]
  );
  return {
    average: rows[0].average !== null ? parseFloat(rows[0].average) : null,
    total:   rows[0].total,
  };
};

/**
 * Devuelve la calificación que el usuario dio a un evento, o null si no calificó.
 * Devuelve { score: 4 } | { score: null }
 */
const getUserRating = async ({ event_id, user_id }) => {
  const { rows } = await pool.query(
    `SELECT score FROM event_ratings WHERE event_id = $1 AND user_id = $2 LIMIT 1`,
    [event_id, user_id]
  );
  return { score: rows[0] ? rows[0].score : null };
};

/**
 * Actualiza la calificación existente de un usuario para un evento.
 * Lanza error si no existe calificación previa.
 */
const updateRating = async ({ event_id, user_id, score }) => {
  const { rows } = await pool.query(
    `UPDATE event_ratings
     SET score = $3
     WHERE event_id = $1 AND user_id = $2
     RETURNING *`,
    [event_id, user_id, score]
  );
  if (!rows.length) throw new Error('No encontramos una calificación previa');
  return rows[0];
};

export { createRating, updateRating, getEventRating, getUserRating };
