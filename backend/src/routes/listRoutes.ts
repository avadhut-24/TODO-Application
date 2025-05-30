import { Router } from 'express';
import { createList, getLists, getList, updateList, deleteList, shareList, removeShare } from '../controllers/listController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes are protected with authentication
router.use(auth);

// Create a new list
router.post('/', createList);

// Get all lists for the current user
router.get('/', getLists);

// Get a specific list
router.get('/:id', getList);

// Update a list
router.put('/:id', updateList);

// Delete a list
router.delete('/:id', deleteList);

// Share list
router.post('/:listId/share', shareList);

// Remove share
router.delete('/:listId/share', removeShare);

export default router; 