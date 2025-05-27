"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiFile, FiTrash2, FiRefreshCw, FiDelete } from "react-icons/fi";

interface TrashedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  deletedAt: string;
}

export default function TrashPage() {
  const { data: session } = useSession();
  const [trashedFiles, setTrashedFiles] = useState<TrashedFile[]>([]);

  useEffect(() => {
    const fetchTrashedFiles = async () => {
      try {
        const response = await fetch("/api/files/trash");
        if (!response.ok) throw new Error("Failed to fetch trashed files");
        const data = await response.json();
        setTrashedFiles(data);
      } catch (error) {
        toast.error("Failed to load trashed files");
      }
    };

    fetchTrashedFiles();
  }, []);

  const handleRestore = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/restore`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to restore file");

      setTrashedFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success("File restored successfully");
    } catch (error) {
      toast.error("Failed to restore file");
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete file permanently");

      setTrashedFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success("File deleted permanently");
    } catch (error) {
      toast.error("Failed to delete file permanently");
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to empty the trash? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/files/trash", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to empty trash");

      setTrashedFiles([]);
      toast.success("Trash emptied successfully");
    } catch (error) {
      toast.error("Failed to empty trash");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#202124]">Trash</h1>
        {trashedFiles.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="inline-flex items-center px-4 py-2 border border-[#dadce0] text-sm font-medium rounded-md text-[#5f6368] bg-white hover:bg-[#f1f3f4]"
          >
            <FiDelete className="mr-2" />
            Empty trash
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trashedFiles.map((file) => (
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
                <p className="text-xs text-[#5f6368]">
                  Deleted {new Date(file.deletedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRestore(file.id)}
                  className="p-2 hover:bg-[#f1f3f4] rounded-full"
                  title="Restore file"
                >
                  <FiRefreshCw className="h-5 w-5 text-[#1a73e8]" />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 hover:bg-[#f1f3f4] rounded-full"
                  title="Delete permanently"
                >
                  <FiTrash2 className="h-5 w-5 text-[#ea4335]" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {trashedFiles.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FiTrash2 className="h-12 w-12 text-[#5f6368] mb-4" />
            <p className="text-[#5f6368]">No files in trash</p>
          </div>
        )}
      </div>
    </div>
  );
} 