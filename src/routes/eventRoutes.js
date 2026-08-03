import express from 'express';
import {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
  joinEvent, leaveEvent, getParticipants,
  createFeedback,
} from '../controllers/eventController.js';
import { like, unlike, eventLikes, save, unsave, bulkStatus, listComments, postComment, removeComment } from '../controllers/interactionController.js';
import { listMessages, sendMessage, removeMessage } from '../controllers/chatController.js';
import { participantAgeRanges } from '../controllers/statsController.js';
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

export default router;