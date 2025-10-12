// src/components/adminUsers/UserFormModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { User } from "@/api/services/userService";
import toast from "react-hot-toast";

interface UserFormModalProps {
    user: User | null;
    onClose: () => void;
    onCreate: (formData: FormData) => void;
    onUpdate: (id: number, formData: FormData) => void;
}

export default function UserFormModal({
    user,
    onClose,
    onCreate,
    onUpdate,
}: UserFormModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [roleId, setRoleId] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setEmail(user.email || "");
            setFullName(user.full_name || "");
            setPhoneNumber(user.phone_number || "");
            setAddress(user.address || "");
            setRoleId(user.role_id);
            setIsActive(user.is_active ?? true);
            setAvatarPreview(user.avatar_image || "");
            setPassword(""); // password luôn rỗng khi edit
        } else {
            // reset
            setUsername("");
            setPassword("");
            setEmail("");
            setFullName("");
            setPhoneNumber("");
            setAddress("");
            setRoleId(1);
            setIsActive(true);
            setAvatarFile(null);
            setAvatarPreview("");
        }
    }, [user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
            setAvatarPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = () => {
        if (!username || (!user && !password)) {
            toast.error("Tên đăng nhập và Mật khẩu là bắt buộc!");
            return;
        }

        const formData = new FormData();
        formData.append("username", username);
        if (password) formData.append("password", password);
        formData.append("email", email);
        formData.append("full_name", fullName);
        formData.append("phone_number", phoneNumber);
        formData.append("address", address);
        formData.append("role_id", roleId.toString());
        formData.append("is_active", String(isActive));
        if (avatarFile) formData.append("avatar_image", avatarFile);

        if (user && user.id) {
            onUpdate(user.id, formData);
        } else {
            onCreate(formData);
        }
    };

    const inputClasses = "mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"> 
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in">
                <h2 className="text-xl font-bold mb-5 text-gray-800">
                    {user ? "Chỉnh sửa Người dùng" : "Thêm Người dùng Mới"}
                </h2>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên đăng nhập *</label>
                        <input
                            title="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={inputClasses}
                            disabled={!!user}
                        />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu *</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClasses}
                                placeholder="Để trống nếu không muốn thay đổi" // Gợi ý rõ ràng
                            />
                        </div>
                    )}
                    {user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu (Mới)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClasses}
                                placeholder="Để trống nếu không muốn thay đổi"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            title="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
                        <input
                            title="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <input
                            title="phone"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                        <input
                            title="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Vai trò (Role ID)</label>
                        <input
                            title="number"
                            type="number"
                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            className={inputClasses}
                            min={1}
                        />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                        <input
                            title="checkbox"
                            type="checkbox"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="text-sm font-medium text-gray-700">Kích hoạt (Active)</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
                        <input
                            title="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        /> 
                        {avatarPreview && (
                            <img
                                src={avatarPreview}
                                alt="avatar preview"
                                className="mt-3 h-20 w-20 rounded-full object-cover border-2 border-indigo-200 shadow-md"
                            /> 
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-150 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition duration-150 font-semibold shadow-md"
                    >
                        {user ? "Cập nhật" : "Tạo"}
                    </button>
                </div>
            </div>
        </div>
    );
}