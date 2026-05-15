// Entidad Feedback - tabla intermedia entre usuario y evento para calificaciones
class Feedback {
  constructor({ id, usuario_id, evento_id, puntuacion, comentario }) {
    this.id = id;
    this.usuario_id = usuario_id; // FK a usuarios
    this.evento_id = evento_id;   // FK a eventos
    this.puntuacion = puntuacion; // número del 1 al 5
    this.comentario = comentario;
  }
}

export default Feedback;
