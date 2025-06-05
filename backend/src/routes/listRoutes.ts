import { Router, RequestHandler } from 'express';
import { createList, getLists, getList, updateList, deleteList, shareList, removeShare } from '../controllers/listController.js';
import { auth } from '../middleware/auth.js';
import { checkListEditAccess } from '../middleware/checkListAccess.js';

const router = Router();

// All routes are protected with authentication
router.use(auth);

// Create a new list
router.post('/', createList as RequestHandler);

// Get all lists for the current user
router.get('/', getLists as RequestHandler);

// Get a specific list
router.get('/:id', getList as RequestHandler);

// Update a list (requires edit access)
router.put('/:id', checkListEditAccess as RequestHandler, updateList as RequestHandler);

// Delete a list (only owner can delete)
router.delete('/:id', deleteList as RequestHandler);

// Share list (requires edit access)
router.post('/:listId/share', checkListEditAccess as RequestHandler, shareList as RequestHandler);

// Remove share (requires edit access)
router.delete('/:listId/share', checkListEditAccess as RequestHandler, removeShare as RequestHandler);

export default router; 