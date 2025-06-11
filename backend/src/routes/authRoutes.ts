import express, { RequestHandler } from 'express';
import { login, signup, requestPasswordReset, verifyOTP, resetPassword } from '../controllers/authController.js';
import passport from '../config/passport.js';
import { generateToken } from '../config/passport.js';

interface AuthenticatedRequest extends express.Request {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const router = express.Router();

router.post('/signup', signup as RequestHandler);
router.post('/login', login as RequestHandler);

// Password reset routes
router.post('/reset-password-request', requestPasswordReset as RequestHandler);
router.post('/verify-otp', verifyOTP as RequestHandler);
router.post('/reset-password', resetPassword as RequestHandler);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  ((req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const user = req.user as any; // Type assertion since we know the shape from passport
    const token = generateToken(user);
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };
    
    // Redirect to frontend with token and user data
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  }) as RequestHandler
);

export default router; 