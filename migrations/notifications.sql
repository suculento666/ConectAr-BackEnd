-- Tabla: notifications
-- Persiste notificaciones con estado read para poder marcarlas como leídas.
-- Tipos soportados: 'like', 'friend_request', 'message'

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('like', 'friend_request', 'message')),
  actor_id   UUID        REFERENCES users(id)            ON DELETE SET NULL,
  event_id   UUID        REFERENCES events(id)           ON DELETE SET NULL,
  read       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para traer notificaciones de un usuario ordenadas (query más frecuente)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON notifications (user_id, created_at DESC);

-- Sin RLS: el backend maneja la autorización
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- NOTA: La tabla friendships ya existe con columnas user_id/friend_id.
-- El nuevo front usa sender_id/receiver_id como nombres conceptuales,
-- pero la tabla no cambia — el backend traduce en los repositories.
-- Si querés agregar vistas alias opcionales:
-- CREATE OR REPLACE VIEW friendships_v AS
--   SELECT id, user_id AS sender_id, friend_id AS receiver_id, status, created_at
--   FROM friendships;
