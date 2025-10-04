'use client';

import React, { useState } from 'react';
import { BaseLayout } from '../../layouts';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <BaseLayout>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24] mb-6">Liên Hệ</h1>
        <p className="text-lg text-[#65604E] mb-8">Hãy để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất.</p>
        {submitted ? (
          <div className="p-4 rounded bg-green-50 text-green-700">Cảm ơn bạn! Chúng tôi đã nhận được thông tin.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded px-3 py-2" rows={5} required />
            </div>
            <button type="submit" className="bg-[#65604E] text-white px-6 py-2 rounded">Gửi</button>
          </form>
        )}
      </section>
    </BaseLayout>
  );
}


