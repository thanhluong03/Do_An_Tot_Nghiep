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
      toast.error("Username and password are required!");
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

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {user ? "Edit User" : "Add User"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border rounded-md p-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role ID</label>
            <input
              type="number"
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="mt-1 w-full border rounded-md p-2"
              min={1}
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Active</label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
              className="h-4 w-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-1 w-full"
            />
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="avatar preview"
                className="mt-2 h-16 w-16 rounded-full object-cover border"
              />
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            {user ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
