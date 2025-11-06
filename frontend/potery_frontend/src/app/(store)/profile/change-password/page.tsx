"use client";

import React, { useMemo, useState } from 'react';
import { BaseLayout } from '@/layouts';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts';
import { userApi } from '@/api/modules/users';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, AIChatModal } from '@/components/feature';
import { Gift, MessageSquare, User, Bot } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const userId = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    // Prefer context user id
    const fromCtx = (user as any)?.id || (user as any)?.customer_id;
    if (fromCtx) return Number(fromCtx);
    // Fallback common localStorage keys
    const keys = ['customerId', 'user_id', 'userId'];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) return Number(v);
    }
    // Fallback to stored customer JSON
    try {
      const customer = localStorage.getItem('customer');
      if (customer) {
        const obj = JSON.parse(customer);
        if (obj?.id) return Number(obj.id);
      }
    } catch {}
    return 0;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Không xác định được người dùng. Vui lòng đăng nhập lại.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Gửi đúng endpoint customers/updatecustomer với 2 trường mật khẩu
      const form = new FormData();
      // Backend không có cột current_password -> KHÔNG gửi trường này
      form.append('password', newPassword);

      await userApi.updateProfile(form as any);
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseLayout>
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
      <Toaster position="top-right" />
      <div className="max-w-lg mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Đổi mật khẩu</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </BaseLayout>
  );
}


