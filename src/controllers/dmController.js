// Controller de mensajes directos (DMs)
import { sendDM, getConversation, getInbox, markConversationRead, deleteDM } from '../repositories/dm.repository.js';

/**
 * GET /api/messages
 * Devuelve el inbox: lista de conversaciones con último mensaje y no leídos.
 */
const inbox = async (req, res) => {
  try {
    const conversations = await getInbox(req.user.id);
    res.status(200).json(conversations);
  } catch (err) {
    console.error('❌ GET /api/messages error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/messages/:userId
 * Devuelve los mensajes de la conversación con un usuario específico.
 * Query params: limit (default 50), before_id (cursor para paginación).
 */
const conversation = async (req, res) => {
  try {
    const me       = req.user.id;
    const other    = req.params.userId;
    const { limit, before_id } = req.query;

    if (me === other) {
      return res.status(400).json({ error: 'No podés enviarte mensajes a vos mismo' });
    }

    const messages = await getConversation({ user_a: me, user_b: other, limit, before_id });

    // Marcar como leídos los mensajes del otro que todavía no leímos
    await markConversationRead({ reader_id: me, sender_id: other });

    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ GET /api/messages/:userId error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/messages/:userId
 * Envía un mensaje directo al usuario indicado.
 * Body: { "content": "Hola!" }
 */
const send = async (req, res) => {
  try {
    const sender_id   = req.user.id;
    const receiver_id = req.params.userId;
    const { content } = req.body;

    if (sender_id === receiver_id) {
      return res.status(400).json({ error: 'No podés enviarte mensajes a vos mismo' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: 'El mensaje no puede superar los 2000 caracteres' });
    }

    const message = await sendDM({ sender_id, receiver_id, content: content.trim() });
    res.status(201).json(message);
  } catch (err) {
    console.error('❌ POST /api/messages/:userId error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/messages/:messageId
 * Elimina un mensaje propio.
 */
const remove = async (req, res) => {
  try {
    await deleteDM({ message_id: req.params.messageId, user_id: req.user.id });
    res.status(200).json({ message: 'Mensaje eliminado' });
  } catch (err) {
    if (err.message.includes('no encontrado') || err.message.includes('permiso')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export { inbox, conversation, send, remove };
