import { Request, Response, NextFunction } from 'express';
import { mockStore } from '../store/MockDataStore';
import type { UserRole } from '@shared/types';

declare global {
  namespace Express {
    interface Request {
      currentUser?: ReturnType<typeof mockStore.getUserById> extends infer U | undefined ? NonNullable<U> : never;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: '未登录，请先选择用户' });
  }
  const user = mockStore.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: '用户不存在' });
  }
  req.currentUser = user;
  next();
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).json({ error: '未登录' });
    }
    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
}
