// achievementController.js
import { getAllAchievementsWithStatus, syncAllAchievements } from '../services/achievement.service.js';

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

// POST /api/users/:id/achievements/sync
// Recalcula y persiste todos los logros del usuario basado en su actividad actual.
// Útil para usuarios que actuaron antes de que el sistema de logros estuviera activo.
// Auth requerida — solo el propio usuario puede hacer sync de sus logros.
const syncAchievements = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Solo podés sincronizar tus propios logros' });
    }
    const newlyUnlocked = await syncAllAchievements(req.params.id);
    const all = await getAllAchievementsWithStatus(req.params.id);
    res.status(200).json({ newly_unlocked: newlyUnlocked.length, achievements: all });
  } catch (err) {
    console.error('❌ POST achievements/sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export { getUserAchievements, syncAchievements };
