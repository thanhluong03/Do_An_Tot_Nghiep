"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import UserTable from "@/components/adminUsers/UserTable";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "@/api/services/userService";
import UserFormModal from "@/components/adminUsers/UserFormModal";

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔄 Lấy danh sách user
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ➕ Thêm user
  const handleCreate = async (formData: FormData) => {
    try {
      await createUser(formData);
      toast.success("User created successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  // ✏️ Sửa user
  const handleUpdate = async (id: number, formData: FormData) => {
    try {
      await updateUser(id, formData);
      toast.success("User updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  // ❌ Xóa user
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6">Loading...</div>
      ) : (
        <UserTable
          users={users}
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
    </div>
  );
}
