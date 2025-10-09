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

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<CreateRoleDto>({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);

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
    if (!confirm("Are you sure you want to delete this role?")) return;
    await deleteRole(id);
    fetchRoles();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Role Management</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="border rounded-l-md px-3 py-2 focus:outline-none"
          />
          <button
            onClick={() => fetchRoles()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
          >
            Search
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setForm({ name: "", description: "" });
              setIsOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            + Create
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
    </div>
  );
}
