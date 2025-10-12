'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#65604E] rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Tiệm Gốm Nhà Gạo Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#2C2A24]">
                Tiệm Gốm Nhà Gạo
              </h1>
              <p className="text-sm text-[#65604E] -mt-1">Nghệ thuật gốm sứ truyền thống</p>
            </div>
          </div>
        </div>
        
        {/* Auth Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
