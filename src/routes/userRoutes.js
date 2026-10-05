import express from 'express';
import { registerUser, loginUser, logoutUser, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getAttendedEvents, getSuggestedUsers } from '../controllers/userController.js';
import { upload, uploadAvatar } from '../controllers/uploadController.js';
import { getUserAchievements } from '../controllers/achievementController.js';
import { validarRegistro, validarLogin } from '../middlewares/validaciones.js';
import { authenticate } from '../middlewares/auth.js';
import { myLikes, mySaves } from '../controllers/interactionController.js';
import { eventsPerMonth } from '../controllers/statsController.js';

const router = express.Router();

router.post('/register', validarRegistro, registerUser);
router.post('/login',    validarLogin,    loginUser);
router.post('/logout',   authenticate,   logoutUser);
router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar); // POST - subir foto de perfil
router.get('/search',    searchUsersByUsername);
router.get('/me/likes',  authenticate,   myLikes);
router.get('/me/saves',  authenticate,   mySaves);
router.get('/',          getAllUsers);
router.get('/:id/stats/events-per-month', eventsPerMonth); // estadística: eventos por mes
router.get('/:id/events/attended',  authenticate, getAttendedEvents); // eventos pasados asistidos
router.get('/:id/events',           getUserEvents);
router.get('/:id/suggestions', getSuggestedUsers);
router.get('/:id/achievements', getUserAchievements);  // GET - logros del usuario (público)
router.get('/:id',       getUserById);
router.put('/:id',       authenticate, updateUser);

export default router;
