// Servicio Friendship - lógica de negocio para amistades
import { sendRequest, acceptRequest, removeFriendship, getFriendshipStatus, getAcceptedFriends, getPendingRequests } from '../repositories/friendship.repository.js';

const sendFriendRequest = async ({ user_id, friend_id }) => {
  if (user_id === friend_id) throw new Error('No podés agregarte a vos mismo');
  const existing = await getFriendshipStatus({ user_id, friend_id });
  if (existing) throw new Error('Ya existe una relación con este usuario');
  return await sendRequest({ user_id, friend_id });
};

const acceptFriendRequest = async ({ current_user_id, requester_id }) => {
  // El que acepta es friend_id, el que envió es user_id
  const rel = await getFriendshipStatus({ user_id: requester_id, friend_id: current_user_id });
  if (!rel || rel.status !== 'pending') throw new Error('No hay solicitud pendiente de este usuario');
  return await acceptRequest({ user_id: requester_id, friend_id: current_user_id });
};

const deleteFriendship = async ({ user_id, friend_id }) => {
  return await removeFriendship({ user_id, friend_id });
};

const getRelationshipStatus = async ({ user_id, friend_id }) => {
  return await getFriendshipStatus({ user_id, friend_id });
};

const getUserFriends = async (user_id) => {
  return await getAcceptedFriends(user_id);
};

const getIncomingRequests = async (user_id) => {
  return await getPendingRequests(user_id);
};

export { sendFriendRequest, acceptFriendRequest, deleteFriendship, getRelationshipStatus, getUserFriends, getIncomingRequests };
