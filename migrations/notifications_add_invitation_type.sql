-- Agrega el tipo 'event_invitation' al enum notification_type
-- Ejecutar en Supabase SQL Editor antes del deploy

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'event_invitation';
