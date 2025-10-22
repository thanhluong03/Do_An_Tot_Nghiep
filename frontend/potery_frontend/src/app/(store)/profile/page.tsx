'use client';

import React, { useEffect, useState } from 'react';
// import { userApi } from '../../../api/modules/users'; // 🔥 KHÔNG CẦN NỮA
import { useRouter } from 'next/navigation';
import { BaseLayout } from '@/layouts';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/api/modules/users'; // 🔥 VẪN CẦN CHO LOGOUT VÀ UPDATE

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
      alert('✅ Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('❌ Cập nhật thất bại. Vui lòng thử lại.');
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
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-30">
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

          {/* Floating Buttons */}
          <div className="fixed top-1/2 right-6 -translate-y-1/2 flex flex-col items-end gap-4 z-[100]">
            {/* Voucher Button */}
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="bg-yellow-400 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              title="Nhận Voucher Giảm Giá!"
            >
              🎁
            </button>

            {/* Chat Button */}
            <button
              onClick={async () => {
                if (!isAuthenticated || !user?.id) return;
                try {
                  console.log('%c💬 Tạo conversation trước khi mở chat...', 'color:deepskyblue');
                  const created = await conversationApi.createConversation({
                    sender_id: Number(user.id),
                    sender_type: 'USER',
                    content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
                    user_id: Number(user.id),
                    store_id: 1,
                  });

                  const conv = created?.conversation || created?.data || created;
                  console.log('%c✅ Conversation created:', 'color:limegreen', conv);
                  setConversationId(conv?.id || null);
                  setIsChatOpen(true);
                } catch (err) {
                  console.error('❌ Lỗi tạo conversation:', err);
                }
              }}
              className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
              title="Chat với Admin"
            >
              💬
            </button>
          </div>
        </>
      )}

      <ScrollToTopButton />
      <section className="bg-[#F5F1EB] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 border border-[#E8E5DA]">
            {/* Cột trái: Avatar + thông tin ngắn */}
            <div className="flex flex-col items-center text-center border-r border-gray-100 pr-0 lg:pr-8">
              <div className="relative">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer block relative"
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
                      className={`w-40 h-40 rounded-full object-cover border-4 border-[#E8E5DA] shadow-lg ${editing ? 'hover:opacity-80' : ''}`}
                    />
                  ) : (
                    <div
                      className="w-40 h-40 rounded-full border-4 border-[#E8E5DA] shadow-lg flex items-center justify-center bg-white"
                    >
                      <span className="text-sm font-semibold text-[#C4975A] text-center drop-shadow-sm tracking-wide">Chọn ảnh đại diện</span>
                    </div>
                  )}
                  {editing && (
                    <span className="absolute bottom-2 right-3 bg-[#C4975A] text-white text-xs px-2 py-1 rounded-full shadow">
                      ✎
                    </span>
                  )}
                </label>
              </div>

              <h1 className="text-2xl font-bold text-[#2C2A24] mt-4">{customer.full_name}</h1>
              <p className="text-gray-500">{customer.email}</p>

              <button
                onClick={handleLogout}
                className="mt-6 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm shadow-sm"
              >
                Đăng xuất
              </button>
            </div>

            {/* Cột phải: Form chi tiết */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-[#2C2A24] mb-6">Thông tin cá nhân</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C2A24] mb-2">Họ và tên</label>
                  <input
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C4975A] outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2A24] mb-2">
                    Số điện thoại
                  </label>
                  <input
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C4975A] outline-none disabled:bg-gray-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#2C2A24] mb-2">Địa chỉ</label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C4975A] outline-none disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-between border-t mt-6 pt-3 text-sm text-gray-600">
                <span>Ngày tạo tài khoản:</span>
                <span>
                  {customer.created_at
                    ? new Date(customer.created_at).toLocaleDateString('vi-VN')
                    : 'Không rõ'}
                </span>
              </div>

              <div className="mt-8 flex gap-4">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-[#C4975A] text-white rounded-full hover:bg-[#a97e4a] transition disabled:opacity-50"
                    >
                      {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData(customer);
                      }}
                      className="px-6 py-2 bg-gray-200 text-[#2C2A24] rounded-full hover:bg-gray-300 transition"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2 bg-[#65604E] text-white rounded-full hover:bg-[#3D3A2F] transition"
                  >
                    ✎ Chỉnh sửa
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
