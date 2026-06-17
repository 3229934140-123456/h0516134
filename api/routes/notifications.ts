import { Router } from 'express';
import { mockStore } from '../store/MockDataStore';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const notifications = mockStore.getNotifications(req.currentUser!.id);
  res.json(notifications);
});

router.get('/unread-count', authMiddleware, (req, res) => {
  const count = mockStore.notifications.filter(
    n => n.userId === req.currentUser!.id && !n.isRead
  ).length;
  res.json({ count });
});

router.post('/read-all', authMiddleware, (req, res) => {
  const count = mockStore.markAllNotificationsRead(req.currentUser!.id);
  res.json({ message: `已标记${count}条通知为已读`, count });
});

router.post('/:id/read', authMiddleware, (req, res) => {
  const success = mockStore.markNotificationRead(req.params.id);
  if (!success) {
    return res.status(404).json({ error: '通知不存在' });
  }
  res.json({ message: '已标记为已读' });
});

export default router;
