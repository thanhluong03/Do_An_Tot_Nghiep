"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";

interface HeaderInfo {
  title: string;
  breadcrumb: string;
}

const getTitleAndBreadcrumb = (pathname: string): HeaderInfo => {
  const parts = pathname.split("/").filter((p) => p && p !== "admin");

  const nameMap: Record<string, string> = {
    dashboard: "Tổng quan Dashboard",
    products: "Quản lý sản phẩm",
    inventory: "Tồn kho",
    stores: "Cửa hàng",
    supplier: "Nhà cung cấp",
    orders: "Đơn hàng",
    categories: "Danh mục",
    news: "Tin tức/Bài viết",
    reviews: "Đánh giá",
    promotions: "Khuyến mãi/Vouchers",
    settings: "Cài đặt",
    roles: "Vai trò",
    permissions: "Quyền hạn",
    importproduct: "Nhập kho",
    conversation: "Tin nhắn khách hàng",
  };

  if (parts.length === 0 || parts[0] === "dashboard") {
    return { title: nameMap["dashboard"], breadcrumb: "Dashboard" };
  }

  const breadcrumbParts = parts.map((p) => nameMap[p] || p);
  const lastPart = parts[parts.length - 1];
  const title =
    nameMap[lastPart] ||
    breadcrumbParts[breadcrumbParts.length - 1] ||
    "Trang";

  return {
    title,
    breadcrumb: breadcrumbParts.join(" > "),
  };
};

export default function AdminHeader() {
  const pathname = usePathname() || "/admin/dashboard";
  const pathname1 = usePathname() ?? "";
  const { title, breadcrumb } = getTitleAndBreadcrumb(pathname);
    
  const [adminName, setAdminName] = useState("Chưa đăng nhập");
  const [adminRole, setAdminRole] = useState("Guest");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🧠 Lấy tên admin từ localStorage
  useEffect(() => {
    const role = localStorage.getItem("adminRole");
    const name = localStorage.getItem("adminName") || "Chưa đăng nhập";
    setAdminName(name )
    setAdminRole(role || "Guest");
  }, [pathname1]);

  // 🧩 Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
  try {
    // 🔥 Gọi API backend để xoá cookie HttpOnly
    await fetch("http://localhost:3000/admin/logout", {
      method: "POST",
      credentials: "include", // bắt buộc gửi cookie
    });
  } catch (err) {
    console.error("Logout error:", err);
  }

  // 🧹 Xoá thông tin còn lại ở localStorage
  localStorage.removeItem("adminRole");
  localStorage.removeItem("adminPermissions");
  localStorage.removeItem("adminName");
  localStorage.removeItem("adminID");
  // 🔁 Chuyển hướng về trang login
  router.push("/admin/login");
};


  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-20 bg-white px-6 shadow-sm border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <nav className="hidden sm:flex items-center text-sm text-gray-500">
          <span className="text-gray-400">Home</span>
          <span className="mx-2 text-gray-400">/</span>
          {breadcrumb.split(">").map((item, i, arr) => (
            <span
              key={i}
              className={
                i === arr.length - 1
                  ? "text-[#B95D26] font-medium"
                  : "text-gray-500"
              }
            >
              {item.trim()}
              {i < arr.length - 1 && (
                <span className="mx-2 text-gray-400">{">"}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

     <div className="relative flex items-center space-x-3" ref={dropdownRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer select-none transition hover:bg-gray-50 rounded-2xl px-3 py-2"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className="flex flex-col text-right leading-tight">
              <p className="text-sm font-semibold text-gray-800">{adminName}</p>
              <p className="text-xs text-gray-500">{adminRole}</p>
            </div>
            <Image
              src="/images/avaa.jpg"
              alt="User Avatar"
              width={42}
              height={42}
              className="rounded-full object-cover border-2 border-orange-100"
            />
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                showDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showDropdown && (
            <div className="absolute right-0 top-[60px] w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <LogOut className="w-4 h-4 mr-2 text-gray-500" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
    </header>
  );
}
