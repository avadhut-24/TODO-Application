import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User.js';
import { ITask } from './Task.js';

interface ISharedUser {
  user: Types.ObjectId | IUser;
  access: 'Edit' | 'View';
}

export interface IList extends Document {
  title: string;
  owner: Types.ObjectId | IUser;
  tasks: Types.ObjectId[];
  sharedWith: ISharedUser[];
  createdAt: Date;
}

const listSchema = new Schema<IList>({
  title: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  sharedWith: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    access: {
      type: String,
      enum: ['Edit', 'View'],
      default: 'View'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model<IList>('List', listSchema); 