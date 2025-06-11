import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import DeleteListModal from '../components/DeleteListModal';
import EditListModal from '../components/EditListModal';
import { useNavigate } from 'react-router-dom';
import { useSocketContext } from '../contexts/SocketContext';
import type { ListResponse } from '../types/list';

interface ApiError {
  response?: {
    data?: {
      message: string;
    };
  };
}

interface TodoList {
  _id: string;
  title: string;
  createdAt: string;
  taskCount: number;
  owner: string;
}

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

interface ApiTodoList {
  _id: string;
  title: string;
  createdAt: string;
  tasks: Task[];
  owner: string;
}

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocketContext();
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedListTitle, setSelectedListTitle] = useState<string>('');

  const fetchLists = async () => {
    try {
      const res = await axios.get<ApiTodoList[]>('/lists');
      const lists = res.data.map((list) => ({
        _id: list._id,
        title: list.title,
        createdAt: new Date(list.createdAt).toLocaleString(),
        taskCount: list.tasks.length,
        owner: list.owner,
      }));
      setTodoLists(lists);
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // Socket event listeners for list
  useEffect(() => {
    if (socket) {
      // Handle when a list is shared with the user
      const handleListShared = (list: ListResponse) => {
        console.log('List shared with user:', list);
        const newList = {
          _id: list._id,
          title: list.title,
          createdAt: new Date(list.createdAt).toLocaleString(),
          taskCount: list.tasks.length,
          owner: list.owner,
        };
        setTodoLists(prevLists => {
          // Check if list already exists
          const exists = prevLists.some(l => l._id === list._id);
          if (exists) {
            return prevLists.map(l => l._id === list._id ? newList : l);
          }
          return [...prevLists, newList];
        });
      };

      // Handle when list access is removed
      const handleListUnshared = ({ listId }: { listId: string }) => {
        console.log('List access removed:', listId);
        setTodoLists(prevLists => prevLists.filter(list => list._id !== listId));
      };

      // Handle when a list is deleted
      const handleListDeleted = ({ listId }: { listId: string }) => {
        console.log('List deleted:', listId);
        setTodoLists(prevLists => prevLists.filter(list => list._id !== listId));
      };

      // Handle when a list is updated (name)
      const handleListUpdated = (list: ListResponse) => {
        console.log('List updated:', list._id);
        const newList = {
          _id: list._id,
          title: list.title,
          createdAt: list.createdAt,
          taskCount: list.tasks.length,
          owner: list.owner
        }
        setTodoLists(prevLists => prevLists.filter(l => l._id === list._id ? newList : l));
      };


      socket.on('listShared', handleListShared);
      socket.on('listUnshared', handleListUnshared);
      socket.on('listDeleted', handleListDeleted);
      socket.on('listnameUpdated', handleListUpdated);

      return () => {
        socket.off('listShared', handleListShared);
        socket.off('listUnshared', handleListUnshared);
        socket.off('listDeleted', handleListDeleted);
        socket.off('listnameUpdated', handleListUpdated);
      };
    }
  }, [socket, isConnected]);

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      setError(true);
      return;
    }

    try {
      const res = await axios.post<ApiTodoList>('/lists', { 
        title: newTitle,
        owner: user?.email 
      });
      const newList = {
        _id: res.data._id,
        title: res.data.title,
        createdAt: new Date(res.data.createdAt).toLocaleString(),
        taskCount: 0,
        owner: res.data.owner,
      };

      setTodoLists([...todoLists, newList]);
      setNewTitle('');
      setAdding(false);
      setError(false);
    } catch (err) {
      console.error('Error creating list:', err);
      setError(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/lists/${id}`);
      setTodoLists(todoLists.filter(list => list._id !== id));
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.data?.message === 'List not found or no permission') {
        alert('List not found or no permission');
      }
      console.error('Error deleting list:', err);
    }
  };

  const handleEdit = async (id: string, newTitle: string) => {
    try {
      const response = await axios.put<ListResponse>(`/lists/${id}`, { title: newTitle });
      const updatedList = {
        _id: response.data._id,
        title: response.data.title,
        createdAt: new Date(response.data.createdAt).toLocaleString(),
        taskCount: response.data.tasks.length,
        owner: response.data.owner,
      };
      setTodoLists(todoLists.map(list => list._id === id ? updatedList : list));
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.data?.message === 'List not found or no permission') {
        alert('List not found or no permission');
      }
      console.error('Error updating list:', err);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold mb-6">Your To Do Lists</h2>

      {todoLists.length === 0 && !adding && (
        <div className="border-2 border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <img src="/no-list-illustration.png" alt="No Lists" className="w-48 mb-4" />
          <p className="mb-4 text-sm text-gray-700">Create your first list and become more productive</p>
          <button
            onClick={() => setAdding(true)}
            className="bg-red-600 text-white px-4 py-1 rounded-md"
          >
            Add List
          </button>
        </div>
      )}

      {todoLists.length > 0 && !adding && (
        <div className="flex flex-col gap-2">
          {todoLists.map(list => (
            <div 
              key={list._id} 
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => navigate(`/tasks/${list._id}`, { state: { listDetails: list } })}
            >
              <div>
                <h3 className="font-medium">{list.title}</h3>
                <p className="text-xs text-gray-500">
                  ⏰ {list.createdAt} | 📋 {list.taskCount} tasks added
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedListId(list._id);
                    setSelectedListTitle(list.title);
                    setShowEditModal(true);
                  }}
                  className="text-gray-500 hover:text-blue-600"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedListId(list._id);
                    setShowDeleteModal(true);
                  }}
                  className="text-gray-500 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setAdding(true)}
            className="mt-4 text-center text-sm text-gray-700 bg-gray-100 rounded-md py-2"
          >
            + Add another List
          </button>
        </div>
      )}

      {adding && (
        <div className="flex items-center gap-2 w-full max-w-xl">
          <input
            type="text"
            placeholder="Add List Name"
            className={`w-full p-2 rounded-md border ${error ? 'border-red-500' : 'border-gray-300'}`}
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setError(false);
            }}
          />
          <button onClick={() => setAdding(false)} className="text-gray-500 hover:text-red-600">🗑️</button>
          <button onClick={handleAdd} className="bg-red-600 text-white px-4 py-1 rounded-md">
            Save
          </button>
        </div>
      )}

      {showDeleteModal && selectedListId && (
        <DeleteListModal
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedListId(null);
          }}
          onConfirm={async () => {
            await handleDelete(selectedListId);
            setShowDeleteModal(false);
            setSelectedListId(null);
          }}
        />
      )}

      {showEditModal && selectedListId && (
        <EditListModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedListId(null);
          }}
          onSave={async (newTitle) => {
            await handleEdit(selectedListId, newTitle);
            setShowEditModal(false);
            setSelectedListId(null);
          }}
          currentTitle={selectedListTitle}
        />
      )}
    </div>
  );
};

export default HomePage;
