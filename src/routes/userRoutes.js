import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'GET /api/users - próximamente' });
});

router.post('/', (req, res) => {
  res.json({ message: 'POST /api/users - próximamente' });
});

export default router;
