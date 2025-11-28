'use client';

import React, { useEffect, useState } from 'react';
// import { userApi } from '../../../api/modules/users'; // 🔥 KHÔNG CẦN NỮA
import { useRouter } from 'next/navigation';
import { BaseLayout } from '@/layouts';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton, AIChatModal } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/api/modules/users'; // 🔥 VẪN CẦN CHO LOGOUT VÀ UPDATE
import { toast } from 'react-hot-toast';
import { Gift, MessageSquare, User, Bot } from 'lucide-react';

interface Customer {
  id?: number | string;
  full_name?: string;
  email: string;
  phone_number?: string;
  address?: string;
  avatar_image?: string | null;
  avatar?: string | null;
  created_at?: string;
}

export default function ProfilePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Lấy thông tin khách hàng trực tiếp từ API khi vào trang
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        let customerId = null;
        if (typeof window !== 'undefined') {
          customerId = localStorage.getItem('customerId');
        }
        if (customerId) {
          const data = await userApi.getCustomerDetailById(customerId);
          setCustomer({
            id: data.id,
            full_name: data.full_name || data.name || '',
            email: data.email || '',
            phone_number: data.phone_number || data.phone || '',
            address: data.address || '',
            avatar_image: data.avatar_image || data.avatar || null,
            avatar: data.avatar || null,
            created_at: data.created_at || data.createdAt || '',
          });
          setFormData({
            id: data.id,
            full_name: data.full_name || data.name || '',
            email: data.email || '',
            phone_number: data.phone_number || data.phone || '',
            address: data.address || '',
            avatar_image: data.avatar_image || data.avatar || null,
            avatar: data.avatar || null,
            created_at: data.created_at || data.createdAt || '',
          });
        }
      } catch (err) {
        console.error('Lỗi lấy thông tin khách hàng:', err);
      }
    };
    fetchCustomer();
  }, []);
  // ...existing code...

  const [customer, setCustomer] = useState<Customer | null>(null);
  // Debug: log giá trị avatar để kiểm tra backend trả về gì
  useEffect(() => {
    if (customer) {
      console.log('[PROFILE PAGE] customer.avatar_image:', customer.avatar_image, typeof customer.avatar_image);
      console.log('[PROFILE PAGE] customer.avatar:', customer.avatar, typeof customer.avatar);
    }
  }, [customer]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  // const [loading, setLoading] = useState(true); // 🔥 KHÔNG DÙNG STATE LOADING RIÊNG
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
      
  // 🔥 LẤY STATE TỪ CONTEXT (Đổi tên 'loading' thành 'authLoading' để tránh trùng lặp)
  const { user, isAuthenticated, loading: authLoading, logout, refreshUser } = useAuth();

  // Log thông tin user từ context và customer state để debug
  useEffect(() => {
    console.log('[PROFILE PAGE] user from context:', user);
    console.log('[PROFILE PAGE] customer state:', customer);
  }, [user, customer]);

  // 🔥 THAY THẾ HOÀN TOÀN useEffect CŨ BẰNG ĐOẠN NÀY
  // Luôn lấy thông tin mới nhất của user khi vào trang
  useEffect(() => {
    // Không cần đồng bộ context user nữa, chỉ cần clear khi không đăng nhập
    if (!authLoading && !isAuthenticated) {
      setCustomer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const handleLogout = async () => {
    await logout(); // 🔥 Dùng hàm logout từ context
    // router.push('/login'); // Hàm logout trong context đã xử lý việc chuyển trang
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn file ảnh
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      let dataToSend: any = formData;
      if (selectedFile) {
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, value as any);
          }
        });
        formDataToSend.append('avatar_image', selectedFile);
        dataToSend = formDataToSend;
      }
      await userApi.updateProfile(dataToSend);
      await refreshUser();
      // Fetch lại thông tin khách hàng mới nhất từ backend
      let customerId = null;
      if (typeof window !== 'undefined') {
        customerId = localStorage.getItem('customerId');
      }
      if (customerId) {
        const data = await userApi.getCustomerDetailById(customerId);
        setCustomer({
          id: data.id,
          full_name: data.full_name || data.name || '',
          email: data.email || '',
          phone_number: data.phone_number || data.phone || '',
          address: data.address || '',
          avatar_image: data.avatar_image || data.avatar || null,
          avatar: data.avatar || null,
          created_at: data.created_at || data.createdAt || '',
        });
        setFormData({
          id: data.id,
          full_name: data.full_name || data.name || '',
          email: data.email || '',
          phone_number: data.phone_number || data.phone || '',
          address: data.address || '',
          avatar_image: data.avatar_image || data.avatar || null,
          avatar: data.avatar || null,
          created_at: data.created_at || data.createdAt || '',
        });
      }
      setEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  // 🔥 DÙNG 'authLoading' ĐỂ KIỂM TRA
  if (authLoading)
    return (
      <BaseLayout>
        <div className="text-center text-gray-600 py-20 animate-pulse">Đang tải...</div>
      </BaseLayout>
    );

  // Sau khi hết loading, nếu không có customer (do !isAuthenticated)
  if (!customer)
    return (
      <BaseLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">Không tìm thấy thông tin người dùng.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-[#65604E] text-white rounded-lg"
          >
            Đăng nhập
          </button>
        </div>
      </BaseLayout>
    );

  // Nếu vượt qua 2 kiểm tra trên, 'customer' chắc chắn có dữ liệu

  return (
    <BaseLayout>
      {/* === Popup Layer === */}
      {isAuthenticated && user?.id && (
        <>
          {/* Voucher Modal */}
          {isVoucherModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/10">
              <VoucherModal
                customerId={user.id}
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
              />
            </div>
          )}

          {/* Chat Modal */}
          {isChatOpen && (
            <ChatModal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              userId={Number(user.id)}
              storeId={0}
              conversationId={conversationId} // ✅ truyền id xuống
            />
          )}

          {/* AI Chat Modal */}
          <AIChatModal
                      isOpen={isAIChatOpen}
                      onClose={() => setIsAIChatOpen(false)}
                      userId={Number(user.id)} 
                    />

          {/* Floating Buttons */}
          <div
            className={`fixed top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[100] transition-all duration-300 ${
              isChatDropdownOpen ? 'right-1' : 'right-1'
            }`}
          >
            {/* Voucher Button */}
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="bg-yellow-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              title="Nhận Voucher Giảm Giá!"
            >
              <Gift className="w-6 h-6" />
            </button>

            {/* Chat Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsChatDropdownOpen(prev => !prev)}
                className="bg-[#8B7D6B] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                title="Bắt đầu trò chuyện"
              >
                <MessageSquare className="w-6 h-6" />
              </button>

              {isChatDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 flex flex-col gap-3 transition-all duration-300 ease-out transform origin-top-right">
                  {/* Nút Chat với Admin */}
                  <div className="relative group">
                    <button
                      onClick={async () => {
                        if (!isAuthenticated || !user?.id) return;
                        try {
                          const created = await conversationApi.createConversation({
                            sender_id: Number(user.id),
                            sender_type: 'USER',
                            content: '',
                            user_id: Number(user.id),
                            store_id: 1,
                          });
                          const conv = created?.conversation || created?.data || created;
                          setConversationId(conv?.id || null);
                          setIsChatOpen(true);
                          setIsChatDropdownOpen(false);
                        } catch (err) {
                          console.error('❌ Lỗi tạo conversation:', err);
                        }
                      }}
                      className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với Admin"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Nút Chat với AI */}
                  <div className="relative group">
                    <button
                      onClick={() => {
                        setIsAIChatOpen(true); // 2. Mở popup AI chat
                        setIsChatDropdownOpen(false);
                      }}
                      className="bg-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với AI"
                    >
                      <Bot className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ScrollToTopButton />
      <section className="bg-[#FAF7F2] py-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-[24px] shadow-2xl shadow-gray-200 p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 border border-[#E8E5DA]">
            {/* Cột trái: Avatar + thông tin ngắn - NỀN RIÊNG BIỆT */}
            <div className="flex flex-col items-center text-center p-6 lg:p-0 border-b border-gray-100 lg:border-r lg:border-b-0 lg:pr-10">
              <div className="relative mb-6">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer block relative transition-opacity duration-200"
                  onClick={editing ? (e) => {
                    const input = document.getElementById('avatar-upload') as HTMLInputElement | null;
                    if (input) input.value = '';
                  } : undefined}
                >
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                    disabled={!editing}
                  />
                  {(previewUrl || (typeof customer.avatar_image === 'string' && customer.avatar_image) || (typeof customer.avatar === 'string' && customer.avatar)) ? (
                    <img
                      src={
                        previewUrl
                          ? previewUrl
                          : (typeof customer.avatar_image === 'string' && customer.avatar_image
                            ? (customer.avatar_image.startsWith('http')
                              ? customer.avatar_image
                              : `data:image/jpeg;base64,${customer.avatar_image}`)
                            : (typeof customer.avatar === 'string' && customer.avatar
                              ? (customer.avatar.startsWith('http')
                                ? customer.avatar
                                : `data:image/jpeg;base64,${customer.avatar}`)
                              : '/default-avatar.png'))
                      }
                      alt="Avatar"
                      className={`w-36 h-36 rounded-full object-cover border-4 border-[#F5F1EB] shadow-lg ${editing ? 'hover:opacity-80 transition-opacity' : ''}`}
                    />
                  ) : (
                    <div
                      className={`w-36 h-36 rounded-full border-4 border-[#F5F1EB] shadow-lg flex items-center justify-center bg-[#fcf9f5] ${editing ? 'hover:bg-[#f3ede3] transition-colors' : ''}`}
                    >
                      <span className="text-xs font-semibold text-[#8D806F] text-center tracking-wider">Tải ảnh đại diện</span>
                    </div>
                  )}
                  {editing && (
                    <span className="absolute bottom-1 right-1 bg-[#8D806F] text-white text-xs p-1 rounded-full shadow-md border-2 border-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </span>
                  )}
                </label>
              </div>

              <h1 className="text-3xl font-serif font-bold text-[#2C2A24] mt-2">{customer.full_name}</h1>
              <p className="text-gray-500 font-light mt-1">{customer.email}</p>

              <button
                onClick={handleLogout}
                className="mt-8 px-8 py-3 bg-white border border-red-400 text-red-600 rounded-xl hover:bg-red-50 transition text-base font-semibold shadow-sm"
              >
                Đăng xuất
              </button>
            </div>

            {/* Cột phải: Form chi tiết */}
            <div className="lg:col-span-2 lg:pl-4">
              <h2 className="text-3xl font-serif font-semibold text-[#2C2A24] mb-8 border-b pb-3 border-gray-100">Thông tin cá nhân</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {/* Họ và tên */}
                <div>
                  <label className="block text-sm font-medium text-[#2C2A24] mb-2 tracking-wider">HỌ VÀ TÊN</label>
                  <input
                    title='full name'
                    type="text"
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-[#8D806F] outline-none transition duration-200 ${!editing ? 'bg-[#F5F5F5] text-gray-700' : 'bg-white hover:border-gray-300'}`}
                  />
                </div>
                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-[#2C2A24] mb-2 tracking-wider">SỐ ĐIỆN THOẠI</label>
                  <input
                    title='phone number'
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-[#8D806F] outline-none transition duration-200 ${!editing ? 'bg-[#F5F5F5] text-gray-700' : 'bg-white hover:border-gray-300'}`}
                  />
                </div>
                {/* Địa chỉ */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2A24] mb-2 tracking-wider">ĐỊA CHỈ</label>
                  <textarea
                  title='address'
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={3}
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-[#8D806F] outline-none transition duration-200 ${!editing ? 'bg-[#F5F5F5] text-gray-700' : 'bg-white hover:border-gray-300'}`}
                  />
                </div>
              </div>

              {/* Thông tin phụ */}
              <div className="flex justify-between border-t mt-8 pt-4 text-sm text-black-600 font-light">
                <span className="tracking-wide">NGÀY TẠO TÀI KHOẢN:</span>
                <span className="font-medium text-[#2C2A24]">
                  {customer.created_at
                    ? new Date(customer.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : 'Không rõ'}
                </span>
              </div>

              {/* Button Actions */}
              <div className="mt-10 flex gap-4">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-8 py-3 bg-[#A3764A] text-white rounded-xl font-bold hover:bg-[#8D806F] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-100"
                    >
                      {saving ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData(customer);
                      }}
                      className="px-8 py-3 border border-gray-300 bg-white text-[#2C2A24] rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-8 py-3 bg-[#8D806F] text-white rounded-xl font-bold hover:bg-[#65604E] transition-colors shadow-md shadow-gray-300"
                  >
                    CHỈNH SỬA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
