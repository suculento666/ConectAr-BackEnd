import express from 'express';
import {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
  joinEvent, leaveEvent, getParticipants,
  createFeedback,
} from '../controllers/eventController.js';

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

export default router;
