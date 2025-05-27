"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiFile, FiStar, FiStarOff } from "react-icons/fi";

interface StarredFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export default function StarredPage() {
  const { data: session } = useSession();
  const [starredFiles, setStarredFiles] = useState<StarredFile[]>([]);

  useEffect(() => {
    const fetchStarredFiles = async () => {
      try {
        const response = await fetch("/api/files/starred");
        if (!response.ok) throw new Error("Failed to fetch starred files");
        const data = await response.json();
        setStarredFiles(data);
      } catch (error) {
        toast.error("Failed to load starred files");
      }
    };

    fetchStarredFiles();
  }, []);

  const handleUnstar = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/star`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to unstar file");

      setStarredFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success("File unstarred successfully");
    } catch (error) {
      toast.error("Failed to unstar file");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#202124]">Starred</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {starredFiles.map((file) => (
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
              <button
                onClick={() => handleUnstar(file.id)}
                className="p-2 hover:bg-[#f1f3f4] rounded-full"
                title="Remove from starred"
              >
                <FiStarOff className="h-5 w-5 text-[#fbbc04]" />
              </button>
            </div>
          </div>
        ))}

        {starredFiles.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FiStar className="h-12 w-12 text-[#5f6368] mb-4" />
            <p className="text-[#5f6368]">No starred files yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 