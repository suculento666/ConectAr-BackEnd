// eventController.js - maneja eventos, participación y feedback
import {
  newEvent, getEvents, getEvent, editEvent, removeEvent,
  participateInEvent, cancelParticipation, getEventParticipants,
  submitFeedback,
} from '../services/event.service.js';

// GET /api/events?type=deporte - trae todos los eventos, con filtro opcional por event_type
const getAllEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const filters = type ? { event_type: type.toLowerCase() } : {};
    const events = await getEvents(filters);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/events/:id - trae un evento por id
const getEventById = async (req, res) => {
  try {
    const event = await getEvent(req.params.id);
    res.status(200).json(event);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// POST /api/events - crea un evento
const createEvent = async (req, res) => {
  try {
    console.log('📥 Body crear evento:', JSON.stringify(req.body));
    const { creator_id, title, description, location, event_date, event_type, accessibility, max_participants, image_url } = req.body;
    const event = await newEvent({ creator_id, title, description, location, event_date, event_type, accessibility, max_participants, image_url });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/events/:id - edita un evento
const updateEvent = async (req, res) => {
  try {
    const event = await editEvent(req.params.id, req.body);
    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/events/:id - elimina un evento
const deleteEvent = async (req, res) => {
  try {
    const result = await removeEvent(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/events/:id/join - un usuario se une a un evento
const joinEvent = async (req, res) => {
  try {
    const { user_id } = req.body;
    const participation = await participateInEvent({ user_id, event_id: req.params.id });
    res.status(201).json(participation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/events/:id/join - un usuario abandona un evento
const leaveEvent = async (req, res) => {
  try {
    const { user_id } = req.body;
    const result = await cancelParticipation({ user_id, event_id: req.params.id });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/events/:id/participants - trae los participantes de un evento
const getParticipants = async (req, res) => {
  try {
    const participants = await getEventParticipants(req.params.id);
    res.status(200).json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events/:id/feedback - envía feedback de un evento
const createFeedback = async (req, res) => {
  try {
    const { usuario_id, puntuacion, comentario } = req.body;
    const feedback = await submitFeedback({ usuario_id, evento_id: req.params.id, puntuacion, comentario });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
  joinEvent, leaveEvent, getParticipants,
  createFeedback,
};
