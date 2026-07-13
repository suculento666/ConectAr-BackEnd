-- Tabla: event_messages (chat grupal por evento)
-- Solo participantes del evento pueden escribir; todos pueden leer.

CREATE TABLE IF NOT EXISTS event_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  content    TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para traer mensajes de un evento ordenados por fecha (query más frecuente)
CREATE INDEX IF NOT EXISTS idx_event_messages_event_id_created_at
  ON event_messages (event_id, created_at ASC);

-- Sin RLS: el backend (pg directo) maneja la autorización
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;
