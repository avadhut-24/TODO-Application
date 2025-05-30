import React, { useState, useEffect } from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; status: string; priority: string }) => void;
  initialData?: {
    title: string;
    status: string;
    priority: string;
  };
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [status, setStatus] = useState(initialData?.status || 'To Do');
  const [priority, setPriority] = useState(initialData?.priority || 'Medium');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setStatus(initialData.status);
      setPriority(initialData.priority);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({ title, status, priority });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span>📋</span>
            <h2 className="text-lg font-semibold">Task Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-lg">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Task Name"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Status</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-gray-600">Priority</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-1 rounded border border-gray-300 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1 rounded bg-red-600 text-white text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
