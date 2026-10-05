import express from 'express';
<<<<<<< HEAD
import { registerUser, loginUser, logoutUser, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getAttendedEvents, getSuggestedUsers } from '../controllers/userController.js';
import { upload, uploadAvatar } from '../controllers/uploadController.js';
import { getUserAchievements } from '../controllers/achievementController.js';
import { validarRegistro, validarLogin } from '../middlewares/validaciones.js';
=======
import { registerUser, loginUser, logoutUser, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getAttendedEvents, getSuggestedUsers, forgotPassword, resetPassword, getAchievements } from '../controllers/userController.js';
import { validarRegistro, validarLogin, validarActualizacionUsuario } from '../middlewares/validaciones.js';
>>>>>>> 792ff7548c78685d229b95f01c94963829c9b223
import { authenticate } from '../middlewares/auth.js';
import { myLikes, mySaves } from '../controllers/interactionController.js';
import { myInvitations } from '../controllers/invitationController.js';
import { eventsPerMonth } from '../controllers/statsController.js';

const router = express.Router();

<<<<<<< HEAD
router.post('/register', validarRegistro, registerUser);
router.post('/login',    validarLogin,    loginUser);
router.post('/logout',   authenticate,   logoutUser);
router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar); // POST - subir foto de perfil
=======
router.post('/register',        validarRegistro, registerUser);
router.post('/login',           validarLogin,    loginUser);
router.post('/logout',          authenticate,    logoutUser);
router.post('/forgot-password',                  forgotPassword);
router.post('/reset-password',                   resetPassword);
>>>>>>> 792ff7548c78685d229b95f01c94963829c9b223
router.get('/search',    searchUsersByUsername);
router.get('/me/likes',        authenticate, myLikes);
router.get('/me/saves',        authenticate, mySaves);
router.get('/me/invitations',  authenticate, myInvitations);
router.get('/',          getAllUsers);
router.get('/:id/stats/events-per-month', eventsPerMonth);
router.get('/:id/achievements',             getAchievements);
router.get('/:id/events/attended',  authenticate, getAttendedEvents);
router.get('/:id/events',           getUserEvents);
router.get('/:id/suggestions', getSuggestedUsers);
router.get('/:id/achievements', getUserAchievements);  // GET - logros del usuario (público)
router.get('/:id',       getUserById);
<<<<<<< HEAD
router.put('/:id',       authenticate, updateUser);
=======
router.put('/:id',       authenticate, validarActualizacionUsuario, updateUser);
>>>>>>> 792ff7548c78685d229b95f01c94963829c9b223

export default router;
