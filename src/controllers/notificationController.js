// notificationController.js - feed de notificaciones del usuario
import { getNotificationsByUser, markNotificationAsRead } from '../repositories/notification.repository.js';

/**
 * GET /api/notifications
 * Devuelve todas las notificaciones del usuario logueado.
 * Formato: [{ id, type, read, created_at, actor: {...}, event: {...} | null }]
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsByUser(req.user.id);
    res.status(200).json(notifications);
  } catch (err) {
    console.error('❌ GET /api/notifications error:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marca una notificación como leída.
 */
const markAsRead = async (req, res) => {
  try {
    const result = await markNotificationAsRead({
      notification_id: req.params.id,
      user_id:         req.user.id,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export { getNotifications, markAsRead };
