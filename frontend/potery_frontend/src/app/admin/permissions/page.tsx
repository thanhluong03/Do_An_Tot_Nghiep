"use client";
import React, { useEffect, useState } from "react";
import {
  getPermissions,
  addPermission,
  updatePermission,
  deletePermission,
  Permission,
} from "@/api/services/permissionApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";

export default function PermissionPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [form, setForm] = useState<Permission>({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch (error) {
      toast.error("Không thể tải danh sách quyền");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      if (editingId) {
        await updatePermission(editingId, form);
        toast.success("Cập nhật quyền thành công");
      } else {
        await addPermission(form);
        toast.success("Thêm quyền mới thành công");
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      loadPermissions();
    } catch (error) {
      toast.error("Lỗi khi lưu quyền");
    }
  };

  const handleEdit = (p: Permission) => {
    setForm(p);
    setEditingId(p.id!);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa quyền này?")) {
      try {
        await deletePermission(id);
        toast.success("Xóa thành công");
        loadPermissions();
      } catch (error) {
        toast.error("Không thể xóa quyền");
      }
    }
  };

  return (
    <div className="p-6">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Quản lý quyền</h2>

      {/* Form thêm/sửa */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h3 className="font-semibold mb-3">
          <FontAwesomeIcon icon={faPlus} className="text-purple-600 mr-2" />
          {editingId ? "Chỉnh sửa quyền" : "Thêm quyền mới"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Tên quyền</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="vd: admin/product"
              className="border w-full p-2 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-medium">Mô tả</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="vd: Quyền quản lý sản phẩm"
              className="border w-full p-2 rounded mt-1"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white mt-4 px-4 py-2 rounded"
        >
          {editingId ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Tên quyền</th>
              <th className="border p-2 text-left">Mô tả</th>
              <th className="border p-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border p-2">{p.id}</td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.description}</td>
                <td className="border p-2 text-center space-x-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id!)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-3 text-gray-500">
                  Chưa có quyền nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
