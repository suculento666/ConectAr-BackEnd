// validaciones.js - middleware para validar datos antes de procesar

const validarRegistro = (req, res, next) => {
  const { nombre, email, password, edad, ubicacion } = req.body;

  if (!nombre || !email || !password || !edad || !ubicacion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre, email, password, edad, ubicacion' });
  }

  next();
};

const validarLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  next();
};

export { validarRegistro, validarLogin };
