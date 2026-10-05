// achievementController.js
import { getAllAchievementsWithStatus } from '../services/achievement.service.js';

// GET /api/users/:id/achievements
// Devuelve todos los logros posibles con flag unlocked para el usuario
const getUserAchievements = async (req, res) => {
  try {
    const achievements = await getAllAchievementsWithStatus(req.params.id);
    res.status(200).json(achievements);
  } catch (err) {
    console.error('❌ GET achievements error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export { getUserAchievements };
