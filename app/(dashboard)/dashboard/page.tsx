"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "react-hot-toast";
import { FiFolder, FiFile, FiUpload, FiPlus, FiChevronRight, FiArrowLeft, FiEdit2, FiX, FiTrash2, FiMoreVertical, FiImage, FiFileText, FiDownload } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

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
  createdAt: string;
  parentId: string | null;
}

interface FolderPath {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<{ type: 'file' | 'folder', id: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<FolderPath[]>([]);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [showFileMenu, setShowFileMenu] = useState<string | null>(null);
  const [showFolderMenu, setShowFolderMenu] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const currentFolderId = searchParams.get('folderId');

  const { getRootProps, getInputProps, isDragActive } = useFileUpload({
    onUploadComplete: (file) => {
      setFiles((prev) => [...prev, { ...file, folderId: currentFolderId }]);
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      
      setIsLoading(true);
      try {
        const [filesResponse, foldersResponse] = await Promise.all([
          fetch(`/api/files${currentFolderId ? `?folderId=${currentFolderId}` : ''}`),
          fetch(`/api/folders${currentFolderId ? `?parentId=${currentFolderId}` : ''}`)
        ]);

        if (!filesResponse.ok) throw new Error("Failed to fetch files");
        if (!foldersResponse.ok) throw new Error("Failed to fetch folders");

        const [filesData, foldersData] = await Promise.all([
          filesResponse.json(),
          foldersResponse.json()
        ]);

        setFiles(filesData);
        setFolders(foldersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, currentFolderId]);

  useEffect(() => {
    const fetchFolderPath = async () => {
      if (!currentFolderId) {
        setFolderPath([]);
        return;
      }

      try {
        const response = await fetch(`/api/folders/${currentFolderId}/path`);
        if (response.ok) {
          const path = await response.json();
          setFolderPath(path);
        }
      } catch (error) {
        console.error("Error fetching folder path:", error);
      }
    };

    fetchFolderPath();
  }, [currentFolderId]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: newFolderName,
          parentId: currentFolderId 
        }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      const folder = await response.json();
      setFolders((prev) => [...prev, folder]);
      setNewFolderName("");
      setIsCreatingFolder(false);
      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleEditFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !editFolderName.trim()) return;

    try {
      const response = await fetch(`/api/folders/${editingFolder}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editFolderName }),
      });

      if (!response.ok) throw new Error("Failed to update folder");

      const updatedFolder = await response.json();
      setFolders(folders.map(folder => 
        folder.id === editingFolder ? updatedFolder : folder
      ));
      setEditingFolder(null);
      setEditFolderName("");
      toast.success("Folder updated successfully");
    } catch (error) {
      console.error("Error updating folder:", error);
      toast.error("Failed to update folder");
    }
  };

  const startEditingFolder = (folder: Folder) => {
    setEditingFolder(folder.id);
    setEditFolderName(folder.name);
  };

  const handleFolderClick = (folderId: string) => {
    router.push(`/dashboard?folderId=${folderId}`);
  };

  const handleBreadcrumbClick = (folderId: string | null) => {
    router.push(folderId ? `/dashboard?folderId=${folderId}` : '/dashboard');
  };

  const handleDragStart = (type: 'file' | 'folder', id: string) => {
    setDraggedItem({ type, id });
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDragOverFolder(null);

    if (!draggedItem) return;

    try {
      if (draggedItem.type === 'file') {
        const response = await fetch(`/api/files/${draggedItem.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folderId: targetFolderId }),
        });

        if (!response.ok) throw new Error('Failed to move file');
        
        setFiles(files.map(file => 
          file.id === draggedItem.id 
            ? { ...file, folderId: targetFolderId }
            : file
        ));
        toast.success('File moved successfully');
      } else {
        const response = await fetch(`/api/folders/${draggedItem.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ parentId: targetFolderId }),
        });

        if (!response.ok) throw new Error('Failed to move folder');
        
        setFolders(folders.map(folder => 
          folder.id === draggedItem.id 
            ? { ...folder, parentId: targetFolderId }
            : folder
        ));
        toast.success('Folder moved successfully');
      }
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('Failed to move item');
    }

    setDraggedItem(null);
  };

  const handleEditFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile || !editFileName.trim()) return;

    try {
      const response = await fetch(`/api/files/${editingFile}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editFileName }),
      });

      if (!response.ok) throw new Error("Failed to update file");

      const updatedFile = await response.json();
      setFiles(files.map(file => 
        file.id === editingFile ? updatedFile : file
      ));
      setEditingFile(null);
      setEditFileName("");
      toast.success("File renamed successfully");
    } catch (error) {
      console.error("Error updating file:", error);
      toast.error("Failed to rename file");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete file");

      setFiles(files.filter(file => file.id !== fileId));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete folder");

      setFolders(folders.filter(folder => folder.id !== folderId));
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const startEditingFile = (file: File) => {
    setEditingFile(file.id);
    setEditFileName(file.name);
    setShowFileMenu(null);
  };

  const handleFileClick = (file: File) => {
    setPreviewFile(file);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FiImage className="h-8 w-8 text-[#5f6368]" />;
    } else if (file.type === 'application/pdf') {
      return <FiFileText className="h-8 w-8 text-[#5f6368]" />;
    }
    return <FiFile className="h-8 w-8 text-[#5f6368]" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  const handleDownload = async (file: File) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a73e8]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-[#5f6368]">
        <button
          onClick={() => handleBreadcrumbClick(null)}
          className="hover:text-[#202124]"
        >
          My Drive
        </button>
        {folderPath.map((folder, index) => (
          <div key={folder.id} className="flex items-center">
            <FiChevronRight className="h-4 w-4" />
            <button
              onClick={() => handleBreadcrumbClick(folder.id)}
              className="ml-2 hover:text-[#202124]"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {currentFolderId && (
            <button
              onClick={() => handleBreadcrumbClick(folderPath[folderPath.length - 2]?.id || null)}
              className="p-2 hover:bg-[#f1f3f4] rounded-full"
            >
              <FiArrowLeft className="h-5 w-5 text-[#5f6368]" />
            </button>
          )}
          <h1 className="text-2xl font-semibold text-[#202124]">
            {currentFolderId ? folderPath[folderPath.length - 1]?.name : 'My Drive'}
          </h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a73e8] hover:bg-[#1557b0]"
          >
            <FiPlus className="mr-2" />
            New Folder
          </button>
        </div>
      </div>

      {isCreatingFolder && (
        <form onSubmit={handleCreateFolder} className="flex space-x-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1 rounded-md border-[#dadce0] shadow-sm focus:border-[#1a73e8] focus:ring-[#1a73e8]"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a73e8] hover:bg-[#1557b0]"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingFolder(false)}
            className="inline-flex items-center px-4 py-2 border border-[#dadce0] text-sm font-medium rounded-md text-[#5f6368] bg-white hover:bg-[#f1f3f4]"
          >
            Cancel
          </button>
        </form>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragActive ? "border-[#1a73e8] bg-[#e8f0fe]" : "border-[#dadce0]"
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-[#5f6368]" />
        <p className="mt-2 text-sm text-[#5f6368]">
          Drag and drop files here, or click to select files
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <div
            key={folder.id}
            draggable
            onDragStart={() => handleDragStart('folder', folder.id)}
            onDragOver={(e) => handleDragOver(e, folder.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, folder.id)}
            onClick={() => handleFolderClick(folder.id)}
            className={`relative rounded-lg border ${
              dragOverFolder === folder.id 
                ? 'border-[#1a73e8] bg-[#e8f0fe]' 
                : 'border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa]'
            } bg-white px-6 py-5 shadow-sm cursor-pointer transition-colors group`}
          >
            {editingFolder === folder.id ? (
              <form 
                onSubmit={handleEditFolder}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  className="flex-1 rounded-md border-[#dadce0] shadow-sm focus:border-[#1a73e8] focus:ring-[#1a73e8]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 hover:bg-[#f1f3f4] rounded-full"
                >
                  <FiChevronRight className="h-5 w-5 text-[#5f6368]" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="p-1 hover:bg-[#f1f3f4] rounded-full"
                >
                  <FiX className="h-5 w-5 text-[#5f6368]" />
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center">
                  <FiFolder className="h-8 w-8 text-[#fbbc04]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[#202124]">{folder.name}</p>
                    <p className="text-sm text-[#5f6368]">
                      Created {new Date(folder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingFolder(folder);
                    }}
                    className="p-1 hover:bg-[#f1f3f4] rounded-full"
                  >
                    <FiEdit2 className="h-4 w-4 text-[#5f6368]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    className="p-1 hover:bg-[#f1f3f4] rounded-full"
                  >
                    <FiTrash2 className="h-4 w-4 text-[#5f6368]" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {files.map((file) => (
          <div
            key={file.id}
            draggable
            onDragStart={() => handleDragStart('file', file.id)}
            onClick={() => handleFileClick(file)}
            className="relative rounded-lg border border-[#dadce0] bg-white px-6 py-5 shadow-sm hover:border-[#1a73e8] hover:bg-[#f8f9fa] cursor-pointer group"
          >
            {editingFile === file.id ? (
              <form 
                onSubmit={handleEditFile}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={editFileName}
                  onChange={(e) => setEditFileName(e.target.value)}
                  className="flex-1 rounded-md border-[#dadce0] shadow-sm focus:border-[#1a73e8] focus:ring-[#1a73e8]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 hover:bg-[#f1f3f4] rounded-full"
                >
                  <FiChevronRight className="h-5 w-5 text-[#5f6368]" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="p-1 hover:bg-[#f1f3f4] rounded-full"
                >
                  <FiX className="h-5 w-5 text-[#5f6368]" />
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center">
                  {getFileIcon(file)}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[#202124]">{file.name}</p>
                    <p className="text-sm text-[#5f6368]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingFile(file);
                    }}
                    className="p-1 hover:bg-[#f1f3f4] rounded-full"
                  >
                    <FiEdit2 className="h-4 w-4 text-[#5f6368]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id);
                    }}
                    className="p-1 hover:bg-[#f1f3f4] rounded-full"
                  >
                    <FiTrash2 className="h-4 w-4 text-[#5f6368]" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#202124]">{previewFile.name}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="p-2 hover:bg-[#f1f3f4] rounded-full"
                >
                  <FiDownload className="h-5 w-5 text-[#5f6368]" />
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 hover:bg-[#f1f3f4] rounded-full"
                >
                  <FiX className="h-5 w-5 text-[#5f6368]" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              {previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh] rounded-lg"
                  title={previewFile.name}
                />
              ) : (
                <div className="p-4 bg-[#f8f9fa] rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(previewFile)}
                    <div>
                      <p className="text-sm text-[#5f6368]">File Type: {previewFile.type}</p>
                      <p className="text-sm text-[#5f6368]">Size: {formatFileSize(previewFile.size)}</p>
                      <p className="text-sm text-[#5f6368]">
                        Created: {new Date(previewFile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a73e8] hover:bg-[#1557b0]"
                  >
                    <FiDownload className="mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 