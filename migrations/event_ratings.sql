-- Tabla: event_ratings
-- Un usuario que participó en un evento puede calificarlo una vez que la fecha pasó.
-- UNIQUE(event_id, user_id) garantiza una sola calificación por usuario/evento a nivel BD.

CREATE TABLE IF NOT EXISTS event_ratings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  score      INTEGER     NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- Índice para calcular el promedio de un evento rápido
CREATE INDEX IF NOT EXISTS idx_event_ratings_event_id
  ON event_ratings (event_id);

-- Sin RLS: el backend maneja la autorización
ALTER TABLE event_ratings DISABLE ROW LEVEL SECURITY;
