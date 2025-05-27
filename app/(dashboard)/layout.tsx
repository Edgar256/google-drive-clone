"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { FiFolder, FiFile, FiStar, FiShare2, FiTrash2, FiSettings, FiMenu, FiUsers, FiChevronRight, FiChevronDown, FiLogOut } from "react-icons/fi";

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

const navigation = [
  { name: "My Drive", href: "/dashboard", icon: FiFolder },
  { name: "Shared with me", href: "/dashboard/shared", icon: FiUsers },
  { name: "Starred", href: "/dashboard/starred", icon: FiStar },
  { name: "Trash", href: "/dashboard/trash", icon: FiTrash2 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isMyDriveExpanded, setIsMyDriveExpanded] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/folders");
        if (response.ok) {
          const data = await response.json();
          setFolders(data);
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    if (session?.user) {
      fetchFolders();
    }
  }, [session]);

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
    router.push(`/dashboard?folderId=${folderId}`);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a73e8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 fixed top-0 left-0 right-0 bg-white z-10">
        <div className="flex items-center flex-1">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiMenu className="h-6 w-6 text-[#5f6368]" />
          </button>
          <Link href="/dashboard" className="flex items-center ml-4">
            <img src="/drive-logo.svg" alt="Drive" className="h-8 w-8" />
            <span className="ml-2 text-xl text-[#202124]">Drive</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Search in Drive"
              className="w-96 px-4 py-2 rounded-lg bg-[#f1f3f4] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:bg-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#5f6368]">{session?.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <img
                src={session?.user?.image || "/default-avatar.svg"}
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-14 bottom-0 border-r bg-white">
        <div className="p-4">
          <button className="w-full flex items-center justify-center space-x-2 bg-[#1a73e8] text-white px-4 py-2 rounded-lg hover:bg-[#1557b0] shadow-sm">
            <span>+ New</span>
          </button>
        </div>
        <nav className="mt-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                {item.name === "My Drive" ? (
                  <div>
                    <button
                      onClick={() => setIsMyDriveExpanded(!isMyDriveExpanded)}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[#f1f3f4] text-[#202124]"
                    >
                      <item.icon className="h-5 w-5 text-[#5f6368]" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isMyDriveExpanded ? (
                        <FiChevronDown className="h-4 w-4 text-[#5f6368]" />
                      ) : (
                        <FiChevronRight className="h-4 w-4 text-[#5f6368]" />
                      )}
                    </button>
                    {isMyDriveExpanded && (
                      <div className="ml-8 mt-1">
                        <ul className="space-y-1">
                          {folders.map((folder) => (
                            <li key={folder.id}>
                              <button
                                onClick={() => handleFolderClick(folder.id)}
                                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[#f1f3f4] text-[#202124] rounded-lg"
                              >
                                <FiFolder className="h-5 w-5 text-[#fbbc04]" />
                                <span className="flex-1 text-left">{folder.name}</span>
                                <FiChevronRight className="h-4 w-4 text-[#5f6368]" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-[#f1f3f4] text-[#202124]"
                  >
                    <item.icon className="h-5 w-5 text-[#5f6368]" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#202124]">
                {session?.user?.name}
              </p>
              <p className="text-xs text-[#5f6368]">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-[#f1f3f4] rounded-full"
            >
              <FiLogOut className="h-5 w-5 text-[#5f6368]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-14 min-h-screen bg-white">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
} 