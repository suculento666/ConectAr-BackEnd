// Repositorio Friendship - acceso a la tabla friendships
// Estructura real: id, user_id, friend_id, status (pending|accepted|blocked), created_at, updated_at
import supabase from '../configs/supabase.js';

// Enviar solicitud de amistad (status: pending)
const sendRequest = async ({ user_id, friend_id }) => {
  const { data, error } = await supabase
    .from('friendships')
    .insert([{ user_id, friend_id, status: 'pending' }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Aceptar solicitud (el friend_id acepta al user_id original)
const acceptRequest = async ({ user_id, friend_id }) => {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('user_id', user_id)
    .eq('friend_id', friend_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Eliminar / rechazar amistad (borra el registro)
const removeFriendship = async ({ user_id, friend_id }) => {
  // Busca en ambas direcciones
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(
      `and(user_id.eq.${user_id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user_id})`
    );
  if (error) throw new Error(error.message);
  return { message: 'Amistad eliminada' };
};

// Obtener el estado de la relación entre dos usuarios
// Devuelve: null | { status, direction: 'sent'|'received' }
const getFriendshipStatus = async ({ user_id, friend_id }) => {
  const { data } = await supabase
    .from('friendships')
    .select('id, status, user_id, friend_id')
    .or(
      `and(user_id.eq.${user_id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user_id})`
    )
    .single();
  if (!data) return null;
  return {
    id: data.id,
    status: data.status,
    direction: data.user_id === user_id ? 'sent' : 'received'
  };
};

// Traer todos los amigos aceptados de un usuario (con perfil)
const getAcceptedFriends = async (user_id) => {
  // Amigos donde yo envié la solicitud
  const { data: sent, error: e1 } = await supabase
    .from('friendships')
    .select('friend_id, users!friendships_friend_id_fkey(id, username, full_name, bio, avatar_url, xp, level)')
    .eq('user_id', user_id)
    .eq('status', 'accepted');
  if (e1) throw new Error(e1.message);

  // Amigos donde yo recibí la solicitud
  const { data: received, error: e2 } = await supabase
    .from('friendships')
    .select('user_id, users!friendships_user_id_fkey(id, username, full_name, bio, avatar_url, xp, level)')
    .eq('friend_id', user_id)
    .eq('status', 'accepted');
  if (e2) throw new Error(e2.message);

  const sentFriends     = (sent     || []).map(r => r.users).filter(Boolean);
  const receivedFriends = (received || []).map(r => r.users).filter(Boolean);
  return [...sentFriends, ...receivedFriends];
};

// Solicitudes pendientes recibidas por el usuario
const getPendingRequests = async (user_id) => {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, user_id, created_at, users!friendships_user_id_fkey(id, username, full_name, avatar_url)')
    .eq('friend_id', user_id)
    .eq('status', 'pending');
  if (error) throw new Error(error.message);
  return data || [];
};

export { sendRequest, acceptRequest, removeFriendship, getFriendshipStatus, getAcceptedFriends, getPendingRequests };
