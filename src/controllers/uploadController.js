// uploadController.js - maneja el upload de avatar del usuario
import multer from 'multer';
import supabase from '../configs/supabase.js';
import { updateUser } from '../repositories/user.repository.js';
import { evaluateAchievements } from '../services/achievement.service.js';

// Multer en memoria — el archivo se pasa directo a Supabase Storage sin tocar disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, png, webp, gif)'));
    }
  },
});

// POST /api/users/me/avatar
// multipart/form-data con campo "avatar"
// Devuelve el usuario actualizado con la nueva avatar_url
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const user_id  = req.user.id;
    const ext      = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const filePath = `avatars/${user_id}.${ext}`;

    // Subir a Supabase Storage (bucket: avatars, debe existir y ser público)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true, // sobreescribe si ya existe
      });

    if (uploadError) throw new Error(uploadError.message);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatar_url = urlData.publicUrl;

    // Actualizar avatar_url en public.users
    const user = await updateUser(user_id, { avatar_url });

    res.status(200).json(user);

    // Evaluar logro de perfil completo al subir avatar (no bloquea la respuesta)
    evaluateAchievements(user_id, 'profile_complete').catch((e) =>
      console.error('⚠️ achievements profile_complete (avatar):', e.message)
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { upload, uploadAvatar };
