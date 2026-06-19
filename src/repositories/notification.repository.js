// Repositorio Notifications - agrega datos de distintas fuentes para armar el feed
import supabase from '../configs/supabase.js';

// Personas que se unieron a eventos creados por el usuario
const getEventJoinNotifications = async (user_id) => {
  const { data, error } = await supabase
    .from('event_participants')
    .select('user_id, event_id, joined_at, users!event_participants_user_id_fkey(id, username, full_name, avatar_url), events!event_participants_event_id_fkey(id, title, creator_id)')
    .neq('user_id', user_id) // que no sea yo mismo
    .order('joined_at', { ascending: false });

  if (error) throw new Error(error.message);

  // Filtrar solo los eventos donde yo soy el creador
  return (data || [])
    .filter(row => row.events && row.events.creator_id === user_id)
    .map(row => ({
      type: 'event_join',
      id: `ej-${row.event_id}-${row.user_id}`,
      user: row.users,
      event: { id: row.events.id, title: row.events.title },
      created_at: row.joined_at,
    }));
};

// Solicitudes de amistad pendientes recibidas
const getFriendRequestNotifications = async (user_id) => {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, user_id, created_at, users!friendships_user_id_fkey(id, username, full_name, avatar_url)')
    .eq('friend_id', user_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map(row => ({
    type: 'friend_request',
    id: `fr-${row.id}`,
    friendship_id: row.id,
    requester_id: row.user_id,
    user: row.users,
    created_at: row.created_at,
  }));
};

export { getEventJoinNotifications, getFriendRequestNotifications };
