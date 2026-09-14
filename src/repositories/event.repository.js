// Repositorio Event - acceso a la base de datos (tablas: events, event_participants, feedback)
import supabase from '../configs/supabase.js';
import pool from '../configs/db.js';
import { getInvitedEventIds } from './invitation.repository.js';

// Imágenes por defecto según event_type
const DEFAULT_IMAGES = {
  concierto: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  deporte: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
  cultura: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800',
  fiesta: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800',
  otro: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
};

const applyDefaultImage = (event) => ({
  ...event,
  image_url:
    event.image_url ||
    DEFAULT_IMAGES[event.event_type] ||
    DEFAULT_IMAGES.otro,
});

// --- Events ---

const createEvent = async ({
  creator_id,
  title,
  description,
  location,
  event_date,
  event_type,
  accessibility,
  max_participants,
  image_url,
}) => {
  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        creator_id,
        title,
        description,
        location,
        event_date,
        event_type,
        accessibility,
        max_participants,
        image_url,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return applyDefaultImage(data);
};

const getAllEvents = async (filters = {}, user_id = null) => {
  // Obtener event_ids donde el usuario tiene invitación (pending o accepted)
  const invitedIds = user_id ? await getInvitedEventIds(user_id).catch(() => []) : [];

  let query = supabase
    .from('events')
    .select(`
      *,
      users!events_creator_id_fkey(
        id,
        username,
        full_name,
        avatar_url
      ),
      event_participants(count)
    `);

  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type);
  }

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters.accessibility) {
    // Si filtra explícitamente por 'privado', mostrar propios + invitados
    if (filters.accessibility === 'privado') {
      if (!user_id) return [];
      if (invitedIds.length) {
        query = query.eq('accessibility', 'privado')
          .or(`creator_id.eq.${user_id},id.in.(${invitedIds.join(',')})`);
      } else {
        query = query.eq('accessibility', 'privado').eq('creator_id', user_id);
      }
    } else {
      query = query.eq('accessibility', filters.accessibility);
    }
  } else {
    // Sin filtro: públicos + privados propios + privados con invitación
    if (user_id) {
      if (invitedIds.length) {
        query = query.or(
          `accessibility.eq.publico,and(accessibility.eq.privado,creator_id.eq.${user_id}),id.in.(${invitedIds.join(',')})`
        );
      } else {
        query = query.or(`accessibility.eq.publico,and(accessibility.eq.privado,creator_id.eq.${user_id})`);
      }
    } else {
      query = query.eq('accessibility', 'publico');
    }
  }

  query = query
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const invitedSet = new Set(invitedIds);

  return data.map(event => ({
    ...applyDefaultImage(event),
    participant_count: event.event_participants?.[0]?.count || 0,
    is_invited: invitedSet.has(event.id) && event.creator_id !== user_id,
  }));
};


  const getEventById = async (id) => {
    const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    users!events_creator_id_fkey(
     id,
     username,
     full_name,
     avatar_url
    ),
    event_participants(count)
  `)
  .eq('id', id)
  .single();

  if (error) throw new Error(error.message);

  return {
  ...applyDefaultImage(data),
  participant_count: data.event_participants?.[0]?.count || 0,
  };
  };

const updateEvent = async (id, fields, creator_id) => {

  // No permitir modificar campos protegidos
  delete fields.id;
  delete fields.creator_id;
  delete fields.created_at;
  delete fields.updated_at;

  const { data, error } = await supabase
    .from('events')
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('creator_id', creator_id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return applyDefaultImage(data);
};

const deleteEvent = async (id, creator_id) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('creator_id', creator_id);

  if (error) throw new Error(error.message);

  return {
    message: 'Evento eliminado',
  };
};

// --- Event Participants ---

const joinEvent = async ({ user_id, event_id }) => {

  // Obtener el evento completo: accessibility, creator_id y max_participants
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('accessibility, creator_id, max_participants')
    .eq('id', event_id)
    .single();

  if (eventError || !event) {
    throw new Error('Evento no encontrado');
  }

  // Si el evento es privado, verificar que el usuario es el creador o tiene invitación
  if (event.accessibility === 'privado' && event.creator_id !== user_id) {
    const { rows: invRows } = await pool.query(
      `SELECT 1 FROM event_invitations
       WHERE event_id = $1
         AND invited_user_id = $2
         AND status IN ('pending', 'accepted')
       LIMIT 1`,
      [event_id, user_id]
    );
    if (!invRows.length) {
      throw new Error('No tenés permiso para unirte a este evento privado');
    }
  }

  // Verificar si ya participa
  const { data: existing } = await supabase
    .from('event_participants')
    .select('user_id')
    .eq('user_id', user_id)
    .eq('event_id', event_id)
    .single();

  if (existing) {
    throw new Error('Ya estás anotado en este evento');
  }

  // Contar participantes actuales
  const { count, error: countError } = await supabase
    .from('event_participants')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('event_id', event_id);

  if (countError) {
    throw new Error(countError.message);
  }

  // Verificar límite
  if (
    event.max_participants &&
    count >= event.max_participants
  ) {
    throw new Error('Sin cupos disponibles');
  }

  const { data, error } = await supabase
    .from('event_participants')
    .insert([
      {
        user_id,
        event_id,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

const leaveEvent = async ({ user_id, event_id }) => {
  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('user_id', user_id)
    .eq('event_id', event_id);

  if (error) throw new Error(error.message);

  return {
    message: 'Participación cancelada',
  };
};

const getParticipants = async (event_id) => {
  const { data, error } = await supabase
    .from('event_participants')
    .select('*, users(id, username, full_name, avatar_url, birth_date)')
    .eq('event_id', event_id);

  if (error) throw new Error(error.message);

  return data || [];
};

// --- Feedback ---

const createFeedback = async ({
  usuario_id,
  evento_id,
  puntuacion,
  comentario,
}) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        usuario_id,
        evento_id,
        puntuacion,
        comentario,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// --- Eventos donde participan amigos del usuario ---

/**
 * Devuelve eventos futuros donde al menos un amigo aceptado participa o es creador.
 * Excluye eventos privados de otros usuarios.
 */
const getFriendEvents = async (user_id) => {
  const { data, error } = await supabase.rpc('get_friend_events', { p_user_id: user_id });
  if (error) throw new Error(error.message);
  return (data || []).map(applyDefaultImage);
};

/**
 * Devuelve los amigos aceptados del usuario logueado que participan en el evento.
 * @param {string} event_id
 * @param {string} user_id  - usuario logueado
 */
const getFriendsAttending = async (event_id, user_id) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name AS name, u.avatar_url AS avatar
     FROM friendships f
     -- expandir la relación bidireccional: friend puede estar en user_id o friend_id
     JOIN users u ON u.id = CASE
       WHEN f.user_id   = $2 THEN f.friend_id
       WHEN f.friend_id = $2 THEN f.user_id
     END
     JOIN event_participants ep ON ep.user_id = u.id AND ep.event_id = $1
     WHERE f.status = 'accepted'
       AND (f.user_id = $2 OR f.friend_id = $2)`,
    [event_id, user_id]
  );
  return rows;
};

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getParticipants,
  createFeedback,
  getFriendEvents,
  getFriendsAttending,
};