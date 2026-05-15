// Entidad Participacion - tabla intermedia entre usuario y evento
class Participacion {
  constructor({ id, usuario_id, evento_id, estado, asistencia }) {
    this.id = id;
    this.usuario_id = usuario_id; // FK a usuarios
    this.evento_id = evento_id;   // FK a eventos
    this.estado = estado;         // 'pendiente' | 'confirmado'
    this.asistencia = asistencia; // boolean: fue o no fue
  }
}

export default Participacion;
