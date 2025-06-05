import { Request, Response, NextFunction } from 'express';
import List from '../models/List.js';

interface AuthRequest extends Request {
  user: {
    _id: string;
  };
}

export const checkListEditAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const listId = req.params.listId;
    if (!listId) {
      return res.status(400).json({ message: 'List ID is required' });
    }

    const userId = req.user._id;
    const list = await List.findById(listId);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if user is the owner
    if (list.owner.toString() === userId.toString()) {
      return next();
    }

    // Check if user has edit access
    const hasEditAccess = list.sharedWith.some(
      share => share.user.toString() === userId.toString() && share.access === 'Edit'
    );

    if (!hasEditAccess) {
      return res.status(403).json({ message: 'You do not have edit access to this list' });
    }

    next();
  } catch (error) {
    console.error('Error in checkListEditAccess:', error);
    res.status(500).json({ message: 'Error checking list access' });
  }
}; 