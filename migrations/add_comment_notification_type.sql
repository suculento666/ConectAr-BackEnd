-- Migración: agrega el tipo 'comment' al CHECK constraint de notifications.type
-- Ejecutar una sola vez contra la base de datos de producción/desarrollo

-- 1. Eliminar el constraint viejo
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

-- 2. Crear el constraint nuevo con 'comment' incluido
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'friend_request', 'message', 'comment'));
