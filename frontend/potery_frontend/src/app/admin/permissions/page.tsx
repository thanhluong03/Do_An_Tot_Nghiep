"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

interface Permission {
  id: number;
  name: string;
  description: string;
}

const API_BASE_URL = "http://localhost:3000/permissions";

export default function PermissionManagerPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // 🔹 Lấy danh sách quyền
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Permission[]>(API_BASE_URL);
      setPermissions(res.data);
    } catch {
      toast.error("Không thể tải danh sách quyền hạn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // 🔹 Xử lý form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Thêm mới hoặc cập nhật quyền
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Tên quyền không được để trống!");
      return;
    }

    try {
      if (isEditing && editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, formData);
        toast.success("Cập nhật quyền thành công!");
      } else {
        await axios.post(API_BASE_URL, formData);
        toast.success("Thêm quyền mới thành công!");
      }

      setFormData({ name: "", description: "" });
      setIsEditing(false);
      setEditingId(null);
      fetchPermissions();
    } catch {
      toast.error("Không thể lưu quyền!");
    }
  };

  // 🔹 Sửa quyền
  const handleEdit = (permission: Permission) => {
    setIsEditing(true);
    setEditingId(permission.id);
    setFormData({ name: permission.name, description: permission.description || "" });
  };

  // 🔹 Xóa quyền
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa quyền này không?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      toast.success("Xóa quyền thành công!");
      fetchPermissions();
    } catch {
      toast.error("Không thể xóa quyền!");
    }
  };

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">⚙️ Quản lý quyền hạn (CRUD)</h1>

      {/* Form thêm/sửa */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 border p-4 rounded-lg shadow-sm w-full max-w-lg"
      >
        <h2 className="text-lg font-semibold mb-3">
          {isEditing ? "✏️ Chỉnh sửa quyền" : "➕ Thêm quyền mới"}
        </h2>

        <div className="mb-3">
          <label className="block font-medium mb-1">Tên quyền:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="VD: create_user, view_order"
          />
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Mô tả:</label>
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="VD: Quyền tạo người dùng"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? "Cập nhật" : "Thêm mới"}
          </button>

          {isEditing && (
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setFormData({ name: "", description: "" });
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Danh sách quyền */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Tên quyền</th>
              <th className="p-3 border-b">Mô tả</th>
              <th className="p-3 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{p.id}</td>
                <td className="p-3 border-b">{p.name}</td>
                <td className="p-3 border-b">{p.description}</td>
                <td className="p-3 border-b text-center space-x-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  Không có quyền nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
