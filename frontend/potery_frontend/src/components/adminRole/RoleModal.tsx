"use client";
import React from "react";
import { CreateRoleDto, UpdateRoleDto, Role } from "@/api/services/roleService";

interface Props {
  open: boolean;
  editing?: Role | null;
  form: CreateRoleDto | UpdateRoleDto;
  onClose: () => void;
  onChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
}

export default function RoleModal({
  open,
  editing,
  form,
  onClose,
  onChange,
  onSubmit,
  error,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "Edit Role" : "Create Role"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              placeholder="Role name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                onChange({ ...form, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              placeholder="Optional description"
              rows={4}
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
