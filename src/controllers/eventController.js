// eventController.js
import {newEvent, getEvents, getEvent, editEvent, removeEvent, participateInEvent, cancelParticipation, getEventParticipants, submitFeedback,
} from '../services/event.service.js';
import { insertNotification } from '../repositories/notification.repository.js';
import { getFriendEvents } from '../repositories/event.repository.js';

// GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const { type, location, accessibility } = req.query;

    const filters = {};
    if (type)          filters.event_type    = type.toLowerCase();
    if (location)      filters.location      = location;
    if (accessibility) filters.accessibility = accessibility;

    // Extraer user_id del token si viene — sin obligar auth
    const user_id = req.user?.id || null;

    const events = await getEvents(filters, user_id);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {

    const event = await getEvent(req.params.id);

    res.status(200).json(event);

  } catch (err) {
    res.status(404).json({
      error: err.message
    });
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {

    const creator_id = req.user.id;

    const {title, description, location, event_date, event_type, accessibility, max_participants, image_url } = req.body;

    const event = await newEvent({creator_id, title,description,location,event_date,event_type,accessibility,max_participants,image_url});

    res.status(201).json(event);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {

    const event = await editEvent(req.params.id, req.body, req.user.id);

    res.status(200).json(event);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {

    const result = await removeEvent(
      req.params.id,
      req.user.id
    );

    res.status(200).json(result);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

// POST /api/events/:id/join
const joinEvent = async (req, res) => {
  try {
    const user_id  = req.user.id;
    const event_id = req.params.id;

    const participation = await participateInEvent({ user_id, event_id });

    // Notificar al creador del evento, pero no si se anota él mismo
    try {
      const event = await getEvent(event_id);
      if (event && event.creator_id !== user_id) {
        await insertNotification({
          user_id:  event.creator_id,
          type:     'join',
          actor_id: user_id,
          event_id,
        });
      }
    } catch (notifErr) {
      console.error('⚠️ No se pudo crear notificación de join:', notifErr.message);
    }

    res.status(201).json(participation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/events/:id/join
const leaveEvent = async (req, res) => {
  try {

    const result = await cancelParticipation({
      user_id: req.user.id,
      event_id: req.params.id
    });

    res.status(200).json(result);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

// GET /api/events/:id/participants
const getParticipants = async (req, res) => {
  try {

    const participants = await getEventParticipants(req.params.id);

    res.status(200).json(participants);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// POST /api/events/:id/feedback
const createFeedback = async (req, res) => {
  try {

    const { puntuacion, comentario } = req.body;

    const feedback = await submitFeedback({
      usuario_id: req.user.id,
      evento_id: req.params.id,
      puntuacion,
      comentario
    });

    res.status(201).json(feedback);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
};

// GET /api/events/friends — eventos donde participan amigos del usuario logueado
const friendEvents = async (req, res) => {
  try {
    const user_id = req.user.id;
    const events  = await getFriendEvents(user_id);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent,joinEvent,leaveEvent,getParticipants,createFeedback,friendEvents,};