'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts';
import { cn } from '../../utils/cn'; // Giả định bạn có cn (classnames helper)
import router from 'next/router';

// --- COMPONENT CON: USER DROPDOWN MENU ---
interface UserDropdownProps {
  user: { name?: string; firstName?: string; lastName?: string } | null;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
  const { logout } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.user-dropdown-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Tính toán tên hiển thị
  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Khách Hàng';

  const handleLogout = async () => {
    await logout();
    setIsOpen(false); // Đóng menu sau khi đăng xuất
  };

  return (
    <div className="relative user-dropdown-container">
      {/* Nút chính / Tên người dùng */}
      <button
        title='user'
        className="px-3 py-1 text-sm text-[#2C2A24] flex items-center hover:bg-[#F5F1EB] rounded-md transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="font-medium text-[#65604E] hidden sm:inline">{displayName.split(' ')[0]}</span>
        <svg className={cn("w-4 h-4 ml-1 transition-transform duration-200", isOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-[#F5F1EB] z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-500 truncate border-b border-[#F5F1EB]">
                Xin chào, <span className="font-semibold text-[#2C2A24]">{displayName}</span>
            </div>
            {/* Tùy chọn Profile */}
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-[#2C2A24] hover:bg-[#F5F1EB] hover:text-[#65604E]"
              onClick={() => setIsOpen(false)}
            >
              Trang cá nhân
            </a>
            <a
              href="/orders"
              className="block px-4 py-2 text-sm text-[#2C2A24] hover:bg-[#F5F1EB] hover:text-[#65604E]"
              onClick={() => setIsOpen(false)}
            >
              Đơn hàng
            </a>
            {/* Tùy chọn Đăng xuất */}
            <button
              onClick={handleLogout}
              className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-t border-[#F5F1EB]"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
// --- KẾT THÚC COMPONENT CON: USER DROPDOWN MENU ---


// --- COMPONENT CHÍNH: HEADER ---
export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0); // Mock data
  const { user, isAuthenticated, logout } = useAuth(); // Lấy trạng thái đăng nhập

  const menuItems = [
    { name: 'Trang Chủ', href: '/' },
    // ... (menuItems giữ nguyên)
    { 
      name: 'Sản Phẩm', 
      href: '/products',
      submenu: [
        { name: 'Bát Đĩa', href: '/products' },
        { name: 'Ấm Chén', href: '/products' },
        { name: 'Trang Trí', href: '/products' },
        { name: 'Bộ Sưu Tập', href: '/products' }
      ]
    },
    { name: 'Về Nhà Gạo', href: '/about' },
    { name: 'Tin Tức', href: '/news' },
    { name: 'Liên Hệ', href: '/contact' }
  ];
  return (
    <header className="bg-[#FBFBFB] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-[#E0D8CC]"> 
              <img 
                  src="/logo.png" 
                  alt="Tiệm Gốm Nhà Gạo Logo" 
                  className="w-10 h-10 object-contain" 
                  
              />
          </div>
          <div>
              <h1 className="text-2xl font-serif text-[#65604E] -mb-1 leading-none"> 
                  Tiệm Gốm
              </h1>
              <p className="text-sm font-serif italic text-[#65604E]">
                  Nhà Gạo
              </p>
          </div>
      </div>
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
          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </button>
            <a href="/cart" className="relative p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200">
                <img 
                    src="/Bag.png" // Thay đổi đường dẫn này thành đường dẫn file .png thực tế của bạn
                    alt="Giỏ hàng" 
                    className="w-5 h-5" // Giữ nguyên kích thước 5x5 để khớp với icon SVG ban đầu
                />
                
                {/* Số lượng sản phẩm trong giỏ hàng (Cart Count Badge) */}
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#65604E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
            </a>

            {/* ⭐ ACCOUNT LOGIC ĐÃ SỬA ⭐ */}
            {isAuthenticated ? (
              <UserDropdown user={user} /> // Hiển thị Dropdown khi đã đăng nhập
            ) : (
              <a href="/login" className="relative p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200" title="Đăng nhập">
                {/* Icon người dùng (dùng cho cả mobile và desktop) */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </a>
            )}

            {/* Mobile Menu Button (giữ nguyên) */}
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

        {/* Mobile Menu (giữ nguyên) */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#F5F1EB] bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* ... (Mobile Menu Items Code) ... */}
              {isAuthenticated && (
                <button
                // ⭐ SỬ DỤNG HÀM LOGOUT ĐÃ ĐƯỢC DESTRUCTURED ⭐
                onClick={logout} 
                className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                Đăng xuất
                </button>
              )}
            </div>
            </div>
          )}
      </div>
    </header>
  );
};