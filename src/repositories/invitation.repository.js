// Repositorio de invitaciones a eventos privados
import pool from '../configs/db.js';

/**
 * Crea una invitación. Solo el creador del evento puede invitar.
 * Lanza error si el evento no es privado, si el usuario ya fue invitado,
 * o si quien invita no es el creador.
 */
const createInvitation = async ({ event_id, invited_user_id, invited_by }) => {
  // Verificar que el evento existe, es privado y que quien invita es el creador
  const { rows: evRows } = await pool.query(
    `SELECT creator_id, accessibility FROM events WHERE id = $1`,
    [event_id]
  );
  if (!evRows.length) throw new Error('Evento no encontrado');
  if (evRows[0].accessibility !== 'privado') throw new Error('Solo se puede invitar a eventos privados');
  if (evRows[0].creator_id !== invited_by) throw new Error('Solo el creador del evento puede invitar usuarios');
  if (invited_user_id === invited_by) throw new Error('No podés invitarte a vos mismo');

  const { rows } = await pool.query(
    `INSERT INTO event_invitations (event_id, invited_user_id, invited_by)
     VALUES ($1, $2, $3)
     RETURNING id, event_id, invited_user_id, invited_by, status, created_at`,
    [event_id, invited_user_id, invited_by]
  );
  return rows[0];
};

/**
 * Devuelve todas las invitaciones de un evento con datos del invitado.
 * Solo accesible por el creador del evento.
 */
const getInvitationsByEvent = async ({ event_id, requester_id }) => {
  // Verificar que quien consulta es el creador
  const { rows: evRows } = await pool.query(
    `SELECT creator_id FROM events WHERE id = $1`,
    [event_id]
  );
  if (!evRows.length) throw new Error('Evento no encontrado');
  if (evRows[0].creator_id !== requester_id) throw new Error('Solo el creador puede ver las invitaciones');

  const { rows } = await pool.query(
    `SELECT
       ei.id,
       ei.event_id,
       ei.status,
       ei.created_at,
       u.id          AS user_id,
       u.full_name,
       u.username,
       u.avatar_url
     FROM event_invitations ei
     JOIN users u ON u.id = ei.invited_user_id
     WHERE ei.event_id = $1
     ORDER BY ei.created_at DESC`,
    [event_id]
  );

  return rows.map(r => ({
    id:         r.id,
    event_id:   r.event_id,
    status:     r.status,
    created_at: r.created_at,
    user: {
      id:         r.user_id,
      full_name:  r.full_name,
      username:   r.username,
      avatar_url: r.avatar_url,
    },
  }));
};

/**
 * Devuelve los event_ids de eventos privados a los que el usuario fue invitado
 * (status pending o accepted). Usado por getAllEvents para ampliar visibilidad.
 */
const getInvitedEventIds = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT event_id FROM event_invitations
     WHERE invited_user_id = $1
       AND status IN ('pending', 'accepted')`,
    [user_id]
  );
  return rows.map(r => r.event_id);
};

export { createInvitation, getInvitationsByEvent, getInvitedEventIds };
