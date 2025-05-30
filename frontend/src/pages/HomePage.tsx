import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DeleteListModal from '../components/DeleteListModal';
import { useNavigate } from 'react-router-dom';

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
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);


  // ✅ Fetch existing lists
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

  // ✅ Create list in DB
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

  // ✅ Delete list
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/lists/${id}`);
      setTodoLists(todoLists.filter(list => list._id !== id));
    } catch (err) {
      console.error('Error deleting list:', err);
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

    </div>
  );
};

export default HomePage;
