import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'GET /api/events - próximamente' });
});

router.post('/', (req, res) => {
  res.json({ message: 'POST /api/events - próximamente' });
});

export default router;
