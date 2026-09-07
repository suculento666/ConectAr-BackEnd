-- Tabla: event_invitations
-- Permite al creador de un evento privado invitar usuarios específicos.

CREATE TABLE IF NOT EXISTS event_invitations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID        NOT NULL REFERENCES events(id)  ON DELETE CASCADE,
  invited_user_id UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  invited_by      UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, invited_user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id
  ON event_invitations (event_id);

CREATE INDEX IF NOT EXISTS idx_event_invitations_invited_user_id
  ON event_invitations (invited_user_id);
