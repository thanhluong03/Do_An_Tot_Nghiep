'use client';

import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(3); // Mock data

  const menuItems = [
    { name: 'Trang Chủ', href: '/' },
    { 
      name: 'Sản Phẩm', 
      href: '/products',
      submenu: [
        { name: 'Bát Đĩa', href: '/products/bowls' },
        { name: 'Ấm Chén', href: '/products/teapots' },
        { name: 'Trang Trí', href: '/products/decor' },
        { name: 'Bộ Sưu Tập', href: '/products/collections' }
      ]
    },
    { name: 'Về Chúng Tôi', href: '/about' },
    { name: 'Tin Tức', href: '/news' },
    { name: 'Liên Hệ', href: '/contact' }
  ];

  return (
    <header className="bg-[#FBFBFB] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#65604E] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11h14V7l-7-5zM8 15H6v-2h2v2zm0-4H6V9h2v2zm0-4H6V5h2v2zm6 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-[#2C2A24]">
                Tiệm Gốm Nhà Gạo
              </h1>
              <p className="text-xs text-[#65604E] -mt-1">Nghệ thuật gốm sứ truyền thống</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.name} className="relative group">
                <a
                  href={item.href}
                  className="text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
                {item.submenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {item.submenu.map((subItem) => (
                        <a
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm text-[#2C2A24] hover:bg-[#F5F1EB] hover:text-[#65604E] transition-colors duration-200"
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <button className="relative p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#65604E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            <button className="p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#F5F1EB] bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <div key={item.name}>
                  <a
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-[#2C2A24] hover:text-[#65604E] hover:bg-[#F5F1EB] rounded-md transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                  {item.submenu && (
                    <div className="pl-4 space-y-1">
                      {item.submenu.map((subItem) => (
                        <a
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-3 py-2 text-sm text-[#65604E] hover:text-[#2C2A24] hover:bg-[#F5F1EB] rounded-md transition-colors duration-200"
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
