import express from 'express';
import { sendRequest, acceptRequest, removeRequest, getStatus, getFriends, getPending } from '../controllers/friendshipController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Todos los endpoints requieren sesión
router.use(authenticate);

router.get('/',                        getFriends);    // GET    /api/friendships          → mis amigos
router.get('/requests',                getPending);    // GET    /api/friendships/requests → solicitudes recibidas
router.get('/status/:friend_id',       getStatus);    // GET    /api/friendships/status/:id → estado con ese usuario
router.post('/',                       sendRequest);   // POST   /api/friendships          → enviar solicitud
router.put('/:requester_id/accept',    acceptRequest); // PUT    /api/friendships/:id/accept → aceptar
router.delete('/:friend_id',           removeRequest); // DELETE /api/friendships/:id      → eliminar/rechazar

export default router;
