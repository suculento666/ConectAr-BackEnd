import express from 'express';
import { acceptInvitation, rejectInvitation } from '../controllers/invitationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// PATCH /api/invitations/:id/accept  — el invitado acepta
router.patch('/:id/accept', authenticate, acceptInvitation);

// PATCH /api/invitations/:id/reject  — el invitado rechaza
router.patch('/:id/reject', authenticate, rejectInvitation);

export default router;
