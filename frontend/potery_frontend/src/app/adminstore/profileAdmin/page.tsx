"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { getUserDetail, updateUser, getUserAvatarUrl, User } from "@/api/services/userService";
import { Pencil, Save, X, User as UserIcon, AlertCircle } from "lucide-react";

// --- Custom Components for better readability and reuse (optional, but good practice) ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isEditing: boolean;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, isEditing, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      readOnly={!isEditing}
      className={` appearance-none w-full border rounded-lg p-3 text-gray-800 transition duration-150 ease-in-out ${isEditing
          ? "border-orange-200 focus:ring-2 focus:ring-[#B95D26] focus:border-[#B95D26]"
          : "border-gray-100 bg-gray-50 cursor-default shadow-inner"
        } disabled:opacity-80`}
      autoComplete={props.type === "password" ? "new-password" : "off"}
    />
    {error && (
      <div className="flex items-center text-sm text-red-500 mt-1">
        <AlertCircle size={14} className="mr-1" /> {error}
      </div>
    )}
  </div>
);

// --- Main Component ---

export default function AdminProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const adminId = Number(typeof window !== "undefined" ? localStorage.getItem("adminID") || 0 : 0);

  useEffect(() => {
    if (!adminId) return;
    (async () => {
      try {
        const res = await getUserDetail(adminId);
        setUser(res);
        setForm({
          username: res.username || "",
          full_name: res.full_name || "",
          email: res.email || "",
          phone_number: res.phone_number || "",
          address: res.address || "",
        });
        setAvatarPreview(getUserAvatarUrl(res));
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải thông tin người dùng");
      }
    })();
  }, [adminId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho thay đổi khi đang edit (trừ field username - đã đọc ở logic gốc)
    if (!isEditing && e.target.name !== "username") return;
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setAvatarFile(f);
      setAvatarPreview(URL.createObjectURL(f));
    }
  };
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.full_name.trim() || form.full_name.length < 2) {
      newErrors.full_name = "Họ tên phải có ít nhất 2 ký tự.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email là bắt buộc.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (form.phone_number && !/^\d{9,15}$/.test(form.phone_number)) {
      newErrors.phone_number = "Số điện thoại phải gồm 9–15 chữ số.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleStartEdit = () => {
    setIsEditing(true);
    // reset password field
    setForm((p) => ({ ...p, password: "" }));
  };

  const handleCancel = () => {
    if (!user) return;
    setIsEditing(false);
    setAvatarFile(null);
    setForm({
      username: user.username || "",
      full_name: user.full_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      address: user.address || "",
    });
    setAvatarPreview(getUserAvatarUrl(user));
  };

  const handleSubmit = async () => {
    if (!user || !user.id) return;
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập vào!");
      return;
    }
    setSaving(true);

    try {
      const formData = new FormData();
      // formData.append("username", form.username); // username typically not editable
      formData.append("full_name", form.full_name);
      formData.append("email", form.email);
      formData.append("phone_number", form.phone_number);
      formData.append("address", form.address);
      if (avatarFile) formData.append("avatar_image", avatarFile);

      await updateUser(user.id, formData);

      // refresh local view: refetch or update local state
      const updated = await getUserDetail(user.id);
      setUser(updated);
      setForm((p) => ({ ...p, password: "" }));
      setAvatarFile(null);
      setAvatarPreview(getUserAvatarUrl(updated));

      // update localStorage so header/avatar reflect immediately
      try {
        if (updated.full_name) localStorage.setItem("adminName", updated.full_name);
        const avatarUrl = getUserAvatarUrl(updated);
        if (avatarUrl) localStorage.setItem("adminAvatar", avatarUrl);
      } catch (e) {
        // ignore localStorage errors
      }

      toast.success("Cập nhật thành công!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-lg text-gray-600 animate-pulse">Đang tải thông tin...</div>
      </div>
    );

  return (
    <div className="max-w-8xl md:p-8">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header and Actions */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <UserIcon className="text-[#B95D26]" size={28} />
            Thông tin cá nhân
          </h1>

          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-[#B95D26] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#B95D26]/80 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} /> {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <X size={18} /> Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 bg-indigo-50 text-[#B95D26] px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-100 transition duration-200"
            >
              <Pencil size={18} /> Chỉnh sửa
            </button>
          )}
        </div>

        {/* Profile Details Section */}
        <div className="p-6 md:p-8">

          {/* Avatar and Username Card */}
          <div className="flex flex-col md:flex-row items-center gap-8 p-6 mb-8 bg-indigo-50 rounded-xl border border-indigo-200 shadow-inner">

            {/* Avatar */}
            <div className="relative h-36 w-36 flex-shrink-0">
              <Image
                src={avatarPreview || "/no-image.jpg"}
                alt="avatar"
                fill
                priority
                className="rounded-full object-cover border-6 border-white shadow-xl"
              />
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-1">{form.full_name || form.username}</h2>
              <div className="mb-4">
                <p className="text-lg text-indigo-700 font-medium">@{form.username}</p>
                <p className="text-sm text-gray-500 mt-1 italic">Thông tin cá nhân của admin.</p>
              </div>

              {/* Avatar Update Field */}
              {isEditing && (
                <div className="mt-4">
                  <label htmlFor="avatar-upload" className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Cập nhật Ảnh Đại Diện</label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0 file:text-sm file:font-semibold
                                file:bg-indigo-200 file:text-indigo-800 hover:file:bg-indigo-300 transition duration-150"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Họ và tên"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              isEditing={isEditing}
              error={errors.full_name}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              isEditing={isEditing}
              error={errors.email}
            />
            <InputField
              label="Số điện thoại"
              name="phone_number"
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
              isEditing={isEditing}
              error={errors.phone_number}
            />
            <InputField
              label="Địa chỉ"
              name="address"
              value={form.address}
              onChange={handleChange}
              isEditing={isEditing}
            />
          </div>

          {/* Footer message */}
          {!isEditing && (
            <div className="mt-8 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 italic">
                Nhấn nút <span className="font-medium text-indigo-700">Chỉnh sửa</span> để cập nhật thông tin cá nhân của bạn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}