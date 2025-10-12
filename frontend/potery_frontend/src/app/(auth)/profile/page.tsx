'use client';

import React, { useEffect, useState } from 'react';
import { userApi } from '../../../api/modules/users';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Customer {
  id: number | string;
  full_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  avatar_image?: string | null;
  created_at?: string;
}

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const user = await userApi.getCurrentUser();
        setCustomer(user as unknown as Customer);
        setFormData(user as unknown as Customer);
      } catch (err) {
        console.error('❌ Lỗi khi tải thông tin khách hàng:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, []);

  const handleLogout = async () => {
    await userApi.logout();
    router.push('/login');
  };

  // Cập nhật giá trị form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

// Gửi dữ liệu cập nhật
const handleSave = async () => {
  if (!customer) return;
  setSaving(true);
  try {
    // Ensure the id is a string as expected by the API to avoid the type mismatch
    const payload = {
      ...formData,
      id: formData.id !== undefined ? String(formData.id) : undefined,
    };
    const res = await userApi.updateProfile(payload as unknown as Partial<any>);
    setCustomer(res as unknown as Customer);
    setEditing(false);
    alert('✅ Cập nhật thông tin thành công!');
  } catch (err: any) {
    console.error('❌ Lỗi khi cập nhật:', err);
    alert('Lỗi khi lưu thông tin. Vui lòng thử lại.');
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        ⏳ Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
        <div className="mt-4">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-[#65604E] text-white rounded-lg hover:bg-[#3D3A2F]"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-gray-600">
        Không tìm thấy thông tin khách hàng.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow rounded-2xl mt-10">
      <div className="flex flex-col items-center text-center">
        <img
          src={customer.avatar_image || '/default-avatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover mb-4 border"
        />
        <h1 className="text-2xl font-bold text-[#2C2A24]">
          {customer.full_name}
        </h1>
        <p className="text-gray-600">{customer.email}</p>
      </div>

      {/* FORM HIỂN THỊ / CHỈNH SỬA */}
      <div className="mt-8 space-y-4 text-sm text-gray-700">
        <div>
          <label className="block font-medium text-gray-800">Họ và tên</label>
          {editing ? (
            <input
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          ) : (
            <p>{customer.full_name || '—'}</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-800">Email</label>
          <p>{customer.email}</p>
        </div>

        <div>
          <label className="block font-medium text-gray-800">Số điện thoại</label>
          {editing ? (
            <input
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          ) : (
            <p>{customer.phone_number || 'Chưa có'}</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-800">Địa chỉ</label>
          {editing ? (
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          ) : (
            <p>{customer.address || 'Chưa có'}</p>
          )}
        </div>

        <div className="flex justify-between border-t pt-3 text-gray-600 text-sm">
          <span>Ngày tạo tài khoản:</span>
          <span>{new Date(customer.created_at || '').toLocaleString('vi-VN')}</span>
        </div>
      </div>

      {/* NÚT HÀNH ĐỘNG */}
      <div className="mt-8 flex justify-center gap-4">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#65604E] text-white rounded-lg hover:bg-[#3D3A2F] disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData(customer);
              }}
              className="px-5 py-2 bg-gray-300 text-[#2C2A24] rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-5 py-2 bg-[#65604E] text-white rounded-lg hover:bg-[#3D3A2F]"
          >
            Chỉnh sửa thông tin
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
