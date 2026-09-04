-- Función que devuelve eventos futuros donde participan amigos del usuario
CREATE OR REPLACE FUNCTION get_friend_events(p_user_id UUID)
RETURNS TABLE (
  id               UUID,
  creator_id       UUID,
  title            TEXT,
  description      TEXT,
  location         TEXT,
  event_date       TIMESTAMPTZ,
  event_type       TEXT,
  accessibility    TEXT,
  max_participants INT,
  image_url        TEXT,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT e.id, e.creator_id, e.title, e.description, e.location,
    e.event_date, e.event_type, e.accessibility, e.max_participants,
    e.image_url, e.created_at, e.updated_at
  FROM events e
  JOIN event_participants ep ON ep.event_id = e.id
  WHERE e.event_date >= NOW()
    AND e.accessibility = 'publico'
    AND ep.user_id IN (
      SELECT CASE WHEN f.user_id = p_user_id THEN f.friend_id ELSE f.user_id END
      FROM friendships f
      WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id)
        AND f.status = 'accepted'
    )
    AND ep.user_id <> p_user_id  -- que no sea el propio usuario
  ORDER BY e.event_date ASC;
$$;
