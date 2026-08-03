import express from 'express';
import { sendRequest, acceptRequest, removeRequest, getStatus, getFriends, getPending, getPeopleSuggestions, sendRequestNew, getPendingNew, acceptRequestNew, rejectRequestNew } from '../controllers/friendshipController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Todos los endpoints requieren sesión
router.use(authenticate);

// ── Rutas nuevas (formato front nuevo) ────────────────────────────────────
// IMPORTANTE: deben ir antes de las rutas con parámetros dinámicos (:id, :friend_id)
router.post('/request',         sendRequestNew);    // POST   /api/friendships/request        → enviar solicitud (body: receiver_id)
router.get('/requests',         getPendingNew);     // GET    /api/friendships/requests       → solicitudes recibidas (formato nuevo)
router.post('/accept/:id',      acceptRequestNew);  // POST   /api/friendships/accept/:id     → aceptar por friendship.id
router.delete('/reject/:id',    rejectRequestNew);  // DELETE /api/friendships/reject/:id     → rechazar por friendship.id

// ── Rutas legacy (no romper el frontend existente) ────────────────────────
router.get('/',                        getFriends);           // GET    /api/friendships
router.get('/suggestions',             getPeopleSuggestions); // GET    /api/friendships/suggestions
router.get('/status/:friend_id',       getStatus);            // GET    /api/friendships/status/:id
router.post('/',                       sendRequest);          // POST   /api/friendships              → body: friend_id
router.put('/:requester_id/accept',    acceptRequest);        // PUT    /api/friendships/:id/accept
router.delete('/:friend_id',           removeRequest);        // DELETE /api/friendships/:id

export default router;
