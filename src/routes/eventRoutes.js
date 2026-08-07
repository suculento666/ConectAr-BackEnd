import express from 'express';
import {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
  joinEvent, leaveEvent, getParticipants,
  createFeedback,
} from '../controllers/eventController.js';
import { like, unlike, eventLikes, save, unsave, bulkStatus, listComments, postComment, removeComment } from '../controllers/interactionController.js';
import { listMessages, sendMessage, removeMessage } from '../controllers/chatController.js';
import { participantAgeRanges } from '../controllers/statsController.js';
import { rateEvent, updateRatingHandler, getAverage, getMyRating } from '../controllers/ratingController.js';
import { authenticate } from '../middlewares/auth.js';  

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, createEvent);
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

router.post('/:id/join', authenticate, joinEvent);
router.delete('/:id/join', authenticate, leaveEvent);
router.get('/:id/participants', getParticipants);

router.post('/:id/feedback', authenticate, createFeedback);

// Likes
router.get('/:id/like',    eventLikes);               // público
router.post('/:id/like',   authenticate, like);
router.delete('/:id/like', authenticate, unlike);

// Saves
router.post('/:id/save',   authenticate, save);
router.delete('/:id/save', authenticate, unsave);

// Bulk status (likes + saves de varios eventos a la vez)
router.post('/bulk-status', authenticate, bulkStatus);

// Comments
router.get('/:id/comments',                  listComments);
router.post('/:id/comments',                 authenticate, postComment);
router.delete('/:id/comments/:comment_id',   authenticate, removeComment);

// Chat grupal del evento
router.get('/:id/chat',                      listMessages);
router.post('/:id/chat',                     authenticate, sendMessage);
router.delete('/:id/chat/:message_id',       authenticate, removeMessage);

// Estadísticas del evento (solo creador)
router.get('/:id/stats/age-ranges',          authenticate, participantAgeRanges);

// Ratings (calificaciones)
// IMPORTANTE: /rating/me debe ir antes de /rating para que Express no lo trate como param
router.get('/:id/rating/me',                 authenticate, getMyRating);        // GET  - calificación del usuario logueado
router.get('/:id/rating',                    getAverage);                       // GET  - promedio y total (público)
router.post('/:id/rating',                   authenticate, rateEvent);          // POST - crear calificación
router.put('/:id/rating',                    authenticate, updateRatingHandler); // PUT  - actualizar calificación existente

export default router;