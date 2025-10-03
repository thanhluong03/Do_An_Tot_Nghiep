'use client';

import React from 'react';
import { BaseLayout } from '../../../layouts';

export default function AboutPage() {
  return (
    <BaseLayout>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24] mb-6">Về Chúng Tôi</h1>
        <p className="text-lg text-[#65604E] leading-relaxed mb-6">
          Chúng tôi là những người đam mê nghệ thuật gốm sứ, gìn giữ và phát triển kỹ thuật
          thủ công truyền thống, mang tới các tác phẩm tinh tế cho không gian sống hiện đại.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#2C2A24]">Sứ mệnh</h2>
            <p className="text-[#65604E]">
              Gắn kết cộng đồng nghệ nhân với người yêu gốm, tạo ra giá trị bền vững cho văn hóa Việt.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#2C2A24]">Giá trị</h2>
            <ul className="list-disc pl-5 text-[#65604E] space-y-2">
              <li>Thủ công tỉ mỉ</li>
              <li>Vật liệu an toàn</li>
              <li>Thiết kế tinh tế</li>
            </ul>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}


