// Entidad User - representa la estructura de un usuario en el negocio
class User {
  constructor({ id, email, username, full_name, bio, avatar_url, xp, level, created_at }) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.full_name = full_name;
    this.bio = bio;
    this.avatar_url = avatar_url;
    this.xp = xp;       // puntos de experiencia
    this.level = level; // nivel calculado desde xp
    this.created_at = created_at;
  }
}

export default User;
