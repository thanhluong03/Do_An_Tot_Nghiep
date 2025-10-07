'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { newsApi, NewsItem } from '../../../api/modules/news';

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await newsApi.list();
        if (mounted) setItems(data);
      } catch (e) {
        if (mounted) setError('Không thể tải tin tức');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-serif font-bold mb-6">Tin tức</h1>

        {loading && (
          <div className="text-gray-600">Đang tải…</div>
        )}
        {error && (
          <div className="text-red-600">{error}</div>
        )}

        {!loading && !error && (
          items.length === 0 ? (
            <div className="text-gray-600">Chưa có bài viết.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((n) => (
                <article key={n.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/pott.jpg" alt={n.title} className="w-full h-40 object-cover rounded mb-4" />
                  <div className="text-sm text-[#A67C52] mb-1">
                    {n.published_at ? new Date(n.published_at).toLocaleDateString('vi-VN') : '—'}
                  </div>
                  <h2 className="text-lg font-semibold text-[#2C2A24] line-clamp-2">{n.title}</h2>
                  <p className="text-[#65604E] mt-2 line-clamp-3">{n.content}</p>
                  <div className="mt-auto pt-4">
                    <a href="#" className="inline-block text-[#65604E] hover:underline">Đọc tiếp</a>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </BaseLayout>
  );
}


