import express from 'express';
import {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
  joinEvent, leaveEvent, getParticipants,
  createFeedback,
} from '../controllers/eventController.js';
import { like, unlike, save, unsave, bulkStatus, listComments, postComment, removeComment } from '../controllers/interactionController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

router.post('/:id/join', joinEvent);
router.delete('/:id/join', leaveEvent);
router.get('/:id/participants', getParticipants);

router.post('/:id/feedback', createFeedback);

// Likes
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

export default router;