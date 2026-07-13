// chatController.js - chat grupal por evento
import { isParticipantOrCreator, createMessage, getMessages, deleteMessage } from '../repositories/chat.repository.js';

/**
 * GET /api/events/:id/chat
 * Trae los mensajes del chat de un evento.
 * Query params opcionales:
 *   - limit    (default 50, máx 100)
 *   - before_id (UUID, paginación hacia atrás)
 */
const listMessages = async (req, res) => {
  try {
    const event_id  = req.params.id;
    const { limit, before_id } = req.query;

    const messages = await getMessages({ event_id, limit, before_id });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/events/:id/chat
 * Envía un mensaje al chat de un evento.
 * Solo participantes o el creador del evento pueden escribir.
 * Body: { content: string }
 */
const sendMessage = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({ error: 'El mensaje no puede superar los 2000 caracteres' });
    }

    // Solo participantes o creador pueden escribir
    const allowed = await isParticipantOrCreator({ user_id, event_id });
    if (!allowed) {
      return res.status(403).json({ error: 'Tenés que participar del evento para escribir en el chat' });
    }

    const message = await createMessage({ event_id, user_id, content: content.trim() });
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/events/:id/chat/:message_id
 * Elimina un mensaje propio del chat.
 */
const removeMessage = async (req, res) => {
  try {
    const user_id    = req.user.id;
    const message_id = req.params.message_id;

    const result = await deleteMessage({ message_id, user_id });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { listMessages, sendMessage, removeMessage };
