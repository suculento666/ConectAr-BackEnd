// userController.js - maneja todo lo relacionado al usuario
import { registerUser as registerUserService, loginUser as loginUserService, logoutUser as logoutUserService, getUsers, getUser, editUser, searchUsers, getUserParticipations, getAttendedEventsService } from '../services/user.service.js';
import supabase from '../configs/supabase.js';

// POST /api/users/register - crea un usuario nuevo via Supabase Auth
const registerUser = async (req, res) => {
  try {
    console.log('📥 Body recibido en /register:', JSON.stringify(req.body));
    const { email, password, username, full_name, bio, avatar_url, birth_date } = req.body;
    const result = await registerUserService({ email, password, username, full_name, bio, avatar_url, birth_date });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/users/login - login y devuelve JWT
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUserService({ email, password });
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// POST /api/users/logout - cierra sesión del usuario autenticado
const logoutUser = async (_req, res) => {
  try {
    const result = await logoutUserService();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users - trae todos los usuarios
const getAllUsers = async (_req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id - trae un usuario por id
const getUserById = async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// PUT /api/users/:id - edita perfil
const updateUser = async (req, res) => {
  try {
    const user = await editUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users/search?q=xxx - busca usuarios por username o nombre
const searchUsersByUsername = async (req, res) => {
  try {
    const query = req.query.q || req.query.username;
    const users = await searchUsers(query);
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users/:id/suggestions - sugerencias de personas basadas en eventos compartidos
const getSuggestedUsers = async (req, res) => {
  try {
    const { getSuggestions } = await import('../repositories/people.repository.js');
    const suggestions = await getSuggestions(req.params.id);
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id/events - trae los eventos en los que participa el usuario
const getUserEvents = async (req, res) => {
  try {
    const participations = await getUserParticipations(req.params.id);
    res.status(200).json(participations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id/events/attended - eventos pasados a los que asistió el usuario
const getAttendedEvents = async (req, res) => {
  try {
    const events = await getAttendedEventsService(req.params.id);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/forgot-password — envía email de reset via Supabase Auth
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email es requerido' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:5174/reset-password',
    });

    // Siempre respondemos 200 para no revelar si el email existe o no
    if (error) console.error('⚠️ resetPasswordForEmail error:', error.message);

    res.status(200).json({ message: 'Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { registerUser, loginUser, logoutUser, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getAttendedEvents, getSuggestedUsers, forgotPassword };
