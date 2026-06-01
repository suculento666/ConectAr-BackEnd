import express from 'express';
import { registerUser, loginUser, getAllUsers, getUserById, updateUser } from '../controllers/userController.js';
import { validarRegistro, validarLogin } from '../middlewares/validaciones.js';

const router = express.Router();

router.post('/register', validarRegistro, registerUser);
router.post('/login',    validarLogin,    loginUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);

export default router;
