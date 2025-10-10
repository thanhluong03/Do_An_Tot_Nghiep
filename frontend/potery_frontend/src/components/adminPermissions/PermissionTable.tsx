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
        return <div className="py-10 text-center text-lg font-medium text-indigo-600">Đang tải danh sách quyền...</div>;
    }

    if (!availablePermissions.length) {
        return <div className="py-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">Không có quyền nào khả dụng.</div>;
    }

    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-200"> {/* ✅ Header nổi bật */}
                <div className="text-base font-semibold text-indigo-800">Danh sách Quyền hạn ({availablePermissions.length})</div>
                <div className="text-sm text-indigo-600 mt-1">Chọn hoặc bỏ chọn các quyền áp dụng cho Vai trò đã chọn.</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200"> {/* ✅ Bảng dạng Grid */}
                {availablePermissions.map((perm) => {
                    const checked = selected.has(perm);
                    return (
                        <label
                            key={perm}
                            // ✅ Style item được chọn
                            className={`flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100 cursor-pointer transition duration-150
                                ${checked ? "bg-indigo-100 hover:bg-indigo-200" : "hover:bg-gray-50"}`}
                        >
                            <div className="text-sm flex-1 truncate">
                                {/* ✅ Tiêu đề quyền */}
                                <div className={`font-semibold truncate ${checked ? "text-indigo-800" : "text-gray-800"}`}>{perm}</div>
                                {/* ✅ Mô tả nhỏ */}
                                <div className="text-xs text-gray-500 mt-0.5">Quyền truy cập: **{perm.split("/").slice(-1)[0]}**</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(perm)}
                                // ✅ Checkbox màu Indigo
                                className="h-5 w-5 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500"
                            />
                        </label>
                    );
                })}
            </div>
        </div>
    );
}