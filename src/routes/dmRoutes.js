import express from 'express';
import { inbox, conversation, send, remove } from '../controllers/dmController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Todos los endpoints de DMs requieren autenticación
router.get('/',              authenticate, inbox);           // GET  - inbox (lista de conversaciones)
router.get('/:userId',       authenticate, conversation);    // GET  - mensajes con un usuario
router.post('/:userId',      authenticate, send);            // POST - enviar mensaje a un usuario
router.delete('/:messageId', authenticate, remove);          // DELETE - eliminar mensaje propio

export default router;
