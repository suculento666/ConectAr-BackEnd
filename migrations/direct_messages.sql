-- Tabla de mensajes directos entre usuarios
CREATE TABLE IF NOT EXISTS direct_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_dm_sender   ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_conversation
  ON direct_messages(
    LEAST(sender_id::text, receiver_id::text),
    GREATEST(sender_id::text, receiver_id::text),
    created_at DESC
  );

-- RLS (el backend usa service role así que no bloquea, pero queda documentado)
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios ven sus propios mensajes"
  ON direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "usuarios envían mensajes"
  ON direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
