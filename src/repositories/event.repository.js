// Repositorio Event - acceso a la base de datos (tablas: events, event_participants, feedback)
import supabase from '../configs/supabase.js';

// Imágenes por defecto según event_type
const DEFAULT_IMAGES = {
  concierto: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  deporte:   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
  cultura:   'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800',
  fiesta:    'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800',
  otro:      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
};

const applyDefaultImage = (event) => ({
  ...event,
  image_url: event.image_url || DEFAULT_IMAGES[event.event_type] || DEFAULT_IMAGES.otro,
});

// --- Events ---

const createEvent = async ({ creator_id, title, description, location, event_date, event_type, accessibility, max_participants, image_url }) => {
  const { data, error } = await supabase
    .from('events')
    .insert([{ creator_id, title, description, location, event_date, event_type, accessibility, max_participants, image_url }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const getAllEvents = async (filters = {}) => {
  let query = supabase
    .from('events')
    .select('*, users(id, username, full_name, avatar_url)');

  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data.map(applyDefaultImage);
};

const getEventById = async (id) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return applyDefaultImage(data);
};

const updateEvent = async (id, fields) => {
  const { data, error } = await supabase
    .from('events')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const deleteEvent = async (id) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Evento eliminado' };
};

// --- Event Participants ---

const joinEvent = async ({ user_id, event_id }) => {
  // Verificar si ya existe la participación
  const { data: existing } = await supabase
    .from('event_participants')
    .select('user_id')
    .eq('user_id', user_id)
    .eq('event_id', event_id)
    .single();

  if (existing) {
    throw new Error('Ya estás anotado en este evento');
  }

  const { data, error } = await supabase
    .from('event_participants')
    .insert([{ user_id, event_id }])
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
  return { message: 'Participación cancelada' };
};

const FAKE_PARTICIPANTS = [
  { user_id: 'fake-1', event_id: null, joined_at: new Date().toISOString(), users: { id: 'fake-1', username: 'martina_g',     full_name: 'Martina González', avatar_url: 'https://i.pravatar.cc/150?img=1' } },
  { user_id: 'fake-2', event_id: null, joined_at: new Date().toISOString(), users: { id: 'fake-2', username: 'lucas_rr',      full_name: 'Lucas Ramírez',    avatar_url: 'https://i.pravatar.cc/150?img=2' } },
  { user_id: 'fake-3', event_id: null, joined_at: new Date().toISOString(), users: { id: 'fake-3', username: 'sofi.lopez',    full_name: 'Sofía López',      avatar_url: 'https://i.pravatar.cc/150?img=3' } },
  { user_id: 'fake-4', event_id: null, joined_at: new Date().toISOString(), users: { id: 'fake-4', username: 'tomifernandez', full_name: 'Tomás Fernández', avatar_url: 'https://i.pravatar.cc/150?img=4' } },
  { user_id: 'fake-5', event_id: null, joined_at: new Date().toISOString(), users: { id: 'fake-5', username: 'caro.diaz',     full_name: 'Carolina Díaz',    avatar_url: 'https://i.pravatar.cc/150?img=5' } },
];

const getParticipants = async (event_id) => {
  const { data, error } = await supabase
    .from('event_participants')
    .select('*, users(id, username, full_name, avatar_url)')
    .eq('event_id', event_id);
  if (error) throw new Error(error.message);

  // Si no hay participantes reales, devolver los hardcodeados
  if (!data || data.length === 0) {
    return FAKE_PARTICIPANTS.map(p => ({ ...p, event_id }));
  }
  return data;
};

// --- Feedback ---

const createFeedback = async ({ usuario_id, evento_id, puntuacion, comentario }) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{ usuario_id, evento_id, puntuacion, comentario }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export {
  createEvent, getAllEvents, getEventById, updateEvent, deleteEvent,
  joinEvent, leaveEvent, getParticipants,
  createFeedback,
};
