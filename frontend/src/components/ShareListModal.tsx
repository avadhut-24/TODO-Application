import React, { useState } from 'react';

interface PersonAccess {
  id: string;
  name: string;
  email: string;
  initials: string;
  access: string;
  isOwner: boolean;
}

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  peopleWithAccess: PersonAccess[];
  onAddEmail: (email: string, access: 'Edit' | 'View') => void;
  onRemoveAccess: (userId: string) => void;
}

const ShareListModal: React.FC<ShareListModalProps> = ({
  isOpen,
  onClose,
  peopleWithAccess,
  onAddEmail,
  onRemoveAccess,
}) => {
  const [email, setEmail] = useState('');
  const [accessType, setAccessType] = useState<'Edit' | 'View'>('Edit');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleAdd = () => {
    if (email.trim()) {
      onAddEmail(email.trim(), accessType);
      setEmail('');
      setAccessType('Edit');
      setDropdownOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold"
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-5">Share List</h2>

        {/* Email input + access dropdown */}
        <div className="flex gap-2 mb-6">
          <input
            type="email"
            placeholder="Email Address"
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center border border-red-600 text-red-600 rounded-lg px-3 py-2 focus:outline-none"
            >
              {accessType}
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <ul className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-28 z-10">
                {['Edit', 'View'].map((type) => (
                  <li
                    key={type}
                    className={`cursor-pointer px-3 py-2 hover:bg-red-100 ${
                      accessType === type ? 'font-semibold text-red-600' : ''
                    }`}
                    onClick={() => {
                      setAccessType(type as 'Edit' | 'View');
                      setDropdownOpen(false);
                    }}
                  >
                    {type}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          className="mb-6 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Add
        </button>

        {/* Separator */}
        <hr className="border-gray-200 mb-4" />

        {/* People with Access */}
        <div>
          <h3 className="text-sm font-semibold mb-3">People with Access</h3>
          <ul className="space-y-4 max-h-48 overflow-auto">
            {peopleWithAccess.map(({ id, name, email, initials, isOwner, access }) => (
              <li key={id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-200 text-red-600 font-semibold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {name} {isOwner && <span className="text-gray-400">(owner)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{email}</p>
                    <p className="text-xs text-gray-500">Access: {access}</p>
                  </div>
                </div>
                {!isOwner && (
                  <button 
                    onClick={() => onRemoveAccess(id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShareListModal;
