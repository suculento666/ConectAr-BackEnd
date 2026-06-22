// eventController.js
import {newEvent, getEvents, getEvent, editEvent, removeEvent, participateInEvent, cancelParticipation, getEventParticipants, submitFeedback,
} from '../services/event.service.js';

// GET /api/events
const getAllEvents = async (req, res) => {
  try {

    const { type, location, accessibility } = req.query;

    const filters = {};

    if (type)
      filters.event_type = type.toLowerCase();

    if (location)
      filters.location = location;

    if (accessibility)
      filters.accessibility = accessibility;

    const events = await getEvents(filters);

    res.status(200).json(events);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
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

    const participation = await participateInEvent({
      user_id: req.user.id,
      event_id: req.params.id
    });

    res.status(201).json(participation);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
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

export {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent,joinEvent,leaveEvent,getParticipants,createFeedback,};