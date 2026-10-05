-- ─────────────────────────────────────────────────────────────
-- TABLA: user_achievements
-- Guarda qué logros desbloqueó cada usuario y cuándo.
-- La PK compuesta (user_id, achievement_id) garantiza unicidad.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT        NOT NULL,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id
  ON user_achievements (user_id);

-- ─────────────────────────────────────────────────────────────
-- RLS: cada usuario solo ve sus propios logros
-- El backend usa service role, así que puede leer/escribir todo
-- ─────────────────────────────────────────────────────────────

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios ven sus propios logros"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "service role puede insertar logros"
  ON user_achievements FOR INSERT
  WITH CHECK (true);
