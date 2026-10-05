// Repositorio de invitaciones a eventos privados
import pool from '../configs/db.js';

/**
 * Crea una invitación. Solo el creador del evento puede invitar.
 * Lanza error si el evento no es privado, si el usuario ya fue invitado,
 * o si quien invita no es el creador.
 */
const createInvitation = async ({ event_id, invited_user_id, invited_by }) => {
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
 * Actualiza el status de una invitación ('accepted' o 'rejected').
 * Solo el usuario invitado puede responder su propia invitación.
 * Lanza error si la invitación no existe, no le pertenece, o ya fue respondida.
 */
const respondToInvitation = async ({ invitation_id, user_id, newStatus }) => {
  const { rows } = await pool.query(
    `SELECT id, invited_user_id, status FROM event_invitations WHERE id = $1`,
    [invitation_id]
  );

  if (!rows.length) throw new Error('Invitación no encontrada');

  const inv = rows[0];

  if (inv.invited_user_id !== user_id) {
    throw new Error('No tenés permiso para responder esta invitación');
  }

  if (inv.status !== 'pending') {
    throw new Error(`La invitación ya fue ${inv.status}`);
  }

  const { rows: updated } = await pool.query(
    `UPDATE event_invitations
     SET status = $1
     WHERE id = $2
     RETURNING id, event_id, invited_user_id, invited_by, status, created_at`,
    [newStatus, invitation_id]
  );

  return updated[0];
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

/**
 * Devuelve todas las invitaciones recibidas por un usuario, con datos del evento embebidos.
 */
const getMyInvitations = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT
       ei.id,
       ei.event_id,
       ei.invited_user_id,
       ei.invited_by,
       ei.status,
       ei.created_at,
       e.id            AS ev_id,
       e.title         AS ev_title,
       e.event_date    AS ev_event_date,
       e.location      AS ev_location,
       e.image_url     AS ev_image_url,
       e.event_type    AS ev_event_type,
       e.accessibility AS ev_accessibility
     FROM event_invitations ei
     JOIN events e ON e.id = ei.event_id
     WHERE ei.invited_user_id = $1
     ORDER BY ei.created_at DESC`,
    [user_id]
  );

  return rows.map(r => ({
    id:              r.id,
    event_id:        r.event_id,
    invited_user_id: r.invited_user_id,
    invited_by:      r.invited_by,
    status:          r.status,
    created_at:      r.created_at,
    event: {
      id:            r.ev_id,
      title:         r.ev_title,
      event_date:    r.ev_event_date,
      location:      r.ev_location,
      image_url:     r.ev_image_url,
      event_type:    r.ev_event_type,
      accessibility: r.ev_accessibility,
    },
  }));
};

export {
  createInvitation,
  getInvitationsByEvent,
  respondToInvitation,
  getInvitedEventIds,
  getMyInvitations,
};
