-- Agrega fecha de nacimiento a la tabla users
-- Nullable: usuarios existentes no se ven afectados
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
