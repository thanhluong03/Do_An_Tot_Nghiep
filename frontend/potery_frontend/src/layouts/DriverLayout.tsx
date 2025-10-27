'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Package, History, User, LogOut, Menu } from 'lucide-react';

interface DriverLayoutProps {
  children: React.ReactNode;
}

export const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [driverName, setDriverName] = useState('Tài xế');

  // Lấy thông tin driver từ localStorage sau khi component mount
  useEffect(() => {
    const name = localStorage.getItem('adminName') || 'Tài xế';
    setDriverName(name);
  }, []);

  // Function logout đơn giản
  const handleLogout = () => {
    localStorage.removeItem('adminID');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminRoleId');
    localStorage.removeItem('adminPermissions');
    window.location.href = '/admin/login';
  };

  const driverMenuItems = [
    { name: 'Đơn hàng mới', href: '/driver/order-deliver', icon: <Package className="w-5 h-5" /> },
    { name: 'Lịch sử giao', href: '/driver/history', icon: <History className="w-5 h-5" /> },
    { name: 'Tài khoản', href: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-20 px-4 border-b border-gray-700">
          <Package className="w-8 h-8 text-green-400" />
          <h1 className="ml-3 text-xl font-bold text-white">Driver Dashboard</h1>
        </div>

        <nav className="flex-1 mt-8 px-4">
          <ul className="space-y-2">
            {driverMenuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-red-800/50 hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, <span className="font-semibold text-gray-800">{driverName}</span>
              </span>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                {driverName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;