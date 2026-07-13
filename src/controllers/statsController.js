// statsController.js - estadísticas de eventos y usuarios
import { getEventsPerMonthByUser, getParticipantAgeRangesByEvent, isEventCreator } from '../repositories/stats.repository.js';

/**
 * GET /api/users/:id/stats/events-per-month
 * Cantidad de eventos asistidos por mes para un usuario.
 * Solo el propio usuario debería consultarlo (el frontend lo controla).
 */
const eventsPerMonth = async (req, res) => {
  try {
    const user_id = req.params.id;
    const data = await getEventsPerMonthByUser(user_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/events/:id/stats/age-ranges
 * Distribución de participantes por rango de edad.
 * Solo accesible por el creador del evento.
 */
const participantAgeRanges = async (req, res) => {
  try {
    const event_id = req.params.id;
    const user_id  = req.user.id;

    const isCreator = await isEventCreator({ user_id, event_id });
    if (!isCreator) {
      return res.status(403).json({ error: 'Solo el creador del evento puede ver esta estadística' });
    }

    const data = await getParticipantAgeRangesByEvent(event_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { eventsPerMonth, participantAgeRanges };
