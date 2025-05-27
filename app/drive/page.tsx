'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FolderList from '../components/FolderList';
import { Folder } from '@prisma/client';

export default function DrivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [folders, setFolders] = useState<Folder[]>([]);
  const currentFolderId = searchParams.get('folderId');

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`/api/folders?parentId=${currentFolderId || ''}`);
        if (response.ok) {
          const data = await response.json();
          setFolders(data);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    fetchFolders();
  }, [currentFolderId]);

  const handleFolderClick = (folderId: string) => {
    router.push(`/drive?folderId=${folderId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        {currentFolderId && (
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-600"
          >
            ← Back
          </button>
        )}
      </div>
      <FolderList
        folders={folders}
        currentFolderId={currentFolderId}
        onFolderClick={handleFolderClick}
      />
    </div>
  );
} 