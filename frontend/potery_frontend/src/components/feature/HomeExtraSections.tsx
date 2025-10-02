import React from 'react';

// Value Proposition Section
export function ValuePropositionSection() {
  return (
    <section className="py-20 bg-[#F5F1EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-6">
            Tại Sao Chọn Tiệm Gốm Nhà Gạo?
          </h2>
          <p className="text-xl text-[#65604E] max-w-3xl mx-auto leading-relaxed">
            Cam kết mang đến những sản phẩm gốm sứ chất lượng cao với giá trị văn hóa sâu sắc.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <img src="/pott.jpg" alt="Thiết Kế Độc Đáo" className="w-24 h-24 mb-4 object-cover rounded-full" />
            <div className="flex items-center mb-2">
              <span className="inline-block w-5 h-5 bg-[#A67C52] rounded-full mr-2" />
              <span className="text-lg font-semibold text-[#2C2A24]">Thiết Kế Độc Đáo</span>
            </div>
            <p className="text-[#65604E] text-center mb-4">Sự kết hợp giữa truyền thống và hiện đại, tạo nên những tác phẩm độc nhất vô nhị.</p>
            <button className="mt-auto px-6 py-2 bg-[#A67C52] text-white rounded-lg font-medium hover:bg-[#8C6239] transition">Tìm hiểu thêm</button>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <img src="/pott.jpg" alt="Chất Lượng Cao" className="w-24 h-24 mb-4 object-cover rounded-full" />
            <div className="flex items-center mb-2">
              <span className="inline-block w-5 h-5 bg-[#A67C52] rounded-full mr-2" />
              <span className="text-lg font-semibold text-[#2C2A24]">Chất Lượng Cao</span>
            </div>
            <p className="text-[#65604E] text-center mb-4">Nguyên liệu cao cấp, quy trình sản xuất nghiêm ngặt đảm bảo độ bền và vẻ đẹp vượt thời gian.</p>
            <button className="mt-auto px-6 py-2 bg-[#A67C52] text-white rounded-lg font-medium hover:bg-[#8C6239] transition">Tìm hiểu thêm</button>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <img src="/pott.jpg" alt="Giá Trị Văn Hóa" className="w-24 h-24 mb-4 object-cover rounded-full" />
            <div className="flex items-center mb-2">
              <span className="inline-block w-5 h-5 bg-[#A67C52] rounded-full mr-2" />
              <span className="text-lg font-semibold text-[#2C2A24]">Giá Trị Văn Hóa</span>
            </div>
            <p className="text-[#65604E] text-center mb-4">Lưu giữ và phát huy giá trị văn hóa qua từng sản phẩm gốm sứ truyền thống.</p>
            <button className="mt-auto px-6 py-2 bg-[#A67C52] text-white rounded-lg font-medium hover:bg-[#8C6239] transition">Tìm hiểu thêm</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
export function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-6">
            Những Chia Sẻ Chân Thực
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <img src="/pott.jpg" alt="Chị Lan Anh" className="w-20 h-20 mb-4 object-cover rounded-full" />
            <div className="flex items-center mb-2">
              <span className="text-lg font-semibold text-[#2C2A24]">Chị Lan Anh</span>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
              ))}
            </div>
            <p className="text-[#65604E] text-center mb-2">"Sản phẩm rất đẹp, chất lượng vượt mong đợi!"</p>
            <span className="text-sm text-[#A67C52] mb-2">Đã mua: Bộ ấm chén</span>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <img src="/pott.jpg" alt="Anh Minh Tuấn" className="w-20 h-20 mb-4 object-cover rounded-full" />
            <div className="flex items-center mb-2">
              <span className="text-lg font-semibold text-[#2C2A24]">Anh Minh Tuấn</span>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
              ))}
            </div>
            <p className="text-[#65604E] text-center mb-2">"Dịch vụ tận tâm, sản phẩm chất lượng cao."</p>
            <span className="text-sm text-[#A67C52] mb-2">Đã mua: Lọ hoa</span>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <img src="/pott.jpg" alt="Chị Thu Hà" className="w-20 h-20 mb-4 object-cover rounded-full" />
            <div className="flex items-center mb-2">
              <span className="text-lg font-semibold text-[#2C2A24]">Chị Thu Hà</span>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
              ))}
            </div>
            <p className="text-[#65604E] text-center mb-2">"Mẫu mã đa dạng, giá cả hợp lý."</p>
            <span className="text-sm text-[#A67C52] mb-2">Đã mua: Bộ bát đĩa</span>
          </div>
        </div>
        {/* Statistics */}
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#A67C52]">4.9/5</span>
            <span className="text-[#65604E]">Đánh Giá Trung Bình</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#A67C52]">1,247</span>
            <span className="text-[#65604E]">Lượt Đánh Giá</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#A67C52]">98%</span>
            <span className="text-[#65604E]">Khách Hàng Hài Lòng</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#A67C52]">95%</span>
            <span className="text-[#65604E]">Tỷ Lệ Mua Lại</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Journal Section
export function JournalSection() {
  return (
    <section className="py-20 bg-[#F5F1EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-6">
            Câu Chuyện & Cảm Hứng
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Blog 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col">
            <img src="/pott.jpg" alt="Nghệ Thuật Tạo Hình Gốm Truyền Thống" className="w-full h-40 mb-4 object-cover rounded-lg" />
            <span className="text-sm text-[#A67C52] mb-2">02/10/2025 • 5 phút đọc</span>
            <h3 className="text-xl font-semibold text-[#2C2A24] mb-2">Nghệ Thuật Tạo Hình Gốm Truyền Thống</h3>
            <p className="text-[#65604E] mb-4">Khám phá kỹ thuật tạo hình gốm truyền thống qua bàn tay nghệ nhân lành nghề.</p>
            <button className="mt-auto px-6 py-2 bg-[#A67C52] text-white rounded-lg font-medium hover:bg-[#8C6239] transition">Đọc tiếp</button>
          </div>
          {/* Blog 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col">
            <img src="/pott.jpg" alt="Xu Hướng Gốm Sứ Hiện Đại 2024" className="w-full h-40 mb-4 object-cover rounded-lg" />
            <span className="text-sm text-[#A67C52] mb-2">15/09/2025 • 4 phút đọc</span>
            <h3 className="text-xl font-semibold text-[#2C2A24] mb-2">Xu Hướng Gốm Sứ Hiện Đại 2024</h3>
            <p className="text-[#65604E] mb-4">Những xu hướng mới nhất trong thiết kế gốm sứ hiện đại, phù hợp với mọi không gian sống.</p>
            <button className="mt-auto px-6 py-2 bg-[#A67C52] text-white rounded-lg font-medium hover:bg-[#8C6239] transition">Đọc tiếp</button>
          </div>
          {/* Blog 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col">
            <img src="/pott.jpg" alt="Cách Bảo Quản Đồ Gốm Đúng Cách" className="w-full h-40 mb-4 object-cover rounded-lg" />
            <span className="text-sm text-[#A67C52] mb-2">28/08/2025 • 3 phút đọc</span>
            <h3 className="text-xl font-semibold text-[#2C2A24] mb-2">Cách Bảo Quản Đồ Gốm Đúng Cách</h3>
            <p className="text-[#65604E] mb-4">Hướng dẫn bảo quản đồ gốm để giữ gìn vẻ đẹp và giá trị lâu dài.</p>
            <button className="mt-auto px-6 py-2 bg-[#A67C52] text-white rounded-lg font-medium hover:bg-[#8C6239] transition">Đọc tiếp</button>
          </div>
        </div>
        <div className="text-center mt-8">
          <button className="inline-flex items-center px-8 py-4 bg-[#A67C52] text-white font-semibold rounded-lg hover:bg-[#8C6239] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Xem Tất Cả Bài Viết
          </button>
        </div>
      </div>
    </section>
  );
}
