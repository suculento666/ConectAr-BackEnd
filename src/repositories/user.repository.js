// Repositorio User - acceso a la base de datos (tabla: users + auth)
import supabase from '../configs/supabase.js';

// Auth: registro con email/password, los metadatos van al trigger
const signUp = async ({ email, password, username, full_name, bio, avatar_url }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name, bio, avatar_url }
    }
  });
  if (error) throw new Error(error.message);
  return data;
};

// Auth: login con email/password, devuelve session + user
const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
};

// Perfil: trae todos los usuarios de public.users
const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date, created_at');
  if (error) throw new Error(error.message);
  return data;
};

// Perfil: trae un usuario por id
const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date, created_at')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Perfil: actualiza datos del perfil (no toca auth)
const updateUser = async (id, fields) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date')
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Auth: cierra sesión del usuario actual
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

// Perfil: busca usuarios por username o full_name (búsqueda parcial)
const searchUsersByUsername = async (query) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, bio, avatar_url, xp, level, birth_date, created_at')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
  if (error) throw new Error(error.message);
  return data;
};

// Participaciones: trae los eventos en los que participa un usuario
const getUserEvents = async (user_id) => {
  const { data, error } = await supabase
    .from('event_participants')
    .select('event_id')
    .eq('user_id', user_id);
  if (error) throw new Error(error.message);
  return data;
};

export { signUp, signIn, signOut, getAllUsers, getUserById, updateUser, searchUsersByUsername, getUserEvents };
