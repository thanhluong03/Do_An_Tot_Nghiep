'use client';

import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement register logic
    console.log('Register:', formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-[#2C2A24] mb-2">
          Đăng Ký
        </h2>
        <p className="text-[#65604E]">
          Tạo tài khoản để trải nghiệm đầy đủ dịch vụ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#2C2A24] mb-2">
              Họ
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
              placeholder="Họ"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#2C2A24] mb-2">
              Tên
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
              placeholder="Tên"
              required
            />
          </div>
        </div>

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
          <label htmlFor="phone" className="block text-sm font-medium text-[#2C2A24] mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
            placeholder="Nhập số điện thoại"
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2C2A24] mb-2">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
            placeholder="Nhập lại mật khẩu"
            required
          />
        </div>

        <div className="flex items-center">
          <input type="checkbox" className="rounded border-[#F5F1EB] text-[#65604E] focus:ring-[#65604E]" required />
          <span className="ml-2 text-sm text-[#65604E]">
            Tôi đồng ý với{' '}
            <a href="/terms" className="text-[#65604E] hover:text-[#2C2A24] underline">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="/privacy" className="text-[#65604E] hover:text-[#2C2A24] underline">
              Chính sách bảo mật
            </a>
          </span>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#65604E] text-white hover:bg-[#3D3A2F] py-3"
        >
          Đăng Ký
        </Button>
      </form>

      <div className="text-center">
        <p className="text-[#65604E]">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#65604E] hover:text-[#2C2A24] font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
