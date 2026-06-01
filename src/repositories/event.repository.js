// Repositorio Event - acceso a la base de datos (tablas: events, event_participants, feedback)
import supabase from '../configs/supabase.js';

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

const getAllEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*, users(id, username, full_name, avatar_url)');
  if (error) throw new Error(error.message);
  return data;
};

const getEventById = async (id) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
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

const getParticipants = async (event_id) => {
  const { data, error } = await supabase
    .from('event_participants')
    .select('*, users(id, username, full_name, avatar_url)')
    .eq('event_id', event_id);
  if (error) throw new Error(error.message);
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
