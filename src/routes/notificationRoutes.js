import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/',           getNotifications); // GET   /api/notifications
router.patch('/:id/read', markAsRead);       // PATCH /api/notifications/:id/read

export default router;
