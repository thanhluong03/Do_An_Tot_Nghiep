'use client';

import React, { useEffect, useState } from 'react';
import { userApi } from '../../../api/modules/users';
import { useRouter } from 'next/navigation';
import { BaseLayout } from '@/layouts';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';

interface Customer {
  id?: number | string;
  full_name?: string;
  email: string;
  phone_number?: string;
  address?: string;
  avatar_image?: string | null;
  created_at?: string;
}

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
        const [isChatOpen, setIsChatOpen] = useState(false);
        const [conversationId, setConversationId] = useState<number | null>(null);
        const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const user = await userApi.getCurrentUser();
        setCustomer(user);
        setFormData(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, []);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (e) {
      console.warn('Logout failed:', e);
    }
    router.push('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const res = await userApi.updateProfile(formData as any);
      setCustomer(res);
      setFormData(res);
      setEditing(false);
      alert('✅ Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('❌ Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <BaseLayout>
        <div className="text-center text-gray-600 py-20 animate-pulse">Đang tải...</div>
      </BaseLayout>
    );

  if (!customer)
    return (
      <BaseLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">Không tìm thấy thông tin người dùng.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-[#65604E] text-white rounded-lg"
          >
            Đăng nhập lại
          </button>
        </div>
      </BaseLayout>
    );

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
                <img
                  src={customer.avatar_image || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-40 h-40 rounded-full object-cover border-4 border-[#E8E5DA] shadow-lg"
                />
                {editing && (
                  <span className="absolute bottom-2 right-3 bg-[#C4975A] text-white text-xs px-2 py-1 rounded-full shadow">
                    ✎
                  </span>
                )}
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
