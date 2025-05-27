import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <main className="flex flex-col items-center text-center">
          <Image
            src="/drive-logo.svg"
            alt="Google Drive Logo"
            width={120}
            height={120}
            className="mb-8"
            priority
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Google Drive Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            A modern file storage and sharing platform built with Next.js, featuring secure authentication, 
            real-time file management, and a beautiful user interface.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 w-full max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">📁</span>
                  File and folder management
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🔒</span>
                  Secure authentication
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📤</span>
                  Drag and drop uploads
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🔍</span>
                  File search and organization
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📱</span>
                  Responsive design
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Started</h2>
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">File Management</h3>
              <p className="text-gray-600 text-sm">
                Upload, organize, and manage your files with an intuitive interface
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
              <p className="text-gray-600 text-sm">
                Your files are securely stored and encrypted in the cloud
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Easy Sharing</h3>
              <p className="text-gray-600 text-sm">
                Share files and folders with others with customizable permissions
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
