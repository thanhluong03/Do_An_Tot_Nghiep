"use client";
import React from "react";
import { User, getUserAvatarUrl } from "@/api/services/userService";
import { Pencil, Trash2 } from "lucide-react";
import { Role } from "@/api/services/roleService";

interface UserTableProps {
  users: User[];
  roles: Role[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  roles,
}: UserTableProps) {
  const getRoleName = (roleId: number): string => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : `#${roleId}`;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-indigo-50 border-b border-indigo-200 text-left font-semibold text-indigo-800"><tr>
            <th className="px-4 py-3 text-center w-12">STT</th>
            <th className="px-4 py-3">Ảnh đại diện</th>
            <th className="px-4 py-3">Tên đăng nhập</th>
            <th className="px-4 py-3">Họ và Tên</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Điện thoại</th>
            <th className="px-4 py-3">Vai trò</th>
            <th className="px-4 py-3 text-center">Trạng thái</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u, index) => {
              const avatarSrc = getUserAvatarUrl(u);
              const hasAvatar = avatarSrc !== "/no-image.jpg";

              return (
                <tr
                  key={u.id}
                  className="border-t border-gray-100 hover:bg-indigo-50 transition duration-100"
                >
                  <td className="px-4 py-3 text-center font-semibold text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3">
                    {hasAvatar ? (
                      <img
                        src={`data:image/jpeg;base64,${avatarSrc}`}
                        alt="avatar"
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                        A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {u.username}
                  </td>
                  <td className="px-4 py-3">{u.full_name || "-"}</td>
                  <td className="px-4 py-3">{u.email || "-"}</td>
                  <td className="px-4 py-3">{u.phone_number || "-"}</td>
                  <td className="px-4 py-3 font-medium text-indigo-600">
                    {getRoleName(u.role_id)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        u.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.is_active ? "Active" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      title="edit"
                      onClick={() => onEdit(u)}
                      className="p-2 rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 transition duration-150"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      title="delete"
                      onClick={() => u.id && onDelete(u.id)}
                      className="p-2 rounded-md text-red-600 bg-red-100 hover:bg-red-200 transition duration-150"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={9}
                className="py-10 text-center text-gray-500 font-medium"
              >
                Không tìm thấy người dùng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
