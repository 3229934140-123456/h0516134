import { Router } from 'express';
import { mockStore } from '../store/MockDataStore';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const { department, role } = req.query;
  const users = mockStore.getUsers(
    department as any,
    role as string,
  );
  res.json(users);
});

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.currentUser);
});

router.get('/:id', authMiddleware, (req, res) => {
  const user = mockStore.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

export default router;
