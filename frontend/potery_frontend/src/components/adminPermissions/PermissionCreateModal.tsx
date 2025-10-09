// src/components/admin/permissions/PermissionCreateModal.tsx
"use client";
import React, { useState } from "react";
import { RoleEntity } from "@/types/permission";

interface Props {
  open: boolean;
  roles: RoleEntity[];
  onClose: () => void;
  onCreate: (payload: { role_id: number; name: string; description?: string }) => Promise<void>;
}

export default function PermissionCreateModal({ open, roles, onClose, onCreate }: Props) {
  const [roleId, setRoleId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!roleId || !name.trim()) return setError("Select role and enter permission name");
    try {
      setLoading(true);
      await onCreate({ role_id: Number(roleId), name: name.trim(), description: desc.trim() || undefined });
      setName("");
      setDesc("");
      setRoleId("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create permission");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Create Permission</h3>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">-- Select role --</option>
              {roles.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Permission Name (slug)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="e.g. admin/custom-feature"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              rows={3}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">
              Cancel
            </button>
            <button disabled={loading} type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
