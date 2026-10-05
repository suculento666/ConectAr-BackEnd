import express from 'express';
import { registerUser, loginUser, logoutUser, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getAttendedEvents, getSuggestedUsers, forgotPassword, resetPassword } from '../controllers/userController.js';
import { upload, uploadAvatar } from '../controllers/uploadController.js';
import { getUserAchievements } from '../controllers/achievementController.js';
import { validarRegistro, validarLogin, validarActualizacionUsuario } from '../middlewares/validaciones.js';
import { authenticate } from '../middlewares/auth.js';
import { myLikes, mySaves } from '../controllers/interactionController.js';
import { myInvitations } from '../controllers/invitationController.js';
import { eventsPerMonth } from '../controllers/statsController.js';

const router = express.Router();

router.post('/register',        validarRegistro, registerUser);
router.post('/login',           validarLogin,    loginUser);
router.post('/logout',          authenticate,    logoutUser);
router.post('/forgot-password',                  forgotPassword);
router.post('/reset-password',                   resetPassword);
router.post('/me/avatar',       authenticate, upload.single('avatar'), uploadAvatar); // POST - subir foto de perfil
router.get('/search',           searchUsersByUsername);
router.get('/me/likes',         authenticate, myLikes);
router.get('/me/saves',         authenticate, mySaves);
router.get('/me/invitations',   authenticate, myInvitations);
router.get('/',                 getAllUsers);
router.get('/:id/stats/events-per-month', eventsPerMonth);
router.get('/:id/achievements', getUserAchievements);  // GET - logros del usuario (público)
router.get('/:id/events/attended', authenticate, getAttendedEvents);
router.get('/:id/events',       getUserEvents);
router.get('/:id/suggestions',  getSuggestedUsers);
router.get('/:id',              getUserById);
router.put('/:id',              authenticate, validarActualizacionUsuario, updateUser);

export default router;
