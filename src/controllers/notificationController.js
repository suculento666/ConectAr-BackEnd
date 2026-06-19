// notificationController.js - feed de notificaciones del usuario
import { getEventJoinNotifications, getFriendRequestNotifications } from '../repositories/notification.repository.js';

// GET /api/notifications - todas las notificaciones del usuario autenticado
const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [eventJoins, friendRequests] = await Promise.all([
      getEventJoinNotifications(user_id),
      getFriendRequestNotifications(user_id),
    ]);

    // Mezclar y ordenar por fecha descendente
    const all = [...eventJoins, ...friendRequests]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.status(200).json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getNotifications };
