import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
export const auth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log(' Auth middleware called for:', req.method, req.path);
    const authHeader = req.header('Authorization');
    console.log(
      ' Auth header:',
      authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING'
    );

    if (!authHeader) {
      console.log(' No auth header found');
      res.status(401).json({ message: 'No authentication token' });
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      console.log(' No token after parsing');
      res.status(401).json({ message: 'No authentication token' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    console.log(
      ' Token verified. User:',
      decoded.userId,
      'Role:',
      decoded.role
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.error(' Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const protect = auth;

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};
