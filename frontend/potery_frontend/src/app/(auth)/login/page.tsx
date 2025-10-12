'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await login(formData.email, formData.password);
        // redirect is handled inside useAuth.login
      } catch (err: any) {
        setError(err?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleGoogleLogin = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  let redirectUrl = window.location.origin;

  // Fix tạm thời nếu backend thêm "/" sai
  if (redirectUrl.endsWith('/')) {
    redirectUrl = redirectUrl.slice(0, -1);
  }

  window.location.href = `${API_BASE_URL}/login/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
};


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-[#2C2A24] mb-2">
          Đăng Nhập
        </h2>
        <p className="text-[#65604E]">
          Chào mừng bạn quay trở lại với Tiệm Gốm Nhà Gạo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#2C2A24] mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
            placeholder="Nhập email của bạn"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#2C2A24] mb-2">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
            placeholder="Nhập mật khẩu"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-[#F5F1EB] text-[#65604E] focus:ring-[#65604E]" />
            <span className="ml-2 text-sm text-[#65604E]">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="text-sm text-[#65604E] hover:text-[#2C2A24]">
            Quên mật khẩu?
          </a>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <Button
          type="submit"
          className="w-full bg-[#65604E] text-white hover:bg-[#3D3A2F] py-3"
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Hoặc</span>
        </div>
      </div>

      <Button onClick={handleGoogleLogin} className="w-full bg-white text-[#2C2A24] border hover:bg-gray-50 py-3">
        <span className="mr-2">🔑</span> Đăng nhập với Google
      </Button>

      <div className="text-center">
        <p className="text-[#65604E]">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-[#65604E] hover:text-[#2C2A24] font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
