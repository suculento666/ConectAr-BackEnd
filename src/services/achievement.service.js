// achievement.service.js - lógica de evaluación y desbloqueo de logros
import {
  ACHIEVEMENTS,
  unlockAchievement,
  getUserAchievements,
  countJoins,
  countCreated,
  countLikes,
  countRatings,
  checkProfileComplete,
} from '../repositories/achievement.repository.js';

// Evalúa y desbloquea todos los logros correspondientes al tipo de acción.
// condition_type: 'join_count' | 'create_count' | 'like_count' | 'rate_count' | 'profile_complete'
// Devuelve array de logros nuevos desbloqueados (puede ser vacío)
export const evaluateAchievements = async (user_id, condition_type) => {
  let currentValue = 0;

  switch (condition_type) {
    case 'join_count':
      currentValue = await countJoins(user_id);
      break;
    case 'create_count':
      currentValue = await countCreated(user_id);
      break;
    case 'like_count':
      currentValue = await countLikes(user_id);
      break;
    case 'rate_count':
      currentValue = await countRatings(user_id);
      break;
    case 'profile_complete':
      currentValue = (await checkProfileComplete(user_id)) ? 1 : 0;
      break;
    default:
      return [];
  }

  // Filtra los logros que aplican a este tipo y cuya condición se cumple
  const candidates = ACHIEVEMENTS.filter(
    (a) => a.condition_type === condition_type && currentValue >= a.condition_value
  );

  const newlyUnlocked = [];
  for (const achievement of candidates) {
    const result = await unlockAchievement(user_id, achievement.id);
    if (result) {
      newlyUnlocked.push({ ...achievement, unlocked_at: result.unlocked_at });
      console.log(`🏅 Logro desbloqueado: [${user_id}] → ${achievement.name}`);
    }
  }

  return newlyUnlocked;
};

// Trae todos los logros desbloqueados por un usuario
export const getAchievements = async (user_id) => {
  return await getUserAchievements(user_id);
};

// Evalúa TODOS los tipos de logros para un usuario y persiste los que cumple.
// Útil para sincronizar logros de usuarios existentes que actuaron antes de que
// el sistema de logros estuviera funcionando correctamente.
export const syncAllAchievements = async (user_id) => {
  const types = ['join_count', 'create_count', 'like_count', 'rate_count', 'profile_complete'];
  const allUnlocked = [];
  for (const type of types) {
    const unlocked = await evaluateAchievements(user_id, type);
    allUnlocked.push(...unlocked);
  }
  return allUnlocked;
};
export const getAllAchievementsWithStatus = async (user_id) => {
  const unlocked = await getUserAchievements(user_id);
  const unlockedIds = new Set(unlocked.map((a) => a.id));

  return ACHIEVEMENTS.map((a) => {
    const found = unlocked.find((u) => u.id === a.id);
    return {
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlocked_at: found?.unlocked_at || null,
    };
  });
};
