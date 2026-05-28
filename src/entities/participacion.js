// Entidad Participacion - tabla intermedia entre usuario y evento
class Participacion {
  constructor({ id, user_id, event_id, joined_at }) {
    this.id = id;
    this.user_id = user_id;   // FK a users
    this.event_id = event_id; // FK a events
    this.joined_at = joined_at;
  }
}

export default Participacion;
