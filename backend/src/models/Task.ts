import { Schema, model, Document } from 'mongoose';

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface ITask extends Document {
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model<ITask>('Task', taskSchema); 