'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Package, History, User, LogOut, Menu } from 'lucide-react';

interface DriverLayoutProps {
  children: React.ReactNode;
}
const deleteCookie = (name: string) => {
  const hostname = window.location.hostname;
  const domainParts = hostname.split('.');
  
  // Danh sách các cách xóa cookie với các thuộc tính khác nhau
  const deleteAttempts = [
    // Xóa với path root (không có domain)
    `${name}=; Max-Age=0; path=/;`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
    
    // Xóa với path root và domain hiện tại
    `${name}=; Max-Age=0; path=/; domain=${hostname};`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`,
    
    // Xóa không có path và domain
    `${name}=; Max-Age=0;`,
    `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`,
  ];
  
  // Nếu có domain (không phải localhost), thử xóa với domain cha
  if (domainParts.length > 1 && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const parentDomain = '.' + domainParts.slice(-2).join('.');
    deleteAttempts.push(
      `${name}=; Max-Age=0; path=/; domain=${parentDomain};`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`,
      `${name}=; Max-Age=0; domain=${parentDomain};`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${parentDomain};`
    );
  }
  
  // Thử với localhost domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    deleteAttempts.push(
      `${name}=; Max-Age=0; path=/; domain=localhost;`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
    );
  }
  
  // Thử tất cả các cách xóa
  deleteAttempts.forEach(attempt => {
    try {
      document.cookie = attempt;
    } catch (e) {
      console.warn(`Không thể xóa cookie ${name} với: ${attempt}`, e);
    }
  });
};


export const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [driverName, setDriverName] = useState('Tài xế');
  const [menuOpen, setMenuOpen] = useState(false);

  // Lấy thông tin driver từ localStorage sau khi component mount
  useEffect(() => {
    const name = localStorage.getItem('adminName') || 'Tài xế';
    setDriverName(name);
  }, []);

  // Function logout - xóa tất cả localStorage, sessionStorage và cookies
  const handleLogout = async () => {
    console.log('🚪 Bắt đầu đăng xuất...');
    
    try {
      // Gọi API logout từ server để xóa cookie adminToken (HttpOnly)
      // Cookie HttpOnly chỉ có thể xóa từ server-side
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include', // Quan trọng: gửi cookie cùng request
      });
      console.log('✅ Đã gọi API logout từ server');
    } catch (err) {
      console.error('❌ Lỗi khi gọi API logout:', err);
      // Tiếp tục xóa localStorage/sessionStorage ngay cả khi API lỗi
    }
    
    // Xóa localStorage
    localStorage.removeItem('adminID');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminRoleId');
    localStorage.removeItem('adminPermissions');
    console.log('✅ Đã xóa localStorage');

    // Xóa sessionStorage
    sessionStorage.clear();
    console.log('✅ Đã xóa sessionStorage');

    // Xóa các cookie khác (không phải HttpOnly) từ client-side
    const authCookies = [
      'token',
      'access_token',
      'refresh_token',
      'authToken',
      'jwt',
      'session',
      'sessionId',
      'connect.sid', // Express session cookie
    ];
    
    authCookies.forEach(cookieName => {
      deleteCookie(cookieName);
    });
    console.log('✅ Đã xóa các cookie authentication khác');

    // Redirect đến trang login
    window.location.href = '/admin/login';
  };

  const driverMenuItems = [
    { name: 'Đơn hàng mới', href: '/driver/order-deliver', icon: <Package className="w-5 h-5" /> },
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

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-sm text-gray-600">
                  Xin chào, <span className="font-semibold text-gray-800">{driverName}</span>
                </span>
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {driverName.charAt(0).toUpperCase()}
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
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