import { useState } from 'react';
import type { FC } from 'react';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
  currentTitle: string;
}

const EditListModal: FC<EditListModalProps> = ({ isOpen, onClose, onSave, currentTitle }) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newTitle.trim()) {
      setError(true);
      return;
    }
    onSave(newTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        {/* Icon and Heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-blue-600 text-2xl">✏️</div>
          <h2 className="text-lg font-semibold">Edit List Name</h2>
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setError(false);
            }}
            className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter new list name"
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">List name cannot be empty</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditListModal; 