export interface Task {
  _id: string;
  name: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  createdAt: string;
  priority: 'Low' | 'Medium' | 'High';
  createdOn: string;
}

export interface SharedUser {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  access: 'Edit' | 'View';
}

export interface ListResponse {
  _id: string;
  title: string;
  owner: string;
  tasks: Task[];
  sharedWith: SharedUser[];
  createdAt: string;
} 