"use client";
import React from "react";
import { Role } from "@/api/services/roleService";

interface Props {
  roles: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

export default function RoleTable({ roles, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">Loading roles...</div>
    );
  }

  if (!roles.length) {
    return (
      <div className="text-center py-10 text-gray-500">No roles found</div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-md overflow-hidden">
      <table className="w-full table-auto text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{role.id}</td>
              <td className="px-4 py-3 font-medium">{role.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {role.description || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {role.created_at
                  ? new Date(role.created_at).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(role)}
                    className="px-3 py-1 rounded-md border hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(role.id)}
                    className="px-3 py-1 rounded-md border text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
