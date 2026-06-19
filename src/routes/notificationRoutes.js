import express from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications); // GET /api/notifications

export default router;
