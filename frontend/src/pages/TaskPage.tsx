import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useSocketContext } from '../contexts/SocketContext';
import AddTaskModal from '../components/AddTaskModal';
import DeleteTaskModal from '../components/DeleteTaskModal';
import ShareListModal from '../components/ShareListModal';

interface AxiosErrorType {
  response?: {
    status: number;
    data: { message: string };
  };
}

interface Task {
  _id: string;
  name: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  createdAt: string;
  priority: 'Low' | 'Medium' | 'High';
  createdOn: string;
}

interface SharedUser {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  access: 'Edit' | 'View';
}

interface ListResponse {
  _id: string;
  title: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tasks: Task[];
  sharedWith: SharedUser[];
  createdAt: string;
}

interface PersonAccess {
  id: string;
  name: string;
  email: string;
  initials: string;
  access: 'Edit' | 'View';
  isOwner: boolean;
}

const TaskPage = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { socket, joinList, leaveList } = useSocketContext();
  
  const [listTitle, setListTitle] = useState('Brainstorming over things');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [peopleWithAccess, setPeopleWithAccess] = useState<PersonAccess[]>([]);

  const handleAddTask = async (taskData: { title: string; status: string; priority: string }) => {
    try {
      await axios.post<Task>(`/tasks/${listId}`, {
        name: taskData.title,
        status: taskData.status,
        priority: taskData.priority,
        listId: listId
      });
      
      const updatedList = await axios.get<ListResponse>(`/lists/${listId}`);
      setTasks(updatedList.data.tasks);
      setIsAddTaskModalOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error && (error as AxiosErrorType).response?.status === 403) {
        alert((error as AxiosErrorType).response?.data.message);
      } else {
        console.error('Failed to add task:', error);
      }
    }
  };

  const handleEditTask = async (taskData: { title: string; status: string; priority: string }) => {
    try {
      if (!selectedTask) return;
      
      await axios.put<Task>(`/tasks/${listId}/${selectedTask._id}`, {
        name: taskData.title,
        status: taskData.status,
        priority: taskData.priority,
        listId: listId
      });
      
      const updatedList = await axios.get<ListResponse>(`/lists/${listId}`);
      setTasks(updatedList.data.tasks);
      setIsEditTaskModalOpen(false);
      setSelectedTask(null);
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error && (error as AxiosErrorType).response?.status === 403) {
        alert((error as AxiosErrorType).response?.data.message);
      } else {
        console.error('Failed to update task:', error);
      }
    }
  };

  const handleDeleteTask = async () => {
    try {
      if (!selectedTask) return;
      
      await axios.delete(`/tasks/${listId}/${selectedTask._id}`);
      
      const updatedList = await axios.get<ListResponse>(`/lists/${listId}`);
      setTasks(updatedList.data.tasks);
      setIsDeleteTaskModalOpen(false);
      setSelectedTask(null);
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error && (error as AxiosErrorType).response?.status === 403) {
        alert((error as AxiosErrorType).response?.data.message);
      } else {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskModalOpen(true);
  };

  const handleShareList = async (email: string, access: 'Edit' | 'View') => {
    try {
      const response = await axios.post<ListResponse>(`/lists/${listId}/share`, {
        email,
        access
      });
      
      // Update local state with the response
      const updatedList = response.data;
      setListTitle(updatedList.title);
      setTasks(updatedList.tasks || []);
      
      // Update people with access including owner
      const people = [
        // Add owner first
        {
          id: updatedList.owner._id,
          name: `${updatedList.owner.firstName} ${updatedList.owner.lastName}`,
          email: updatedList.owner.email,
          initials: `${updatedList.owner.firstName[0]}${updatedList.owner.lastName[0]}`,
          access: 'Edit' as const,
          isOwner: true
        },
        // Add other users with access
        ...updatedList.sharedWith.map((share) => ({
          id: share.user._id,
          name: `${share.user.firstName} ${share.user.lastName}`,
          email: share.user.email,
          initials: `${share.user.firstName[0]}${share.user.lastName[0]}`,
          access: share.access,
          isOwner: false
        }))
      ];
      setPeopleWithAccess(people);
      setIsShareModalOpen(false);
    } catch (err) {
      if (err instanceof Error && 'response' in err && (err as AxiosErrorType).response?.status === 403) {
        alert((err as AxiosErrorType).response?.data.message);
      } else {
        console.error('Failed to share list:', err);
      }
    }
  };

  const handleRemoveShare = async (userId: string) => {
    try {
      const response = await axios.delete<ListResponse>(`/lists/${listId}/share`, {
        params: { userId }
      });
      
      // Update local state with the response
      const updatedList = response.data;
      setListTitle(updatedList.title);
      setTasks(updatedList.tasks || []);
      
      // Update people with access including owner
      const people = [
        // Add owner first
        {
          id: updatedList.owner._id,
          name: `${updatedList.owner.firstName} ${updatedList.owner.lastName}`,
          email: updatedList.owner.email,
          initials: `${updatedList.owner.firstName[0]}${updatedList.owner.lastName[0]}`,
          access: 'Edit' as const,
          isOwner: true
        },
        // Add other users with access
        ...updatedList.sharedWith.map((share) => ({
          id: share.user._id,
          name: `${share.user.firstName} ${share.user.lastName}`,
          email: share.user.email,
          initials: `${share.user.firstName[0]}${share.user.lastName[0]}`,
          access: share.access,
          isOwner: false
        }))
      ];
      setPeopleWithAccess(people);
    } catch (err) {
      if (err instanceof Error && 'response' in err && (err as AxiosErrorType).response?.status === 403) {
        alert((err as AxiosErrorType).response?.data.message);
      } else {
        console.error('Failed to remove share:', err);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchListData = async () => {
      try {
        const res = await axios.get<ListResponse>(`/lists/${listId}`);
        setListTitle(res.data.title);
        setTasks(res.data.tasks || []);
        
        // Set people with access including owner
        const people = [
          {
            id: res.data.owner._id,
            name: `${res.data.owner.firstName} ${res.data.owner.lastName}`,
            email: res.data.owner.email,
            initials: `${res.data.owner.firstName[0]}${res.data.owner.lastName[0]}`,
            access: 'Edit' as const,
            isOwner: true
          },
          ...res.data.sharedWith.map((share) => ({
            id: share.user._id,
            name: `${share.user.firstName} ${share.user.lastName}`,
            email: share.user.email,
            initials: `${share.user.firstName[0]}${share.user.lastName[0]}`,
            access: share.access,
            isOwner: false
          }))
        ];
        setPeopleWithAccess(people);
      } catch (err) {
        console.error('Failed to fetch list data:', err);
      }
    };

    if (listId) {
      fetchListData();
    }
  }, [listId]);

  // Socket room management
  useEffect(() => {
    if (listId) {
      joinList(listId);
      return () => leaveList(listId);
    }
  }, [listId, joinList, leaveList]);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      console.log('Setting up listUpdated listener in TaskPage');
      
      const handleListUpdate = (updatedList: ListResponse) => {
        console.log('Received listUpdated event:', updatedList);
        setListTitle(updatedList.title);
        setTasks(updatedList.tasks || []);
        
        const people = [
          {
            id: updatedList.owner._id,
            name: `${updatedList.owner.firstName} ${updatedList.owner.lastName}`,
            email: updatedList.owner.email,
            initials: `${updatedList.owner.firstName[0]}${updatedList.owner.lastName[0]}`,
            access: 'Edit' as const,
            isOwner: true
          },
          ...updatedList.sharedWith.map((share) => ({
            id: share.user._id,
            name: `${share.user.firstName} ${share.user.lastName}`,
            email: share.user.email,
            initials: `${share.user.firstName[0]}${share.user.lastName[0]}`,
            access: share.access,
            isOwner: false
          }))
        ];
        setPeopleWithAccess(people);
      };

      socket.on('listUpdated', handleListUpdate);
      console.log('listUpdated listener set up successfully');

      return () => {
        console.log('Cleaning up listUpdated listener');
        socket.off('listUpdated', handleListUpdate);
      };
    } else {
      console.warn('Socket not available in TaskPage');
    }
  }, [socket]);

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-white px-6 py-6 text-black font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <button onClick={() => navigate('/home')} className="text-sm text-gray-600 hover:text-black">← Back</button>
        <div className='flex items-center space-x-3'>
          <div className="text-sm text-gray-500">
            {peopleWithAccess.length > 0 ? `${peopleWithAccess.length} people have access` : 'Not Shared'}
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Share
          </button>
        </div>
      </div>

      {/* Title + Meta */}
      <h1 className="text-xl font-bold underline underline-offset-2 mb-2">{listTitle}</h1>
      <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
        <div>🕒 {tasks[0] ? formatDate(tasks[0].createdAt) : '—'}</div>
        <div>📋 {completedCount}/{tasks.length} tasks completed</div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-6 font-medium text-sm text-gray-500 border-b border-gray-200 pb-2 mb-2">
        <div>Type</div>
        <div>Task Name</div>
        <div>Status</div>
        <div>Created on</div>
        <div>Priority</div>
        <div>Actions</div>
      </div>

      {/* Tasks */}
      {tasks.map(task => (
        <div key={task._id} className="grid grid-cols-6 items-center text-sm py-2 border-b border-gray-100">
          <div>
            <div className="relative">
              <input 
                type="checkbox" 
                className={`w-4 h-4 appearance-none border-2 rounded border-gray-300 cursor-pointer
                  ${task.status === 'Completed' ? 'bg-green-500 border-green-500' : 'hover:border-gray-400'}`}
                checked={task.status === 'Completed'}
                readOnly
              />
              {task.status === 'Completed' && (
                <svg 
                  className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <div>{task.name}</div>
          <div>
            <span className="px-2 py-1 rounded-md border text-xs text-gray-700 bg-gray-100">
              {task.status}
            </span>
          </div>
          <div>{formatDate(task.createdAt)}</div>
          <div>{task.priority}</div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleEditClick(task)}
              className="text-gray-600 hover:text-blue-600"
            >
              ✏️
            </button>
            <button 
              onClick={() => handleDeleteClick(task)}
              className="text-gray-600 hover:text-red-600"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}

      {/* Add Task */}
      <div className="mt-4">
        <button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="text-red-600 text-sm font-medium hover:underline"
        >
          + Add Task
        </button>
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={handleAddTask}
      />

      <AddTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleEditTask}
        initialData={selectedTask ? {
          title: selectedTask.name,
          status: selectedTask.status,
          priority: selectedTask.priority
        } : undefined}
      />

      <DeleteTaskModal
        isOpen={isDeleteTaskModalOpen}
        onCancel={() => {
          setIsDeleteTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDeleteTask}
      />

      <ShareListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        peopleWithAccess={peopleWithAccess}
        onAddEmail={handleShareList}
        onRemoveAccess={handleRemoveShare}
      />
    </div>
  );
};

export default TaskPage;
