// Servicio User - lógica de negocio para usuarios
import { signUp, signIn, signOut, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents, getAttendedEvents, sendPasswordReset, updatePassword } from '../repositories/user.repository.js';

const registerUser = async ({ email, password, username, full_name, bio, avatar_url, birth_date }) => {
  if (!email || !password || !username || !full_name) {
    throw new Error('email, password, username y full_name son obligatorios');
  }
  const data = await signUp({ email, password, username, full_name, bio, avatar_url, birth_date });
  // data.user contiene el usuario de auth, data.session el JWT
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      username,
      full_name,
    },
    session: data.session,
    message: data.session
      ? 'Usuario registrado correctamente'
      : 'Usuario registrado. Revisá tu email para confirmar la cuenta.'
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('email y password son obligatorios');
  }
  const data = await signIn({ email, password });
  if (!data.session) {
    throw new Error('Confirmá tu email antes de iniciar sesión');
  }
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
};

const logoutUser = async () => {
  await signOut();
  return { message: 'Sesión cerrada correctamente' };
};

const getUsers = async () => {
  return await getAllUsers();
};

const getUser = async (id) => {
  return await getUserById(id);
};

// Campos editables por el usuario — allowlist explícita para prevenir mass assignment
const EDITABLE_USER_FIELDS = ['username', 'full_name', 'bio', 'avatar_url', 'birth_date'];

const editUser = async (id, fields) => {
  // Solo permitir campos de la allowlist — descartar todo lo demás (id, xp, level, role, etc.)
  const safeFields = {};
  for (const key of EDITABLE_USER_FIELDS) {
    if (fields[key] !== undefined) safeFields[key] = fields[key];
  }

  if (Object.keys(safeFields).length === 0) {
    throw new Error(`No hay campos válidos para actualizar. Campos permitidos: ${EDITABLE_USER_FIELDS.join(', ')}`);
  }

  return await updateUser(id, safeFields);
};

const searchUsers = async (username) => {
  if (!username || username.trim().length < 2) {
    throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
  }
  return await searchUsersByUsername(username.trim());
};

const getUserParticipations = async (user_id) => {
  return await getUserEvents(user_id);
};

const getAttendedEventsService = async (user_id) => {
  return await getAttendedEvents(user_id);
};

// Envía el email de recuperación de contraseña
const forgotPassword = async ({ email, redirectTo }) => {
  if (!email) throw new Error('El email es obligatorio');
  await sendPasswordReset({ email, redirectTo });
  return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
};

// Actualiza la contraseña usando el access_token del link de recuperación
const resetPassword = async ({ accessToken, newPassword }) => {
  if (!accessToken || !newPassword) {
    throw new Error('access_token y newPassword son obligatorios');
  }
  if (newPassword.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  await updatePassword({ accessToken, newPassword });
  return { message: 'Contraseña actualizada correctamente' };
};

export { registerUser, loginUser, logoutUser, getUsers, getUser, editUser, searchUsers, getUserParticipations, getAttendedEventsService, forgotPassword, resetPassword };
