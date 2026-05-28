// Entidad Evento - representa un evento o plan creado por un usuario
class Evento {
  constructor({ id, creator_id, title, description, location, event_date, event_type, accessibility, max_participants, image_url, created_at }) {
    this.id = id;
    this.creator_id = creator_id;           // FK a users
    this.title = title;
    this.description = description;
    this.location = location;
    this.event_date = event_date;           // ISO 8601
    this.event_type = event_type;           // 'deporte' | 'concierto' | 'cultura' | 'fiesta' | 'otro'
    this.accessibility = accessibility;     // 'publico' | 'privado'
    this.max_participants = max_participants;
    this.image_url = image_url;
    this.created_at = created_at;
  }
}

export default Evento;
