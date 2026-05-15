// Entidad Evento - representa un evento o plan creado por un usuario
class Evento {
  constructor({ id, titulo, descripcion, categoria, ubicacion, fecha, creador_id, cupo_max, estado, created_at }) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.categoria = categoria;   // deporte, música, etc.
    this.ubicacion = ubicacion;
    this.fecha = fecha;
    this.creador_id = creador_id; // FK a usuarios
    this.cupo_max = cupo_max;
    this.estado = estado;         // 'activo' | 'cerrado'
    this.created_at = created_at;
  }
}

export default Evento;
