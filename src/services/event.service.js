// Servicio Event - lógica de negocio para eventos, participaciones y feedback
import {
  createEvent, getAllEvents, getEventById, updateEvent, deleteEvent,
  joinEvent, leaveEvent, getParticipants,
  createFeedback,
} from '../repositories/event.repository.js';

const newEvent = async ({ creator_id, title, description, location, event_date, event_type, accessibility, max_participants, image_url }) => {
  if (!title || !event_date || !event_type || !accessibility) {
    throw new Error('title, event_date, event_type y accessibility son obligatorios');
  }

  // Normalizar event_type: quitar plurales y espacios
  const tipoNormalizado = event_type.toLowerCase().trim().replace(/s$/, '');
  const tiposValidos = ['deporte', 'concierto', 'cultura', 'fiesta', 'otro'];
  const tipoFinal = tiposValidos.includes(tipoNormalizado) ? tipoNormalizado : (tiposValidos.includes(event_type.toLowerCase().trim()) ? event_type.toLowerCase().trim() : null);
  if (!tipoFinal) {
    throw new Error('event_type debe ser: deporte, concierto, cultura, fiesta u otro');
  }

  if (!['publico', 'privado'].includes(accessibility)) {
    throw new Error('accessibility debe ser "publico" o "privado"');
  }
  return await createEvent({ creator_id, title, description, location, event_date, event_type: tipoFinal, accessibility, max_participants, image_url });
};

const getEvents = async (filters = {}) => {
  return await getAllEvents(filters);
};

const getEvent = async (id) => {
  return await getEventById(id);
};

const editEvent = async (id, fields) => {
  return await updateEvent(id, fields);
};

const removeEvent = async (id) => {
  return await deleteEvent(id);
};

const participateInEvent = async ({ user_id, event_id }) => {
  if (!user_id || !event_id) {
    throw new Error('user_id y event_id son obligatorios');
  }
  return await joinEvent({ user_id, event_id });
};

const cancelParticipation = async ({ user_id, event_id }) => {
  if (!user_id || !event_id) {
    throw new Error('user_id y event_id son obligatorios');
  }
  return await leaveEvent({ user_id, event_id });
};

const getEventParticipants = async (event_id) => {
  return await getParticipants(event_id);
};

const submitFeedback = async ({ usuario_id, evento_id, puntuacion, comentario }) => {
  if (!usuario_id || !evento_id || !puntuacion) {
    throw new Error('usuario_id, evento_id y puntuacion son obligatorios');
  }
  if (puntuacion < 1 || puntuacion > 5) {
    throw new Error('La puntuación debe ser entre 1 y 5');
  }
  return await createFeedback({ usuario_id, evento_id, puntuacion, comentario });
};

export {
  newEvent, getEvents, getEvent, editEvent, removeEvent,
  participateInEvent, cancelParticipation, getEventParticipants,
  submitFeedback,
};
