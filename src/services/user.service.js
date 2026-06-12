// Servicio User - lógica de negocio para usuarios
import { signUp, signIn, signOut, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents } from '../repositories/user.repository.js';

const registerUser = async ({ email, password, username, full_name, bio, avatar_url }) => {
  if (!email || !password || !username || !full_name) {
    throw new Error('email, password, username y full_name son obligatorios');
  }
  const data = await signUp({ email, password, username, full_name, bio, avatar_url });
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

const editUser = async (id, fields) => {
  // No permitir cambiar xp ni level directamente
  const { xp, level, ...safeFields } = fields;
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

export { registerUser, loginUser, logoutUser, getUsers, getUser, editUser, searchUsers, getUserParticipations };
