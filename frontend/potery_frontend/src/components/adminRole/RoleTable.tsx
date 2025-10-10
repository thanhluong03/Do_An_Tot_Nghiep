"use client";
import React from "react";
import { Role } from "@/api/services/roleService";
import { Pencil, Trash2 } from 'lucide-react';
interface Props {
  roles: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

export default function RoleTable({ roles, loading, onEdit, onDelete }: Props) {
    if (loading) {
        return (
            <div className="text-center py-10 text-lg font-medium text-indigo-600">
                Đang tải dữ liệu phân quyền...
            </div>
        );
    }

    if (!roles.length) {
        return (
            <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                Không tìm thấy phân quyền nào.
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <table className="w-full table-auto text-left">
                <thead className="bg-indigo-50 border-b border-indigo-200 text-indigo-800">
                    <tr>
                        <th className="px-4 py-3 text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-sm font-semibold">Tên Phân quyền</th>
                        <th className="px-4 py-3 text-sm font-semibold">Mô tả</th>
                        <th className="px-4 py-3 text-sm font-semibold">Ngày Tạo</th>
                        <th className="px-4 py-3 text-sm font-semibold">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role) => (
                        <tr key={role.id} className="border-t border-gray-100 hover:bg-indigo-50 transition duration-100">
                            <td className="px-4 py-3">{role.id}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{role.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {role.description || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                {role.created_at
                                    ? new Date(role.created_at).toLocaleString()
                                    : "—"}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-2">
                                    <button
                                        title="edit"
                                        onClick={() => onEdit(role)}
                                        className="text-yellow-600 bg-yellow-100 p-2 rounded-md hover:bg-yellow-200 transition duration-150"
                                    >
                                        <Pencil />
                                    </button>
                                    <button
                                        title="delete"
                                        onClick={() => onDelete(role.id)}
                                        className="text-red-600 bg-red-100 p-2 rounded-md hover:bg-red-200 transition duration-150"
                                    >
                                        <Trash2 />
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