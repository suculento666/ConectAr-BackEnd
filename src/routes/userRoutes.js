import express from 'express';
import { registerUser, loginUser, logoutUser, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getSuggestedUsers } from '../controllers/userController.js';
import { validarRegistro, validarLogin } from '../middlewares/validaciones.js';
import { authenticate } from '../middlewares/auth.js';
import { myLikes, mySaves } from '../controllers/interactionController.js';

const router = express.Router();

router.post('/register', validarRegistro, registerUser);
router.post('/login',    validarLogin,    loginUser);
router.post('/logout',   authenticate,   logoutUser);
router.get('/search',    searchUsersByUsername);
router.get('/me/likes',  authenticate,   myLikes);
router.get('/me/saves',  authenticate,   mySaves);
router.get('/',          getAllUsers);
router.get('/:id/events',      getUserEvents);
router.get('/:id/suggestions', getSuggestedUsers);
router.get('/:id',       getUserById);
router.put('/:id',       updateUser);

export default router;
