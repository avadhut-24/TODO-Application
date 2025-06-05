import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task.js';
import List, { IList } from '../models/List.js';
import { Types } from 'mongoose';
import { getIO } from '../socket.js';

// Helper function to get populated list
const getPopulatedList = async (listId: string) => {
  return await List.findById(listId)
    .populate('owner', 'firstName lastName email')
    .populate('sharedWith.user', 'firstName lastName email')
    .populate({
      path: 'tasks',
      options: { sort: { createdAt: -1 } }  // Sort tasks by creation date, newest first
    });
};

// Create a new task
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, status, priority, listId } = req.body;
    
    // Create the task
    const task = new Task({
      name,
      status,
      priority
    });
    await task.save();
    console.log('Task created:', task._id);

    // Update the list with the new task
    const list = await List.findById(listId);
    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    list.tasks.push(task._id as Types.ObjectId);
    await list.save();
    console.log('List updated with new task');

    // Get the fully populated list with all task details
    const populatedList = await getPopulatedList(listId);
    if (!populatedList) {
      res.status(500).json({ message: 'Error populating list data' });
      return;
    }

    // Emit update to all users in the list room
    const io = getIO();
    console.log('Emitting listUpdated to room:', `list:${listId}`);
    io.to(`list:${listId}`).emit('listUpdated', populatedList);
    console.log('Emitted listUpdated event');

    res.status(201).json(task);
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};

// Get all tasks
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get a specific task
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, status, priority } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (name) task.name = name;
    if (status) task.status = status;
    if (priority) task.priority = priority;

    await task.save();
    console.log('Task updated:', task._id);

    // Find the list containing this task and get fully populated data
    const list = await List.findOne({ tasks: task._id }) as (IList & { _id: Types.ObjectId });
    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    const populatedList = await getPopulatedList(list._id.toString());
    if (!populatedList) {
      res.status(500).json({ message: 'Error populating list data' });
      return;
    }

    // Emit update to all users in the list room
    const io = getIO();
    console.log('Emitting listUpdated to room:', `list:${list._id}`);
    io.to(`list:${list._id}`).emit('listUpdated', populatedList);
    console.log('Emitted listUpdated event');

    res.json(task);
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Find the list containing this task
    const list = await List.findOne({ tasks: task._id }) as (IList & { _id: Types.ObjectId });
    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    // Remove task from list's tasks array
    list.tasks = list.tasks.filter(t => t.toString() !== (task._id as Types.ObjectId).toString());
    await list.save();

    // Get the fully populated list after deletion
    const populatedList = await getPopulatedList(list._id.toString());
    if (!populatedList) {
      res.status(500).json({ message: 'Error populating list data' });
      return;
    }

    // Emit update to all users in the list room
    const io = getIO();
    console.log('Emitting listUpdated to room:', `list:${list._id}`);
    io.to(`list:${list._id}`).emit('listUpdated', populatedList);
    console.log('Emitted listUpdated event');

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({ message: (error as Error).message });
  }
}; 