export default function StoreDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#2C2A24] mb-2">
          Dashboard Cửa Hàng
        </h1>
        <p className="text-[#65604E]">
          Quản lý cửa hàng gốm sứ của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#7A8471] rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#65604E]">Sản Phẩm</p>
              <p className="text-2xl font-bold text-[#2C2A24]">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#65604E] rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#65604E]">Đơn Hàng</p>
              <p className="text-2xl font-bold text-[#2C2A24]">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#D4AF37] rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#65604E]">Doanh Thu</p>
              <p className="text-2xl font-bold text-[#2C2A24]">₫45M</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#8B7D6B] rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#65604E]">Đánh Giá</p>
              <p className="text-2xl font-bold text-[#2C2A24]">4.8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#2C2A24] mb-4">Sản Phẩm Mới Nhất</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-[#F5F1EB] rounded-lg p-4">
            <div className="w-full h-32 bg-[#F5F1EB] rounded-lg mb-3 flex items-center justify-center">
              <span className="text-[#65604E]">Hình ảnh sản phẩm</span>
            </div>
            <h3 className="font-medium text-[#2C2A24]">Lọ Hoa Cung Đình</h3>
            <p className="text-sm text-[#65604E]">₫2,850,000</p>
          </div>
          <div className="border border-[#F5F1EB] rounded-lg p-4">
            <div className="w-full h-32 bg-[#F5F1EB] rounded-lg mb-3 flex items-center justify-center">
              <span className="text-[#65604E]">Hình ảnh sản phẩm</span>
            </div>
            <h3 className="font-medium text-[#2C2A24]">Bộ Ấm Chén Trà</h3>
            <p className="text-sm text-[#65604E]">₫1,500,000</p>
          </div>
          <div className="border border-[#F5F1EB] rounded-lg p-4">
            <div className="w-full h-32 bg-[#F5F1EB] rounded-lg mb-3 flex items-center justify-center">
              <span className="text-[#65604E]">Hình ảnh sản phẩm</span>
            </div>
            <h3 className="font-medium text-[#2C2A24]">Bộ Bát Đĩa Gia Đình</h3>
            <p className="text-sm text-[#65604E]">₫850,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
