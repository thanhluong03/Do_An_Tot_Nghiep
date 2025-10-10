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
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-3xl w-full max-w-lg p-6 animate-fade-in">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                    {editing ? "Chỉnh sửa Phân quyền" : "Tạo Phân quyền Mới"}
                </h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Tên Phân quyền</label>
                        <input
                            value={form.name}
                            onChange={(e) => onChange({ ...form, name: e.target.value })}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                            placeholder="Ví dụ: QUAN_LY_KHO"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Mô tả</label> 
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                onChange({ ...form, description: e.target.value })
                            }
                     
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                            placeholder="Mô tả chi tiết về quyền hạn"
                            rows={3}
                        />
                    </div>

                    {error && <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md border border-red-200">{error}</div>}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                    
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-150"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                         
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                        >
                            {editing ? "Cập nhật" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
