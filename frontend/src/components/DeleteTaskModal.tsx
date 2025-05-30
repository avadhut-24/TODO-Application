import type { FC } from 'react';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteTaskModal: FC<DeleteTaskModalProps> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        {/* Icon and Heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-red-600 text-2xl">🗑️</div>
          <h2 className="text-lg font-semibold">Are you sure want to delete this Task?</h2>
        </div>

        {/* Warning */}
        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. The task will be permanently deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskModal; 