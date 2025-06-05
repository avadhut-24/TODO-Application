import express from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { auth } from '../middleware/auth.js';
import { checkListEditAccess } from '../middleware/checkListAccess.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// All routes include listId parameter
router.post('/:listId', checkListEditAccess, createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:listId/:id', checkListEditAccess, updateTask);
router.delete('/:listId/:id', checkListEditAccess, deleteTask);

export default router; 