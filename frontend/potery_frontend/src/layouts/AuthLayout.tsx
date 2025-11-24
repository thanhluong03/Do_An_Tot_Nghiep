'use client';

import Image from 'next/image';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-10 relative border border-[#E8E5DA]">
        {/* Logo */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-[#65604E] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <Image
                width={250}
                height={800}
                src="/logo.png"
                alt="Tiệm Gốm Nhà Gạo Logo"
                className=" object-cover rounded-full"
              />
            </div>
            <div className="text-center mt-3">
              <h1 className="text-2xl font-serif font-bold text-[#2C2A24]">
                Tiệm Gốm Nhà Gạo
              </h1>
              <p className="text-sm text-[#65604E] -mt-1">
                Nghệ thuật gốm sứ truyền thống
              </p>
            </div>
          </div>
        </div>

        {/* Nội dung (login/register) */}
        <div className="mt-20 space-y-8">{children}</div>
      </div>
    </div>
  );
};
