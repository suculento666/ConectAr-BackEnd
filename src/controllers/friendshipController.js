// friendshipController.js - maneja las relaciones de amistad
import { sendFriendRequest, acceptFriendRequest, deleteFriendship, getRelationshipStatus, getUserFriends, getIncomingRequests } from '../services/friendship.service.js';
import { getSuggestions } from '../repositories/people.repository.js';

// POST /api/friendships - enviar solicitud de amistad
const sendRequest = async (req, res) => {
  try {
    const user_id   = req.user.id;
    const { friend_id } = req.body;
    if (!friend_id) return res.status(400).json({ error: 'friend_id es obligatorio' });
    const result = await sendFriendRequest({ user_id, friend_id });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/friendships/:requester_id/accept - aceptar solicitud
const acceptRequest = async (req, res) => {
  try {
    const current_user_id = req.user.id;
    const requester_id    = req.params.requester_id;
    const result = await acceptFriendRequest({ current_user_id, requester_id });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/friendships/:friend_id - eliminar amistad o rechazar solicitud
const removeRequest = async (req, res) => {
  try {
    const user_id   = req.user.id;
    const friend_id = req.params.friend_id;
    const result = await deleteFriendship({ user_id, friend_id });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/friendships/status/:friend_id - estado de la relación con otro usuario
const getStatus = async (req, res) => {
  try {
    const user_id   = req.user.id;
    const friend_id = req.params.friend_id;
    const result = await getRelationshipStatus({ user_id, friend_id });
    // null = sin relación, objeto = { status, direction }
    res.status(200).json(result || { status: 'none' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/friendships - lista de amigos aceptados
const getFriends = async (req, res) => {
  try {
    const user_id = req.user.id;
    const friends = await getUserFriends(user_id);
    res.status(200).json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/friendships/requests - solicitudes pendientes recibidas
const getPending = async (req, res) => {
  try {
    const user_id = req.user.id;
    const requests = await getIncomingRequests(user_id);
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/friendships/suggestions - posibles amistades (comparten eventos, no son amigos aún)
const getPeopleSuggestions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const suggestions = await getSuggestions(user_id);
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { sendRequest, acceptRequest, removeRequest, getStatus, getFriends, getPending, getPeopleSuggestions };
