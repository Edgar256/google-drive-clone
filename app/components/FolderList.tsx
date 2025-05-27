import { useState } from 'react';
import { Folder } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FolderIcon } from 'lucide-react';

interface FolderListProps {
  folders: Folder[];
  currentFolderId?: string | null;
  onFolderClick: (folderId: string) => void;
}

export default function FolderList({ folders, currentFolderId, onFolderClick }: FolderListProps) {
  const router = useRouter();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolderId,
        }),
      });

      if (response.ok) {
        router.refresh();
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Folders</h2>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Folder
        </button>
      </div>

      {isCreatingFolder && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1 px-3 py-1 border rounded"
          />
          <button
            onClick={handleCreateFolder}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create
          </button>
          <button
            onClick={() => setIsCreatingFolder(false)}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderClick(folder.id)}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
          >
            <FolderIcon className="w-5 h-5 text-blue-500" />
            <span>{folder.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 