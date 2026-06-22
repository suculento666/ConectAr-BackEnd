-- Tabla: event_likes
CREATE TABLE IF NOT EXISTS event_likes (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- Tabla: event_saves
CREATE TABLE IF NOT EXISTS event_saves (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- Tabla: event_comments
CREATE TABLE IF NOT EXISTS event_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deshabilitar RLS para que el backend (pg directo) opere sin restricciones
ALTER TABLE event_likes    DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_saves    DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments DISABLE ROW LEVEL SECURITY;
