// src/app/admin/permissions/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  getAvailablePermissions,
  getPermissionsByRole,
  updatePermissionsForRole,
  createPermission,
  getRoles,
} from "@/api/services/permissionApi";
import PermissionTable from "@/components/adminPermissions/PermissionTable";
import PermissionCreateModal from "@/components/adminPermissions/PermissionCreateModal";
import { RoleEntity } from "@/api/services/permissionApi";

export default function PermissionsPage() {
  const [roles, setRoles] = useState<RoleEntity[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(Number(selectedRoleId));
    } else {
      setRolePermissions(new Set());
    }
  }, [selectedRoleId]);

  async function fetchInitial() {
    setLoading(true);
    try {
      const [avails, roleList] = await Promise.all([getAvailablePermissions(), getRoles({ page: 1, size: 100 })]);
      setAvailablePermissions(avails);
      setRoles(roleList);
      // auto-select first role if exists
      if (roleList.length > 0) setSelectedRoleId(roleList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRolePermissions(roleId: number) {
    setLoading(true);
    try {
      const perms = await getPermissionsByRole(roleId);
      const names = perms.map((p) => p.name);
      setRolePermissions(new Set(names));
    } catch (err) {
      console.error(err);
      setRolePermissions(new Set());
    } finally {
      setLoading(false);
    }
  }

  function onTogglePermission(name: string) {
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function onSave() {
    if (!selectedRoleId) return setError("Please select a role");
    setError(null);
    setSaving(true);
    try {
      await updatePermissionsForRole(Number(selectedRoleId), Array.from(rolePermissions));
      // fetch again to refresh state from server
      await fetchRolePermissions(Number(selectedRoleId));
      alert("Permissions updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePermission(payload: { role_id: number; name: string; description?: string }) {
    try {
      const created = await createPermission(payload);
      // after creation, refresh available permissions and role permissions if relevant
      const avails = await getAvailablePermissions();
      setAvailablePermissions(avails);
      if (payload.role_id === Number(selectedRoleId)) {
        await fetchRolePermissions(Number(selectedRoleId));
      }
      return created;
    } catch (err) {
      throw err;
    }
  }

  const selectedRole = useMemo(() => roles.find((r) => r.id === selectedRoleId), [roles, selectedRoleId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Permissions Management</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : "")}
            className="border px-3 py-2 rounded-md"
          >
            <option value="">-- Select role --</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Create Permission
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600">Role: <span className="font-medium">{selectedRole?.name || "—"}</span></div>
      </div>

      <PermissionTable
        availablePermissions={availablePermissions}
        selected={rolePermissions}
        onToggle={onTogglePermission}
        loading={loading}
      />

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={() => {
            // reset toggles to server state
            if (selectedRoleId) fetchRolePermissions(Number(selectedRoleId));
          }}
          className="px-4 py-2 border rounded-md"
        >
          Reset
        </button>
        <button
          onClick={onSave}
          disabled={saving || !selectedRoleId}
          className={`px-4 py-2 rounded-md text-white ${!selectedRoleId ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <PermissionCreateModal open={modalOpen} roles={roles} onClose={() => setModalOpen(false)} onCreate={handleCreatePermission} />
    </div>
  );
}
