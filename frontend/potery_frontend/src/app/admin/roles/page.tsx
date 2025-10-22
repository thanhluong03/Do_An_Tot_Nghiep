"use client";
import React, { useEffect, useState } from "react";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  Role,
  CreateRoleDto,
} from "@/api/services/roleService";
import RoleTable from "@/components/adminRole/RoleTable";
import RoleModal from "@/components/adminRole/RoleModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<CreateRoleDto>({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  useEffect(() => {
    fetchRoles();
  }, [page]);

  async function fetchRoles() {
    try {
      setLoading(true);
      const data = await getRoles({ page, size: 10, key: search });
      setRoles(data);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Name is required");

    try {
      if (editing) await updateRole(editing.id, form);
      else await createRole(form);
      setIsOpen(false);
      fetchRoles();
    } catch {
      setError("Failed to save role");
    }
  }

 async function handleDelete(id: number) {
    setItemToDeleteId(id); 
    setIsDeleteDialogOpen(true);
  }
  const performDelete = async () => {
    if (!itemToDeleteId) return;
    
    try {
      await deleteRole(itemToDeleteId);
    } catch {
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDeleteId(null);
      fetchRoles();
    }
  };
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setItemToDeleteId(null);
  };

  return (
        <div className="p-8 mx-auto bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-[#B95D26] text-center">Quản lý Phân quyền (Role Management)</h1>
                <div className="flex gap-2">
                    
                    <button
                        onClick={() => {
                            setEditing(null);
                            setForm({ name: "", description: "" });
                            setIsOpen(true);
                        }}
                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition duration-150 shadow-md"
                    >
                        + Tạo Mới
                    </button>
                </div>
            </div>

            <RoleTable
                roles={roles}
                loading={loading}
                onEdit={(r) => {
                    setEditing(r);
                    setForm({ name: r.name, description: r.description || "" });
                    setIsOpen(true);
                }}
                onDelete={handleDelete}
            />

            <RoleModal
                open={isOpen}
                editing={editing}
                form={form}
                onChange={setForm}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
                error={error}
            />
            {isDeleteDialogOpen && itemToDeleteId !== null && (
                <ConfirmDialog
                    title="Xác nhận Xoá Phân quyền"
                    message={`Bạn có chắc muốn xoá phân quyền ID: ${itemToDeleteId}? Hành động này không thể hoàn tác.`}
                    confirmText="Xác nhận Xoá"
                    cancelText="Hủy bỏ"
                    onConfirm={performDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}