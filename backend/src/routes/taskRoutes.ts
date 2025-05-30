import { Router } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes are protected with authentication
router.use(auth);

// Create a new task
router.post('/', createTask);

// Get all tasks
router.get('/', getTasks);

// Get a specific task
router.get('/:id', getTask);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

export default router; 