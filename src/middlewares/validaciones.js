const validarRegistro = (req, res, next) => {
  console.log('📥 Body en validarRegistro:', JSON.stringify(req.body));
  const { email, password, username, full_name } = req.body;

  if (!email || !password || !username || !full_name) {
    return res.status(400).json({ 
      error: 'Todos los campos son obligatorios: email, password, username, full_name' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'El username debe tener al menos 3 caracteres' });
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

const validarActualizacionUsuario = (req, res, next) => {
  const { bio, avatar_url, age, location } = req.body;

  if (age !== undefined && (!Number.isInteger(age) || age < 13 || age > 100)) {
    return res.status(400).json({ error: 'La edad debe ser un número entre 13 y 100' });
  }

  if (avatar_url !== undefined && avatar_url !== '' && !avatar_url.startsWith('http')) {
    return res.status(400).json({ error: 'El avatar_url debe ser una URL válida' });
  }

  if (bio !== undefined && bio.length > 300) {
    return res.status(400).json({ error: 'La bio no puede superar los 300 caracteres' });
  }

  if (location !== undefined && location.length > 100) {
    return res.status(400).json({ error: 'La ubicación no puede superar los 100 caracteres' });
  }

  next();
};

const validarEvento = (req, res, next) => {
  const { title, event_date, event_type, accessibility } = req.body;

  if (title == null || event_date == null || event_type == null || accessibility == null) 
 {
    return res.status(400).json({ 
      error: 'Todos los campos son obligatorios: title, event_date, event_type, accessibility' 
    });
  }

  const tiposValidos = ['deporte', 'deportes', 'concierto', 'cultura', 'fiesta', 'otro'];
  if (!tiposValidos.includes(event_type)) {
    return res.status(400).json({ error: 'event_type debe ser: deporte, concierto, cultura, fiesta u otro' });
  }

  if (!['publico', 'privado'].includes(accessibility)) {
    return res.status(400).json({ error: 'accessibility debe ser "publico" o "privado"' });
  }

  if (isNaN(Date.parse(event_date))) {
    return res.status(400).json({ error: 'event_date no tiene un formato de fecha válido' });
  }

  next();
};

export { validarRegistro, validarLogin, validarActualizacionUsuario, validarEvento };
