// Entidad User - representa la estructura de un usuario en el negocio
class User {
  constructor({ id, nombre, edad, email, password, ubicacion, reputacion, verificado, created_at }) {
    this.id = id;
    this.nombre = nombre;
    this.edad = edad;
    this.email = email;
    this.password = password;
    this.ubicacion = ubicacion;   // zona de CABA
    this.reputacion = reputacion; // score numérico
    this.verificado = verificado; // boolean
    this.created_at = created_at;
  }
}

export default User;
