"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiFile, FiFolder } from "react-icons/fi";

interface File {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  folderId: string | null;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  _count: {
    children: number;
    files: number;
  };
}

export default function DriveContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const folderId = searchParams.get("folderId");
        
        const [filesRes, foldersRes] = await Promise.all([
          fetch(`/api/files${folderId ? `?folderId=${folderId}` : ""}`),
          fetch(`/api/folders${folderId ? `?parentId=${folderId}` : ""}`)
        ]);

        if (!filesRes.ok || !foldersRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [filesData, foldersData] = await Promise.all([
          filesRes.json(),
          foldersRes.json()
        ]);

        setFiles(filesData);
        setFolders(foldersData);
      } catch (error) {
        toast.error("Failed to load files and folders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="relative rounded-lg border border-[#dadce0] bg-white px-6 py-5 shadow-sm hover:border-[#1a73e8] hover:bg-[#f8f9fa]"
          >
            <div className="flex items-center">
              <FiFolder className="h-8 w-8 text-[#5f6368]" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-[#202124]">{folder.name}</p>
                <p className="text-sm text-[#5f6368]">
                  {folder._count.files} files
                </p>
              </div>
            </div>
          </div>
        ))}

        {files.map((file) => (
          <div
            key={file.id}
            className="relative rounded-lg border border-[#dadce0] bg-white px-6 py-5 shadow-sm hover:border-[#1a73e8] hover:bg-[#f8f9fa]"
          >
            <div className="flex items-center">
              <FiFile className="h-8 w-8 text-[#5f6368]" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-[#202124]">{file.name}</p>
                <p className="text-sm text-[#5f6368]">
                  {Math.round(file.size / 1024)} KB
                </p>
              </div>
            </div>
          </div>
        ))}

        {files.length === 0 && folders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FiFolder className="h-12 w-12 text-[#5f6368] mb-4" />
            <p className="text-[#5f6368]">No files or folders yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 