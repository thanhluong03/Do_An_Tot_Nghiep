

import React from 'react';
import Link from 'next/link';

export function AdminStoreFooter() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-10 p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-2 md:mb-0 flex items-center space-x-4">
          <span>© 2025 Tiệm Gốm Nhà Gạo. All rights reserved.</span>
          <span className="hidden sm:inline-block">|</span>
          <span className="flex items-center">
            Made with <span role="img" aria-label="love" className="mx-1 text-red-500">❤️</span> in Vietnam
          </span>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6">
          <Link href="/admin/privacy" className="hover:text-gray-700 transition duration-150">
            Privacy Policy
          </Link>
          <Link href="/admin/terms" className="hover:text-gray-700 transition duration-150">
            Terms of Service
          </Link>
          <Link href="/admin/support" className="hover:text-gray-700 transition duration-150">
            Support
          </Link>
          <span className="text-gray-400 ml-4 hidden sm:inline-block">
            Version 2.1.0 
            <span className="inline-block w-2 h-2 ml-1 bg-green-500 rounded-full"></span>
          </span>
        </div>
      </div>
    </footer>
  );
}