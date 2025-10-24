'use client';

import React, { useState } from 'react';
import { BaseLayout } from '../../layouts';

// Màu sắc chủ đạo:
// #2C2A24: Text đậm, màu đen ấm
// #8D806F: Màu nhấn (Accent), nâu đất sang trọng
// #FAF7F2: Background section nhẹ
// #E8E5DA: Border/Divider nhẹ

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Thêm logic gửi form thực tế ở đây
    setSubmitted(true);
  };

  return (
    <BaseLayout>
      <section className="bg-[#FAF7F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-2xl shadow-xl bg-white sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2C2A24] mb-4 pt-10 tracking-tight">
              KẾT NỐI CÙNG CHÚNG TÔI
            </h1>
            <p className="text-xl text-[#65604E] font-light max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ. Hãy để lại lời nhắn hoặc liên hệ trực tiếp.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-5">
            {/* Khối Thông tin liên hệ (Cột trái) */}
            <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-xl border border-[#E8E5DA] h-fit">
              <h3 className="text-2xl font-serif font-semibold text-[#2C2A24] mb-6">Thông tin chi tiết</h3>
              <div className="space-y-6">
                {/* Địa chỉ */}
                <div className="flex items-start">
                  <span className="text-[#8D806F] mr-3 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Địa chỉ</p>
                    <p className="text-gray-600 font-light">123 Phố Tràng Tiền, Hoàn Kiếm, Hà Nội</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start">
                  <span className="text-[#8D806F] mr-3 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Hỗ trợ</p>
                    <p className="text-gray-600 font-light">support@websitecuaban.com</p>
                  </div>
                </div>

                {/* Điện thoại */}
                <div className="flex items-start">
                  <span className="text-[#8D806F] mr-3 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Điện thoại</p>
                    <p className="text-gray-600 font-light">(+84) 987 654 321</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Khối Form liên hệ (Cột phải) */}
            <div className="lg:col-span-2 bg-white p-10 rounded-2xl shadow-xl border border-[#E8E5DA]">
              {submitted ? (
                <div className="p-8 rounded-xl bg-green-50 text-green-800 border border-green-200 text-lg font-medium text-center">
                  <h3 className="text-2xl font-serif font-bold text-green-800 mb-2">Gửi thành công! 🎉</h3>
                  <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi lại qua email của bạn trong thời gian sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <h3 className="text-2xl font-serif font-semibold text-[#2C2A24] mb-6">Gửi lời nhắn</h3>
                  
                  {/* Họ và tên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#8D806F] focus:border-[#8D806F] outline-none transition duration-300 placeholder-gray-400"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#8D806F] focus:border-[#8D806F] outline-none transition duration-300 placeholder-gray-400"
                      placeholder="tenban@email.com"
                      required
                    />
                  </div>

                  {/* Nội dung */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#8D806F] focus:border-[#8D806F] outline-none transition duration-300 placeholder-gray-400"
                      rows={5}
                      placeholder="Chi tiết yêu cầu, câu hỏi của bạn..."
                      required
                    />
                  </div>

                  {/* Button Gửi */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto mt-4 bg-[#8D806F] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-[#65604E] transition duration-300 ease-in-out transform hover:scale-[1.01]"
                  >
                    GỬI LỜI NHẮN
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}