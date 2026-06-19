// Repositorio People - sugerencias de personas basadas en eventos compartidos
import supabase from '../configs/supabase.js';

// Devuelve usuarios con los que el usuario comparte al menos un evento,
// excluyendo: el propio usuario, sus amigos actuales y solicitudes pendientes.
const getSuggestions = async (user_id) => {
  // 1. Eventos en los que participa el usuario (como participante o creador)
  const { data: myParticipations } = await supabase
    .from('event_participants')
    .select('event_id')
    .eq('user_id', user_id);

  const myEventIds = (myParticipations || []).map(p => p.event_id);

  // También eventos que creó
  const { data: myCreated } = await supabase
    .from('events')
    .select('id')
    .eq('creator_id', user_id);

  const createdIds = (myCreated || []).map(e => e.id);
  const allMyEventIds = [...new Set([...myEventIds, ...createdIds])];

  if (!allMyEventIds.length) return [];

  // 2. Otros usuarios que participan en esos mismos eventos
  const { data: coParticipants } = await supabase
    .from('event_participants')
    .select('user_id, event_id, events!event_participants_event_id_fkey(id, title, event_type)')
    .in('event_id', allMyEventIds)
    .neq('user_id', user_id);

  if (!coParticipants || !coParticipants.length) return [];

  // 3. Agrupar por usuario: cuántos eventos en común y cuáles
  const byUser = {};
  coParticipants.forEach(row => {
    if (!byUser[row.user_id]) byUser[row.user_id] = { sharedEvents: [] };
    if (row.events) byUser[row.user_id].sharedEvents.push(row.events);
  });

  const suggestedUserIds = Object.keys(byUser);

  // 4. Traer sus relaciones de amistad conmigo para excluir ya-amigos y pendientes
  const { data: myRelations } = await supabase
    .from('friendships')
    .select('user_id, friend_id, status')
    .or(
      `and(user_id.eq.${user_id},friend_id.in.(${suggestedUserIds.join(',')})),and(friend_id.eq.${user_id},user_id.in.(${suggestedUserIds.join(',')}))`
    );

  const excludeIds = new Set();
  (myRelations || []).forEach(r => {
    // Excluir si ya son amigos o hay una solicitud pendiente en cualquier dirección
    const otherId = r.user_id === user_id ? r.friend_id : r.user_id;
    excludeIds.add(otherId);
  });

  const filteredIds = suggestedUserIds.filter(id => !excludeIds.has(id));
  if (!filteredIds.length) return [];

  // 5. Traer perfiles
  const { data: profiles } = await supabase
    .from('users')
    .select('id, username, full_name, bio, avatar_url, xp, level')
    .in('id', filteredIds);

  return (profiles || []).map(u => ({
    ...u,
    shared_events: byUser[u.id]?.sharedEvents || [],
    shared_count:  byUser[u.id]?.sharedEvents?.length || 0,
  })).sort((a, b) => b.shared_count - a.shared_count); // más eventos en común primero
};

export { getSuggestions };
