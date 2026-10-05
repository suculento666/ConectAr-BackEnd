-- Tabla: event_shares
-- Registra cada vez que un usuario (o anónimo) comparte un evento.
-- user_id es nullable para permitir shares sin login.
CREATE TABLE IF NOT EXISTS event_shares (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para contar shares por evento rápidamente
CREATE INDEX IF NOT EXISTS idx_event_shares_event_id ON event_shares(event_id);

-- Deshabilitar RLS para que el backend (pg directo) opere sin restricciones
ALTER TABLE event_shares DISABLE ROW LEVEL SECURITY;
