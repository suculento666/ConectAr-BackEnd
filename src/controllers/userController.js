// userController.js - maneja todo lo relacionado al usuario
<<<<<<< HEAD
import { registerUser as registerUserService, loginUser as loginUserService, logoutUser as logoutUserService, getUsers, getUser, editUser, searchUsers, getUserParticipations, getAttendedEventsService } from '../services/user.service.js';
import { evaluateAchievements } from '../services/achievement.service.js';
=======
import { registerUser as registerUserService, loginUser as loginUserService, logoutUser as logoutUserService, getUsers, getUser, editUser, searchUsers, getUserParticipations, getAttendedEventsService, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from '../services/user.service.js';
import { getAchievements as fetchAchievements } from '../repositories/user.repository.js';
import { getSuggestions } from '../repositories/people.repository.js';
>>>>>>> 792ff7548c78685d229b95f01c94963829c9b223

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

// PUT /api/users/:id - edita perfil (solo el propio usuario)
const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
<<<<<<< HEAD
      return res.status(403).json({ error: 'No podés editar el perfil de otro usuario' });
=======
      return res.status(403).json({ error: 'No podés modificar el perfil de otro usuario' });
>>>>>>> 792ff7548c78685d229b95f01c94963829c9b223
    }
    const user = await editUser(req.params.id, req.body);
    res.status(200).json(user);

    // Evaluar logro de perfil completo (no bloquea la respuesta)
    evaluateAchievements(req.params.id, 'profile_complete').catch((e) =>
      console.error('⚠️ achievements profile_complete:', e.message)
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users/search?q=xxx - busca usuarios por username o nombre
const searchUsersByUsername = async (req, res) => {
  try {
    const query = req.query.q || req.query.username;
    if (!query) return res.status(400).json({ error: 'Parámetro q requerido' });
    const users = await searchUsers(query);
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users/:id/suggestions - sugerencias de personas basadas en eventos compartidos
const getSuggestedUsers = async (req, res) => {
  try {
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

// POST /api/users/forgot-password - envía email para restablecer contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email, redirectTo } = req.body;
    const result = await forgotPasswordService({ email, redirectTo });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/users/reset-password - actualiza la contraseña con el token del email
const resetPassword = async (req, res) => {
  try {
    const { access_token, newPassword } = req.body;
    const result = await resetPasswordService({ accessToken: access_token, newPassword });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users/:id/achievements - logros del usuario calculados en tiempo real
const getAchievements = async (req, res) => {
  try {
    const result = await fetchAchievements(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { registerUser, loginUser, logoutUser, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getAttendedEvents, getSuggestedUsers, forgotPassword, resetPassword, getAchievements };
