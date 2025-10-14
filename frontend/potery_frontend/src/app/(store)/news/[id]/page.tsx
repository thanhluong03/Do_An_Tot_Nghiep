'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BaseLayout } from '../../../../layouts';
import { newsApi, NewsItem } from '../../../../api/modules/news';
import Link from 'next/link';

export default function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const detail = await newsApi.detail(String(id));
        setNews(detail);

        // fetch bài liên quan (ví dụ: 3 bài mới nhất khác bài hiện tại)
        const { items } = await newsApi.list(1, 3);
        setRelated(items.filter((x: NewsItem) => x.id !== detail.id));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNews();
  }, [id]);

  if (loading) {
    return (
      <BaseLayout>
        <div className="max-w-5xl mx-auto py-20 text-center text-gray-600">
          Đang tải bài viết...
        </div>
      </BaseLayout>
    );
  }

  if (!news) {
    return (
      <BaseLayout>
        <div className="max-w-5xl mx-auto py-20 text-center text-gray-600">
          Không tìm thấy bài viết.
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
    
      <section className="bg-[#FBFBFB] py-10 ">
        <div className="mt-10 border-t border-gray-200 pt-8 pl-100 mb-6">
                <Link href="/news" className="text-[#A67C52] hover:underline">
                  ← Quay lại danh sách bài viết
                </Link>
              </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 relative grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-start">

            {/* Bên trái: nội dung bài */}
            <article>
              <div className="text-sm text-gray-500 mb-3 flex gap-2 items-center">
                <span>{new Date(news.published_at).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>Tác giả: {  'Admin'}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif text-[#2C2A24] mb-6 leading-tight">
                {news.title}
              </h1>

              <div className="prose prose-lg max-w-none text-[#4B4B4B]">
                {news.image && (
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full rounded-xl mb-6 object-cover"
                  />
                )}
                <p className="whitespace-pre-line leading-relaxed">{news.content}</p>
              </div>

              
            </article>

            {/* Bên phải: sidebar */}
            <aside className="space-y-8">
              {/* Danh mục */}
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-[#2C2A24] mb-3">
                  Danh mục bài viết
                </h3>
                <ul className="text-[#6B6659] text-sm space-y-2">
                  <li><Link href="#">Tin tức</Link></li>
                  <li><Link href="#">Câu chuyện thủ công</Link></li>
                  <li><Link href="#">Workshop</Link></li>
                  <li><Link href="#">Bí quyết bảo quản</Link></li>
                </ul>
              </div>

              {/* Bài viết nổi bật */}
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-[#2C2A24] mb-3">
                  Bài viết nổi bật
                </h3>
                <ul className="space-y-4">
                  {related.map((r) => (
                    <li key={r.id} className="flex items-center gap-3">
                      <img
                        src={r.image || '/pott.jpg'}
                        alt={r.title}
                        className="w-14 h-14 rounded-md object-cover"
                      />
                      <div>
                        <Link
                          href={`/news/${r.id}`}
                          className="text-sm text-[#2C2A24] hover:text-[#A67C52] font-medium line-clamp-2"
                        >
                          {r.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {new Date(r.published_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form đăng ký nhận tin */}
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-[#2C2A24] mb-3">
                  Đăng ký nhận tin
                </h3>
                <p className="text-sm text-[#6B6659] mb-3">
                  Nhận thông báo khi có bài viết mới nhất từ Tiệm Gốm.
                </p>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3"
                />
                <button className="w-full bg-[#A67C52] text-white py-2 rounded-md text-sm font-medium hover:opacity-90">
                  Đăng ký
                </button>
              </div>
            </aside>
          </div>

          {/* Bài viết liên quan */}
          <div className="mt-14">
            <h2 className="text-2xl font-serif text-[#2C2A24] mb-6">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/news/${r.id}`}
                  className="block bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
                >
                  <img
                    src={r.image || '/pott.jpg'}
                    alt={r.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#2C2A24] mb-2 line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-sm text-[#65604E] line-clamp-3">
                      {r.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
