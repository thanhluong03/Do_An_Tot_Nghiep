"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { changePassword } from "@/api/services/userService";
import { Lock, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const adminId =
    typeof window !== "undefined" ? Number(localStorage.getItem("adminID")) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return toast.error("Không tìm thấy ID quản trị viên!");
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword)
      return toast.error("Vui lòng nhập đầy đủ thông tin!");
    if (form.newPassword !== form.confirmPassword)
      return toast.error("Mật khẩu mới không trùng khớp!");

    setSaving(true);
    try {
      await changePassword(adminId, {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      

      toast.success("Đổi mật khẩu thành công!");
      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Đổi mật khẩu thất bại! Kiểm tra lại mật khẩu cũ."
      );
    } finally {
      setSaving(false);
    }
  };

  return (

    <div className="max-w-2xl mx-auto p-6 md:p-10 bg-white border border-gray-200 rounded-2xl">
        <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3 mb-8">
        <Lock className="text-[#B95D26]" size={28} />
        Đổi mật khẩu
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B95D26] focus:outline-none"
            placeholder="Nhập mật khẩu cũ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu mới
          </label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B95D26] focus:outline-none"
            placeholder="Nhập mật khẩu mới"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B95D26] focus:outline-none"
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            <X size={18} /> Hủy
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#B95D26] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#a14f20] transition disabled:opacity-50"
          >
            <Save size={18} /> {saving ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}
