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
        if (!roleId || !name.trim()) return setError("Vui lòng chọn vai trò và nhập tên quyền.");
        try {
            setLoading(true);
            await onCreate({ role_id: Number(roleId), name: name.trim(), description: desc.trim() || undefined });
            setName("");
            setDesc("");
            setRoleId("");
            onClose();
        } catch (err: any) {
            setError(err?.message || "Tạo quyền thất bại.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} /> {/* ✅ Tăng độ tối overlay */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in"> {/* ✅ Bo tròn góc và shadow */}
                <h3 className="text-xl font-bold mb-4 text-gray-800">Tạo Permission Mới</h3>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Vai trò (Role)</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                        > {/* ✅ Cập nhật style select */}
                            <option value="">-- Chọn vai trò --</option>
                            {roles.map((r) => (
                                <option value={r.id} key={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Tên Permission (slug)</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                            placeholder="Ví dụ: admin/product/create"
                        /> {/* ✅ Cập nhật style input */}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Mô tả</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                            rows={3}
                        /> {/* ✅ Cập nhật style textarea */}
                    </div>

                    {error && <div className="text-sm text-red-600 p-2 bg-red-50 rounded-lg border border-red-200">{error}</div>} {/* ✅ Thêm style cho error */}

                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-150 font-medium"
                        > {/* ✅ Nút Cancel style mới */}
                            Hủy
                        </button>
                        <button 
                            disabled={loading} 
                            type="submit" 
                            className={`px-5 py-2 text-white rounded-lg font-semibold shadow-md transition duration-150 
                                ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        > {/* ✅ Nút Create màu Indigo */}
                            {loading ? "Đang tạo..." : "Tạo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}