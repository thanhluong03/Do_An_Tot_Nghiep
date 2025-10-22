"use client";
import React from "react";

interface PermissionItem {
    key: string;
    name: string;
}

interface Props {
    availablePermissions: Record<string, PermissionItem[]>;
    selected: Set<string>;
    onToggle: (key: string) => void;
    loading?: boolean;
    onSelectAll: (select: boolean) => void; 
    isRoleSelected: boolean;
}

export default function PermissionTable({ availablePermissions, selected, onToggle, loading , onSelectAll, isRoleSelected}: Props) {
    const parentKeys = Object.keys(availablePermissions);
    const hasAvailablePermissions = parentKeys.length > 0;
    
    const hasSelectedPermissions = selected.size > 0;
    if (loading) {
        return <div className="py-10 text-center text-lg font-medium text-indigo-600">Đang tải danh sách quyền...</div>;
    }
    if (!parentKeys.length) {
        return <div className="py-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">Không có quyền nào khả dụng.</div>;
    }
    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-200">
                <div className="text-base font-semibold text-indigo-800">Danh sách Quyền hạn ({parentKeys.length})</div>
                <div className="text-sm text-indigo-600 mt-1">Chọn hoặc bỏ chọn các quyền áp dụng cho Vai trò đã chọn.</div>
            </div>
            <div className="flex gap-2 p-4">
                    <button
                        onClick={() => onSelectAll(true)}
                        disabled={loading || !isRoleSelected || !hasAvailablePermissions}
                        className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        Chọn tất cả
                    </button>
                    <button
                        onClick={() => onSelectAll(false)}
                        disabled={loading || !isRoleSelected || !hasSelectedPermissions}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-150 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        Bỏ chọn tất cả
                    </button>
                </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                {parentKeys.map((parent) => {
                    const parentObj = availablePermissions[parent][0];
                    return (
                        <div
                            key={parentObj.key}
                            className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200 px-5 py-4 m-3 min-h-[120px]"
                        >
                            <label
                                className={`flex items-center justify-between gap-4 mb-2 cursor-pointer transition duration-150 ${selected.has(parentObj.key) ? "bg-indigo-50" : ""}`}
                            >
                                <div className="text-base flex-1 truncate font-semibold text-indigo-700">{parentObj.name}</div>
                                <input
                                    type="checkbox"
                                    checked={selected.has(parentObj.key)}
                                    onChange={() => onToggle(parentObj.key)}
                                    className="h-5 w-5 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>
                            {availablePermissions[parent].length > 1 && (
                                <div className="flex flex-col gap-1 mt-2">
                                    {availablePermissions[parent].slice(1).map((child) => (
                                        <label
                                            key={child.key}
                                            className={`flex items-center gap-2 cursor-pointer transition duration-150 pl-7 py-1 rounded-lg border border-gray-100 bg-gray-50 hover:bg-indigo-50 ${selected.has(child.key) ? "border-indigo-300 bg-indigo-50" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected.has(child.key)}
                                                onChange={() => onToggle(child.key)}
                                                className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className={`text-xs ${selected.has(child.key) ? "text-indigo-700 font-semibold" : "text-gray-700"}`}>{child.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}