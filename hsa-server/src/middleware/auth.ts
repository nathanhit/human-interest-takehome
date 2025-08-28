import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      userId: string;
      email: string;
    };

    // Add user to request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
