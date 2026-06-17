import { Router } from 'express';
import { mockStore } from '../store/MockDataStore';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  res.json(mockStore.monthlyStars);
});

router.post('/calculate', authMiddleware, (_req, res) => {
  mockStore.recalculateMonthlyStars();
  res.json({ message: '已重新计算月度之星', data: mockStore.monthlyStars });
});

export default router;
