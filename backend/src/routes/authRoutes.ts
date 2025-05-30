import express, { RequestHandler } from 'express';
import { login, signup } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup as RequestHandler);
router.post('/login', login as RequestHandler);

export default router; 