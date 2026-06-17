import { Router } from 'express';
import { mockStore } from '../store/MockDataStore';
import { authMiddleware, requireRoles } from '../middleware/auth';
import type { CreateRecognitionRequest } from '@shared/types';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const { receiverId } = req.query;
  const recognitions = mockStore.getRecognitions(receiverId as string);
  res.json(recognitions);
});

router.post('/', authMiddleware, requireRoles('manager'), (req, res) => {
  const body = req.body as CreateRecognitionRequest;

  if (!body.receiverId || !body.title || !body.description || !body.level || !body.rewardType || !body.rewardDetail) {
    return res.status(400).json({ error: '所有字段均为必填项' });
  }

  if (body.receiverId === req.currentUser?.id) {
    return res.status(400).json({ error: '不能给自己授予表彰' });
  }

  if (!body.description || body.description.trim().length < 30) {
    return res.status(400).json({ error: '表彰事迹描述至少需要30字' });
  }

  const receiver = mockStore.getUserById(body.receiverId);
  if (!receiver) {
    return res.status(400).json({ error: '指定的表彰对象不存在' });
  }

  const newRecognition = mockStore.addRecognition({
    issuerId: req.currentUser!.id,
    receiverId: body.receiverId,
    title: body.title,
    description: body.description,
    level: body.level,
    rewardType: body.rewardType,
    rewardDetail: body.rewardDetail,
  });

  mockStore.addNotification({
    userId: body.receiverId,
    type: 'recognition_received',
    title: '🎉 恭喜你获得正式表彰！',
    content: `${req.currentUser!.name}授予你「${body.title}」，详情请查看个人主页`,
    relatedId: newRecognition.id,
  });

  for (const user of mockStore.users) {
    if (user.id !== body.receiverId) {
      mockStore.addNotification({
        userId: user.id,
        type: 'recognition_broadcast',
        title: '🏆 新的表彰揭晓',
        content: `${mockStore.getUserById(body.receiverId)?.name}获得了「${body.title}」表彰，让我们一起祝贺！`,
        relatedId: newRecognition.id,
      });
    }
  }

  res.status(201).json(newRecognition);
});

export default router;
