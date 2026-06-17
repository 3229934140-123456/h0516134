import { Router } from 'express';
import { mockStore } from '../store/MockDataStore';
import { authMiddleware } from '../middleware/auth';
import type { SendThanksCardRequest } from '@shared/types';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const { senderId, receiverId, type } = req.query;
  const cards = mockStore.getThanksCards({
    senderId: senderId as string,
    receiverId: receiverId as string,
    type: type as any,
  });
  res.json(cards);
});

router.post('/', authMiddleware, (req, res) => {
  const body = req.body as SendThanksCardRequest;
  
  if (!body.receiverId || !body.type || !body.content) {
    return res.status(400).json({ error: '收件人、感谢类型和内容必填' });
  }
  
  if (body.receiverId === req.currentUser?.id && !body.isAnonymous) {
    return res.status(400).json({ error: '不能给自己发送非匿名感谢卡' });
  }

  const newCard = mockStore.addThanksCard({
    senderId: req.currentUser!.id,
    receiverId: body.receiverId,
    type: body.type,
    content: body.content,
    isAnonymous: body.isAnonymous,
  });

  mockStore.addNotification({
    userId: body.receiverId,
    type: 'thanks_received',
    title: '你收到了一张感谢卡 💝',
    content: body.isAnonymous
      ? `一位热心同事给你发送了「${body.type}」感谢卡`
      : `${req.currentUser!.name}给你发送了「${body.type}」感谢卡`,
    relatedId: newCard.id,
  });

  if (!body.isAnonymous) {
    mockStore.addNotification({
      userId: req.currentUser!.id,
      type: 'thanks_sent',
      title: '感谢卡已送达 ✨',
      content: `你给${mockStore.getUserById(body.receiverId)?.name || '同事'}的感谢卡已成功送达`,
      relatedId: newCard.id,
    });
  }

  res.status(201).json(newCard);
});

router.get('/:id', authMiddleware, (req, res) => {
  const card = mockStore.thanksCards.find(c => c.id === req.params.id);
  if (!card) {
    return res.status(404).json({ error: '感谢卡不存在' });
  }
  res.json(card);
});

export default router;
