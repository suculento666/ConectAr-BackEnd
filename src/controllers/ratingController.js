// ratingController.js - calificaciones de eventos
import { createRating, getEventRating, getUserRating } from '../repositories/rating.repository.js';

/**
 * POST /api/events/:id/rating
 * Body: { "score": 4 }
 * Requiere autenticación.
 */
const rateEvent = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;
    const { score } = req.body;

    if (score == null || !Number.isInteger(Number(score)) || score < 1 || score > 5) {
      return res.status(400).json({ error: 'score debe ser un número entero entre 1 y 5' });
    }

    await createRating({ event_id, user_id, score: Number(score) });
    res.status(200).json({ message: 'Calificación guardada' });
  } catch (err) {
    if (err.message === 'Ya calificaste este evento') {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'No participaste en este evento') {
      return res.status(403).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:id/rating
 * Público. Devuelve el promedio y total de calificaciones.
 */
const getAverage = async (req, res) => {
  try {
    const data = await getEventRating(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/events/:id/rating/me
 * Requiere autenticación. Devuelve la calificación del usuario logueado.
 */
const getMyRating = async (req, res) => {
  try {
    const data = await getUserRating({ event_id: req.params.id, user_id: req.user.id });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { rateEvent, getAverage, getMyRating };
