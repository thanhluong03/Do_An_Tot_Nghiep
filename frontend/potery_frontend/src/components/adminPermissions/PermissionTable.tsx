// src/components/admin/permissions/PermissionTable.tsx
"use client";
import React from "react";

interface Props {
  availablePermissions: string[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  loading?: boolean;
}

export default function PermissionTable({ availablePermissions, selected, onToggle, loading }: Props) {
  if (loading) {
    return <div className="py-10 text-center text-gray-600">Loading permissions...</div>;
  }

  if (!availablePermissions.length) {
    return <div className="py-10 text-center text-gray-500">No available permissions</div>;
  }

  return (
    <div className="bg-white shadow-sm rounded-md overflow-hidden">
      <div className="p-4 border-b">
        <div className="text-sm text-gray-600">Available permissions ({availablePermissions.length})</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        {availablePermissions.map((perm) => {
          const checked = selected.has(perm);
          return (
            <label
              key={perm}
              className="flex items-center justify-between gap-4 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
            >
              <div className="text-sm">
                <div className="font-medium">{perm}</div>
                <div className="text-xs text-gray-500">Permission to access {perm.split("/").slice(-1)[0]}</div>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(perm)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
