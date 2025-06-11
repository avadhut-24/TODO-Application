import express, { RequestHandler } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { auth } from '../middleware/auth.js';
import { checkListEditAccess } from '../middleware/checkListAccess.js';

const router = express.Router();

// All routes require authentication
router.use(auth as RequestHandler);

// All routes include listId parameter
router.post('/:listId', checkListEditAccess as RequestHandler, createTask as RequestHandler);
router.get('/', getTasks as RequestHandler);
router.get('/:id', getTask as RequestHandler);
router.put('/:listId/:id', checkListEditAccess as RequestHandler, updateTask as RequestHandler);
router.delete('/:listId/:id', checkListEditAccess as RequestHandler, deleteTask as RequestHandler);

export default router; 