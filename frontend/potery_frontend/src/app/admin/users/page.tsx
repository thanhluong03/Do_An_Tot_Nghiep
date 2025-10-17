"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import UserTable from "@/components/adminUsers/UserTable";
import { getRoles, Role } from "@/api/services/roleService";

import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "@/api/services/userService";
import UserFormModal from "@/components/adminUsers/UserFormModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function UserPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Tải danh sách người dùng thất bại.");
    } finally {
      setLoading(false);
    }
  };
  const fetchRoles = async () => {
  try {
    const data = await getRoles({});
    setRoles(data);
  } catch {
    toast.error("Không thể tải danh sách vai trò!");
  }
};


  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  
  const handleCreate = async (formData: FormData) => {
    try {
      await createUser(formData);
      toast.success("Tạo người dùng thành công.");
      fetchUsers();
    } catch (error) {
      toast.error("Tạo người dùng thất bại.");
    }
  };


  const handleUpdate = async (id: number, formData: FormData) => {
    try {
      await updateUser(id, formData);
      toast.success("Cập nhật người dùng thành công.");
      fetchUsers();
    } catch (error) {
      toast.error("Cập nhật người dùng thất bại.");
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteUser(confirmDeleteId);
      toast.success("Xóa người dùng thành công.");
      fetchUsers();
    } catch (error) {
      toast.error("Xóa người dùng thất bại.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-5 mx-auto bg-white rounded-lg shadow">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-orange-600">
          Quản lý tài khoản admin
        </h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-150 shadow-md font-medium"
        >
          + Thêm Người dùng
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-lg font-medium text-indigo-600">
          Đang tải dữ liệu...
        </div>
      ) : (
        <UserTable
          users={users}
          roles={roles}
          onEdit={(user) => {
            setEditingUser(user);
            setModalOpen(true);
          }}
          
          onDelete={handleDelete}
        />
      )}

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa người dùng này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
