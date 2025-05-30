import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    }
  }
} 