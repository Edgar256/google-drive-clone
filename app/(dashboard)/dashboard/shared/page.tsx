"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiFile, FiShare2 } from "react-icons/fi";

interface SharedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  sharedBy: {
    name: string;
    email: string;
  };
}

export default function SharedPage() {
  const { data: session } = useSession();
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);

  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        const response = await fetch("/api/files/shared");
        if (!response.ok) throw new Error("Failed to fetch shared files");
        const data = await response.json();
        setSharedFiles(data);
      } catch (error) {
        toast.error("Failed to load shared files");
      }
    };

    fetchSharedFiles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#202124]">Shared with me</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sharedFiles.map((file) => (
          <div
            key={file.id}
            className="relative rounded-lg border border-[#dadce0] bg-white px-6 py-5 shadow-sm hover:border-[#1a73e8] hover:bg-[#f8f9fa]"
          >
            <div className="flex items-center">
              <FiFile className="h-8 w-8 text-[#5f6368]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#202124]">{file.name}</p>
                <p className="text-sm text-[#5f6368]">
                  {Math.round(file.size / 1024)} KB
                </p>
                <p className="text-xs text-[#5f6368]">
                  Shared by {file.sharedBy.name}
                </p>
              </div>
            </div>
          </div>
        ))}

        {sharedFiles.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FiShare2 className="h-12 w-12 text-[#5f6368] mb-4" />
            <p className="text-[#5f6368]">No files have been shared with you yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 