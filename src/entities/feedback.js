// Entidad Feedback - calificación de un usuario sobre un evento
class Feedback {
  constructor({ id, usuario_id, evento_id, puntuacion, comentario }) {
    this.id = id;
    this.usuario_id = usuario_id; // FK a users
    this.evento_id = evento_id;   // FK a events
    this.puntuacion = puntuacion; // 1 a 5
    this.comentario = comentario;
  }
}

export default Feedback;
