import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../types';

export const roleCheck = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.warn('Role check failed', {
        required: roles,
        user: req.user,
        path: req.path,
        method: req.method,
      });
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    next();
  };
};
