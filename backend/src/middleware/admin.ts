import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // This middleware assumes authenticateToken ran first, so req.user exists
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  next();
};