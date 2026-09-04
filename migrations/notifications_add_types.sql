-- Agrega los nuevos valores al enum notification_type
-- Ejecutar en Supabase SQL Editor

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'friend_request_accepted';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'join';
