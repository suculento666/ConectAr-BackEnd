// interactionController.js - likes, saves y comments de eventos
import {
  likeEvent, unlikeEvent, getLikedEvents, getEventLikes, getBulkLikeStatus,
  saveEvent, unsaveEvent, getSavedEvents, getBulkSaveStatus,
  addComment, getComments, deleteComment,
} from '../repositories/interaction.repository.js';
import { getEventById } from '../repositories/event.repository.js';
import { insertNotification } from '../repositories/notification.repository.js';

// POST /api/events/:id/like
const like = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;

    const result = await likeEvent({ user_id, event_id });

    // Notificar al creador del evento, pero no si se likeó a sí mismo
    // y solo si el like fue nuevo (no ya existente)
    if (!result.already) {
      try {
        const event = await getEventById(event_id);
        if (event && event.creator_id !== user_id) {
          await insertNotification({
            user_id:  event.creator_id,
            type:     'like',
            actor_id: user_id,
            event_id,
          });
          console.log(`🔔 Notificación de like creada → destinatario: ${event.creator_id}`);
        } else if (event && event.creator_id === user_id) {
          console.log('ℹ️  Like propio — no se crea notificación');
        }
      } catch (notifErr) {
        // No bloquear el like si falla la notificación
        console.error('⚠️  No se pudo crear notificación de like:', notifErr.message);
        console.error(notifErr.stack);
      }
    } else {
      console.log('ℹ️  Like duplicado — no se crea notificación');
    }

    res.status(201).json({ message: 'like agregado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/events/:id/like
const unlike = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;
    await unlikeEvent({ user_id, event_id });
    res.status(200).json({ message: 'like eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/events/:id/like  → todos los likes de ese evento (público)
const eventLikes = async (req, res) => {
  try {
    const likes = await getEventLikes(req.params.id);
    res.status(200).json(likes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me/likes  → eventos que likeó el usuario logueado
const myLikes = async (req, res) => {
  try {
    const events = await getLikedEvents(req.user.id);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events/bulk-status  → likes y saves de varios eventos en una sola llamada
const bulkStatus = async (req, res) => {
  try {
    const user_id   = req.user.id;
    const { event_ids } = req.body;
    if (!Array.isArray(event_ids)) return res.status(400).json({ error: 'event_ids debe ser un array' });
    const [likes, saves] = await Promise.all([
      getBulkLikeStatus({ user_id, event_ids }),
      getBulkSaveStatus({ user_id, event_ids }),
    ]);
    res.status(200).json({ likes, saves });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events/:id/save
const save = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;
    const result   = await saveEvent({ user_id, event_id });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/events/:id/save
const unsave = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;
    const result   = await unsaveEvent({ user_id, event_id });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users/me/saves  → eventos guardados por el usuario logueado
const mySaves = async (req, res) => {
  try {
    const events = await getSavedEvents(req.user.id);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/events/:id/comments
const listComments = async (req, res) => {
  try {
    const comments = await getComments(req.params.id);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events/:id/comments
const postComment = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'El comentario no puede estar vacío' });
    const comment = await addComment({ user_id, event_id, content: content.trim() });

    // Notificar al creador del evento, pero no si comentó su propio evento
    try {
      const event = await getEventById(event_id);
      if (event && event.creator_id !== user_id) {
        await insertNotification({
          user_id:  event.creator_id,
          type:     'comment',
          actor_id: user_id,
          event_id,
        });
        console.log(`🔔 Notificación de comentario creada → destinatario: ${event.creator_id}`);
      }
    } catch (notifErr) {
      // No bloquear la respuesta si falla la notificación
      console.error('⚠️  No se pudo crear notificación de comentario:', notifErr.message);
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/events/:event_id/comments/:comment_id
const removeComment = async (req, res) => {
  try {
    const user_id    = req.user.id;
    const comment_id = req.params.comment_id;
    const result     = await deleteComment({ comment_id, user_id });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { like, unlike, eventLikes, myLikes, bulkStatus, save, unsave, mySaves, listComments, postComment, removeComment };
