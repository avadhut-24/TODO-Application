import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task.js';
import List from '../models/List.js';
import { Types } from 'mongoose';

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
    console.log('Created task with ID:', task._id);

    // Update the list with the new task
    const list = await List.findById(listId);
    if (!list) {
      res.status(404).json({ message: 'List not found' });
      return;
    }

    list.tasks.push(task._id as Types.ObjectId);
    await list.save();

    res.status(201).json(task);
  } catch (error) {
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
    res.json(task);
  } catch (error) {
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

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}; 