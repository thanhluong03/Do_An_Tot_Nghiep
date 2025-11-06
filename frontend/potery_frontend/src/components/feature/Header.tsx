'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts';
import { cn } from '../../utils/cn';
import { categoryApi } from '../../api/modules/category';
import { cartApi } from '../../api/modules/cart';
import { useCart } from '../../contexts/CartContext';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useContext } from 'react';
import { CartCountContext } from '../../contexts/CartContext';

// --- COMPONENT CON: USER DROPDOWN MENU ---
interface UserDropdownProps {
  user: { full_name?: string; name?: string; firstName?: string; lastName?: string; email?: string } | null;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.user-dropdown-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const displayName =
    user?.full_name?.trim() ||
    user?.name?.trim() ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'Khách Hàng';

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative user-dropdown-container">
      <button
        title="user"
        className="px-3 py-1 text-sm text-[#2C2A24] flex items-center hover:bg-[#F5F1EB] rounded-md transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="font-medium text-[#65604E] hidden sm:inline">{displayName.split(' ')[0]}</span>
        <svg
          className={cn("w-4 h-4 ml-1 transition-transform duration-200", isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-[#F5F1EB] z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-500 truncate border-b border-[#F5F1EB]">
              Xin chào, <span className="font-semibold text-[#2C2A24]">{displayName}</span>
            </div>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-[#2C2A24] hover:bg-[#F5F1EB] hover:text-[#65604E]"
              onClick={() => setIsOpen(false)}
            >
              Trang cá nhân
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-sm text-[#2C2A24] hover:bg-[#F5F1EB] hover:text-[#65604E]"
              onClick={() => setIsOpen(false)}
            >
              Đơn hàng
            </Link>
            <Link
              href="/profile/change-password"
              className="block px-4 py-2 text-sm text-[#2C2A24] hover:bg-[#F5F1EB] hover:text-[#65604E]"
              onClick={() => setIsOpen(false)}
            >
              Đổi mật khẩu
            </Link>
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

// --- COMPONENT CHÍNH: HEADER ---
export const Header: React.FC = () => {
  declare global {
    interface Window {
      reloadCartCount?: () => void;
    }
  }
  const cartCountCtx = useContext(CartCountContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const [cartCount, setCartCount] = useState(items.length);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Nếu đăng nhập thì lấy số lượng từ API, nếu không thì lấy từ context
  useEffect(() => {
    window.reloadCartCount = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const cartItems = await cartApi.getByCustomer(user.id);
          setCartCount(Array.isArray(cartItems) ? cartItems.length : 0);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(items.length);
      }
    };
    window.reloadCartCount();
  }, [isAuthenticated, user, items.length]);

  // ✅ Lấy danh mục từ API thật
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await categoryApi.getCategories();
      setCategories(result);
    };
    fetchCategories();
  }, []);

  const menuItems = [
    { name: 'Trang Chủ', href: '/' },
    {
      name: 'Sản Phẩm',
      href: '/products',
      submenu: categories.map((cat) => ({
        name: cat.name,
        href: `/products?category=${cat.id}`,
      })),
    },
    { name: 'Về Nhà Gạo', href: '/about' },
    { name: 'Tin Tức', href: '/news' },
    { name: 'Liên Hệ', href: '/contact' },
  ];

  const isActiveHref = (href: string) => {
    if (!pathname) return false;
    const [pathOnly, query] = href.split('?');
    if (query) {
      try {
        const urlSearch = new URLSearchParams(query);
        for (const [key, value] of urlSearch.entries()) {
          if (searchParams?.get(key) === value && pathname === pathOnly) return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }

    if (pathOnly === '/') return pathname === '/';
    return pathname === pathOnly || pathname.startsWith(pathOnly + '/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer group transition-transform duration-200 hover:scale-[1.02]">

            {/* Vòng tròn Logo */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#E0D8CC] shadow-sm transition-all duration-300 group-hover:border-[#A38D64] group-hover:shadow-md">
              <img
                src="/logo.png"
                alt="Tiệm Gốm Nhà Gạo Logo"
                className="w-8 h-8 object-contain" // Giảm kích thước ảnh logo một chút
              />
            </div>

            {/* Tên Thương hiệu */}
            <div>
              {/* Tối ưu font và thêm hover color */}
              <h1 className="text-xl font-serif text-[#65604E] -mb-1 leading-none transition-colors duration-200 group-hover:text-[#A38D64]">Tiệm Gốm</h1>
              <p className="text-sm font-serif italic text-[#65604E] transition-colors duration-200 group-hover:text-[#A38D64]">Nhà Gạo</p>
            </div>
          </Link>

          {/* NAV MENU */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    'text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200 font-medium',
                    isActiveHref(item.href) && 'text-[#968371]'
                  )}
                >
                  {item.name}
                </Link>

                {/* submenu danh mục */}
                {item.submenu && item.submenu.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            'block px-4 py-2 text-sm text-[#2C2A24] hover:bg-[#F5F1EB] hover:text-[#65604E] transition-colors duration-200',
                            isActiveHref(subItem.href) && 'text-[#968371]'
                          )}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ICONS + USER */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200">
              <img src="/Bag.png" alt="Giỏ hàng" className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#c4975a] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / Login */}
            {isAuthenticated ? (
              <UserDropdown user={user} />
            ) : (
              <Link href="/login" className="relative p-2 text-[#2C2A24] hover:text-[#65604E]" title="Đăng nhập">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              title='Mở menu'
              className="md:hidden p-2 text-[#2C2A24] hover:text-[#65604E] transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#F5F1EB] bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium text-[#2C2A24] hover:bg-[#F5F1EB] rounded-md',
                    isActiveHref(item.href) && 'text-[#968371]'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
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
