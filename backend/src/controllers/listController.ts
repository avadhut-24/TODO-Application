import { Request, Response } from 'express';
import List, { IList } from '../models/List.js';
import { User, IUser } from '../models/User.js';
import { Types } from 'mongoose';
import { getIO } from '../socket.js';

// Create a new list
export const createList = async (req: Request, res: Response): Promise<void> => {

  try {
    const { title } = req.body;
    const list = new List({
      title,
      owner: req.user._id
    });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Get all lists for the current user
export const getLists = async (req: Request, res: Response): Promise<void> => {
  try {
    const lists = await List.find({
      $or: [
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    }).populate('owner', 'firstName lastName email')
      .populate('sharedWith.user', 'firstName lastName email');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get a specific list
export const getList = async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await List.findOne({
      _id: req.params.id 
    }).populate('owner', 'firstName lastName email')
      .populate('sharedWith.user', 'firstName lastName email')
      .populate('tasks');

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Update a list
export const updateList = async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await List.findOne({
      _id: req.params.listId,
      $or: [
        { owner: req.user },
        { 'sharedWith.user': req.user, 'sharedWith.access': 'Edit' }
      ]
    }).populate('owner', 'firstName lastName email')
      .populate('sharedWith.user', 'firstName lastName email')
      .populate('tasks');

    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    const { title } = req.body;
    if (title) list.title = title;

    await list.save();

    // Get all users who have access to this list
    const usersWithAccess = [
      list.owner._id.toString(),
      ...list.sharedWith.map(share => share.user._id.toString())
    ];

    // Emit update event to all users with access
    const io = getIO();
    usersWithAccess.forEach(userId => {
      io.to(`user:${userId}`).emit('listnameUpdated', list);
      console.log("list updation event emitted successfully!")
      console.log("To user", userId);
    });

    res.json(list);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete a list
export const deleteList = async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await List.findOne({
      _id: req.params.id,
      owner: req.user
    }).populate('sharedWith');

    if (!list) {
      res.status(404).json({ message: 'List not found or no permission' });
      return;
    }

    // Get all users who have access to this list (shared users)
    const usersWithAccess = [
      list.sharedWith.map(share => share.user.toString())
    ];

    await list.deleteOne();

    // Emit delete event to all users with access
    const io = getIO();
    usersWithAccess.forEach(userId => {
      io.to(`user:${userId}`).emit('listDeleted', { listId: list._id });
    });
    console.log('listDelete event emitted successfully');

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const shareList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { listId } = req.params;
    const { email, access } = req.body;

    // Find the user to share with
    const userToShare = await User.findOne({ email }).exec() as (IUser & { _id: Types.ObjectId });
    if (!userToShare) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Find the list
    const list = await List.findById(listId).populate('sharedWith.user', 'firstName lastName email');
    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    // Check if user is already shared with
    const existingShareIndex = list.sharedWith.findIndex(
      share => share.user.toString() === userToShare._id.toString()
    );

    if (existingShareIndex !== -1) {
      // Update existing share
      list.sharedWith[existingShareIndex].access = access;
    } else {
      // Add new share
      list.sharedWith.push({
        user: userToShare._id,
        access
      });
    }

    await list.save();

    // Fetch the updated list with populated data
    const updatedList = await List.findById(listId)
      .populate('owner', 'firstName lastName email')
      .populate('sharedWith.user', 'firstName lastName email')
      .populate('tasks');

    // Emit update to all users in the list room
    const io = getIO();
    io.to(`list:${listId}`).emit('listUpdated', updatedList);
    
    // Emit a specific event to the user being shared with
    io.to(`user:${userToShare._id}`).emit('listShared', updatedList);

    res.json(updatedList);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const removeShare = async (req: Request, res: Response): Promise<void> => {
  try {
    const { listId } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    const list = await List.findById(listId)
      .populate('owner', 'firstName lastName email')
      .populate('sharedWith.user', 'firstName lastName email')
      .populate('tasks');
      
    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    // Remove user from sharedWith array
    list.sharedWith = list.sharedWith.filter(
      share => (share.user as IUser & { _id: Types.ObjectId })._id.toString() !== userId
    );

    await list.save();

    // Emit update to all users in the list room
    const io = getIO();
    io.to(`list:${listId}`).emit('listUpdated', list);
    
    // Emit a specific event to the user whose access was removed
    io.to(`user:${userId}`).emit('listUnshared', { listId });

    res.json(list);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}; 