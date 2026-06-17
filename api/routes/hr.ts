import { Router } from 'express';
import { mockStore } from '../store/MockDataStore';
import { authMiddleware, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, requireRoles('hr', 'manager'), (_req, res) => {
  const stats = mockStore.getHRStats();
  res.json(stats);
});

router.get('/quiet-contributors', authMiddleware, requireRoles('hr', 'manager'), (_req, res) => {
  const stats = mockStore.getHRStats();
  const users = stats.quietContributors.map(id => mockStore.getUserById(id)).filter(Boolean);
  res.json(users);
});

export default router;
