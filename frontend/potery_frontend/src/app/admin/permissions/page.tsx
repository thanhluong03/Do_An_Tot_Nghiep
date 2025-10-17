// src/app/admin/permissions/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast"; // ✅ Import toast và Toaster
import {
    getAvailablePermissions,
    getPermissionsByRole,
    updatePermissionsForRole,
    createPermission,
    getRoles,
} from "@/api/services/permissionApi";
import PermissionTable from "@/components/adminPermissions/PermissionTable";
import { PermissionItem } from "@/api/services/permissionApi";
import PermissionCreateModal from "@/components/adminPermissions/PermissionCreateModal";
import { RoleEntity } from "@/api/services/permissionApi";

export default function PermissionsPage() {
    const [roles, setRoles] = useState<RoleEntity[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
    const [availablePermissions, setAvailablePermissions] = useState<Record<string, PermissionItem[]>>({});
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
            toast.error("Tải dữ liệu ban đầu thất bại."); // ✅ Thêm toast
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
            toast.error("Tải phân quyền cho vai trò thất bại."); // ✅ Thêm toast
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
        if (!selectedRoleId) return setError("Vui lòng chọn một vai trò để lưu.");
        setError(null);
        setSaving(true);
        try {
            await updatePermissionsForRole(Number(selectedRoleId), Array.from(rolePermissions));
            // fetch again to refresh state from server
            await fetchRolePermissions(Number(selectedRoleId));
            localStorage.setItem('adminPermissions', JSON.stringify(Array.from(rolePermissions)));
            toast.success("Phân quyền đã được cập nhật thành công."); // ✅ Thêm toast
        } catch (err) {
            console.error(err);
            toast.error("Cập nhật phân quyền thất bại."); // ✅ Thêm toast
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
            toast.success(`Đã tạo quyền: ${payload.name}`); // ✅ Thêm toast
            return created;
        } catch (err: any) {
            // throw err to be caught by modal's try/catch
            throw err;
        }
    }

    const selectedRole = useMemo(() => roles.find((r) => r.id === selectedRoleId), [roles, selectedRoleId]);

    return (
        <div className="p-8 bg-white rounded-lg shadow-md mx-auto">
            <Toaster position="top-right" /> {/* ✅ Thêm Toaster */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Phân quyền</h1>
                <div className="flex items-center gap-3">
                    <select
                        title="luachon"
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : "")}
                        className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-sm"
                    >
                        <option value="">-- Chọn Vai trò --</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-150 shadow-md font-medium"
                    >
                        + Tạo Permission
                    </button>
                </div>
            </div>

            <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-lg shadow-sm">
                <div className="text-sm text-indigo-800">
                    <span className="font-semibold">Vai trò đang chọn:</span> <span className="font-bold">{selectedRole?.name || "Chưa chọn"}</span>
                </div>
                {error && <div className="mt-2 text-sm text-red-600 font-medium">{error}</div>}
            </div>

            <PermissionTable
                availablePermissions={availablePermissions}
                selected={rolePermissions}
                onToggle={onTogglePermission}
                loading={loading}
            />

            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={() => {
                        if (selectedRoleId) fetchRolePermissions(Number(selectedRoleId));
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-150 font-medium"
                >
                    Đặt lại
                </button>
                <button
                    onClick={onSave}
                    disabled={saving || !selectedRoleId}
                    className={`px-6 py-2 rounded-lg text-white font-semibold shadow-md transition duration-150 
                        ${!selectedRoleId || saving ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                >
                    {saving ? "Đang lưu..." : "Lưu Thay đổi"}
                </button>
            </div>

            <PermissionCreateModal open={modalOpen} roles={roles} onClose={() => setModalOpen(false)} onCreate={handleCreatePermission} />
        </div>
    );
}