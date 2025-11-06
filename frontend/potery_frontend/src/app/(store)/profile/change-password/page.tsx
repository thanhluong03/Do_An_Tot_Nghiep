"use client";

import React, { useMemo, useState } from 'react';
import { BaseLayout } from '@/layouts';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts';
import { userApi } from '@/api/modules/users';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const userId = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    // Prefer context user id
    const fromCtx = (user as any)?.id || (user as any)?.customer_id;
    if (fromCtx) return Number(fromCtx);
    // Fallback common localStorage keys
    const keys = ['customerId', 'user_id', 'userId'];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) return Number(v);
    }
    // Fallback to stored customer JSON
    try {
      const customer = localStorage.getItem('customer');
      if (customer) {
        const obj = JSON.parse(customer);
        if (obj?.id) return Number(obj.id);
      }
    } catch {}
    return 0;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Không xác định được người dùng. Vui lòng đăng nhập lại.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Gửi đúng endpoint customers/updatecustomer với 2 trường mật khẩu
      const form = new FormData();
      // Backend không có cột current_password -> KHÔNG gửi trường này
      form.append('password', newPassword);

      await userApi.updateProfile(form as any);
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseLayout>
      <Toaster position="top-right" />
      <div className="max-w-lg mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Đổi mật khẩu</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
}


