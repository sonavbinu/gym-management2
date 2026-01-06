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
    const token = req.header('Authorization')?.replace('Bearer', '');

    if (!token) {
      res.status(401).json({ message: 'No authentication token' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
