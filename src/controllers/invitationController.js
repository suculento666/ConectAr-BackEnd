// Controller de invitaciones a eventos privados
import { createInvitation, getInvitationsByEvent, respondToInvitation, getMyInvitations } from '../repositories/invitation.repository.js';
import { insertNotification } from '../repositories/notification.repository.js';

/**
 * POST /api/events/:id/invite
 * Invita a un usuario a un evento privado. Solo el creador puede hacerlo.
 * Body: { "user_id": "uuid" }
 */
const inviteUser = async (req, res) => {
  try {
    const event_id        = req.params.id;
    const invited_by      = req.user.id;
    const invited_user_id = req.body.user_id;

    if (!invited_user_id) {
      return res.status(400).json({ error: 'user_id es requerido' });
    }

    const invitation = await createInvitation({ event_id, invited_user_id, invited_by });

    // Notificar al invitado de forma no bloqueante
    insertNotification({
      user_id:  invited_user_id,
      type:     'event_invitation',
      actor_id: invited_by,
      event_id,
    }).catch(err => console.error('⚠️ No se pudo crear notificación de invitación:', err.message));

    res.status(201).json(invitation);
  } catch (err) {
    const status = err.message.includes('no encontrado') ? 404
                 : err.message.includes('Solo') || err.message.includes('No podés') ? 403
                 : 400;
    res.status(status).json({ error: err.message });
  }
};

/**
 * GET /api/events/:id/invitations
 * Lista todos los invitados al evento. Solo el creador puede consultarlo.
 */
const listInvitations = async (req, res) => {
  try {
    const invitations = await getInvitationsByEvent({
      event_id:     req.params.id,
      requester_id: req.user.id,
    });
    res.status(200).json(invitations);
  } catch (err) {
    const status = err.message.includes('no encontrado') ? 404
                 : err.message.includes('Solo') ? 403
                 : 500;
    res.status(status).json({ error: err.message });
  }
};

/**
 * GET /api/users/me/invitations
 * Devuelve todas las invitaciones recibidas por el usuario logueado,
 * con datos del evento embebidos.
 */
const myInvitations = async (req, res) => {
  try {
    const invitations = await getMyInvitations(req.user.id);
    res.status(200).json(invitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/invitations/:id/accept
 * El usuario logueado acepta la invitación. No requiere body.
 */
const acceptInvitation = async (req, res) => {
  try {
    const invitation = await respondToInvitation({
      invitation_id: req.params.id,
      user_id:       req.user.id,
      newStatus:     'accepted',
    });
    res.status(200).json(invitation);
  } catch (err) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('permiso') ? 403
                 : 400;
    res.status(status).json({ error: err.message });
  }
};

/**
 * PATCH /api/invitations/:id/reject
 * El usuario logueado rechaza la invitación. No requiere body.
 */
const rejectInvitation = async (req, res) => {
  try {
    const invitation = await respondToInvitation({
      invitation_id: req.params.id,
      user_id:       req.user.id,
      newStatus:     'rejected',
    });
    res.status(200).json(invitation);
  } catch (err) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('permiso') ? 403
                 : 400;
    res.status(status).json({ error: err.message });
  }
};

export { inviteUser, listInvitations, myInvitations, acceptInvitation, rejectInvitation };
