import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
  user: {
    _id: string;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'No authentication token provided' });
      return;
    }
    // console.log('jwtSecret_middlware', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    // console.log(decoded);
    if (!decoded) {
      console.log("Invalid token");
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    req.user = { _id: decoded.userId };
    // console.log(req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
}; 