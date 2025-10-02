'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Sản Phẩm', href: '/admin/products', icon: '🏺' },
    { name: 'Đơn Hàng', href: '/admin/orders', icon: '📦' },
    { name: 'Khách Hàng', href: '/admin/customers', icon: '👥' },
    { name: 'Flash Sale', href: '/admin/flash-sale', icon: '⚡' },
    { name: 'Danh Mục', href: '/admin/categories', icon: '📂' },
    { name: 'Tin Tức', href: '/admin/news', icon: '📰' },
    { name: 'Thống Kê', href: '/admin/analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#65604E] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-[#8B7D6B]">
          <h1 className="text-xl font-serif font-bold text-white">Admin Panel</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {adminMenuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center px-4 py-3 text-white hover:bg-[#8B7D6B] rounded-lg transition-colors duration-200"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-[#F5F1EB]">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="lg:hidden p-2 text-[#65604E] hover:bg-[#F5F1EB] rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#65604E]">Xin chào, Admin</span>
              <button className="p-2 text-[#65604E] hover:bg-[#F5F1EB] rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
