"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Đăng nhập thất bại");
        return;
      }
      localStorage.removeItem("adminID");
      localStorage.removeItem("adminPermissions");
      localStorage.removeItem("adminRoleId");
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminName");

      if (data.adminID) localStorage.setItem("adminID", data.adminID.toString());
      if (data.adminName) localStorage.setItem("adminName", data.adminName);
      if (data.roleName) localStorage.setItem("adminRole", data.roleName);
      if (data.roleId) {
        localStorage.setItem("adminRoleId", data.roleId.toString());
        if (Array.isArray(data.permissions)) {
          localStorage.setItem(`adminPermissions_${data.roleId}`, JSON.stringify(data.permissions));
        }
      }


      if (!data.permissions || !Array.isArray(data.permissions) || data.permissions.length === 0) {
        toast.error("Tài khoản không có quyền truy cập quản trị!");
        return;
      }

      if (data.roleName === "DRIVER") {
        const baseUrl =
          process.env.FRONTEND_URL_DRIVER || "http://localhost:3001";
        window.location.href = `${baseUrl}/driver/order-deliver`;
        return;
      }

      toast.success("Đăng nhập thành công!");
      const firstPermission = data.permissions[0];
      const redirectPath = data.permissions.includes("admin/dashboard")
        ? "/admin/dashboard"
        : `/${firstPermission}`;
      window.location.href = redirectPath;
    } catch (error) {
      toast.error("Lỗi kết nối server");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#ECE9E6] to-[#FFFFFF]">
      <Toaster position="top-center" />
      <form
        onSubmit={handleAdminLogin}
        className="bg-white/80 backdrop-blur-sm p-10 shadow-2xl rounded-3xl w-[380px] border border-gray-100
                   hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Admin Portal
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Tài khoản</label>
            <input
              type="text"
              placeholder="Nhập username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 focus:border-[#B95D26] focus:ring-[#B95D26] 
                         focus:ring-1 rounded-xl w-full p-3 text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 focus:border-[#B95D26] focus:ring-[#B95D26] 
                         focus:ring-1 rounded-xl w-full p-3 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full py-3 bg-[#B95D26] text-white rounded-xl font-medium
                     hover:bg-[#a24f1f] active:scale-[0.98] transition-transform duration-150"
        >
          Đăng nhập
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          © 2025 - Hệ thống quản trị nội bộ
        </p>
      </form>
    </div>
  );
}
