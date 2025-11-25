'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { orderApi } from '../../../api/modules/orders';
import Image from 'next/image';
import Link from 'next/link';
import { productApi } from '../../../api/modules/products';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/dist/client/components/navigation';
import { ArrowLeft, Bot, Gift, MessageSquare, Search, User } from 'lucide-react';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, AIChatModal } from '@/components/feature';

const translateStatus = (status: string | undefined): string => {
  if (!status) return 'Không rõ';
  const s = status.toUpperCase();
  switch (s) {
    case 'CREATED':
    case 'PENDING':
      return 'Đang chờ xử lý';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PROCESSING':
      return 'Đang đóng gói';
    case 'SHIPPING':
      return 'Đang vận chuyển';
    case 'DELIVERED':
      return 'Đã giao thành công';
    case 'RETURN_REQUESTED':
      return 'Đang yêu cầu hoàn trả';
    case 'COMPLETED':
      return 'Đã giao thành công';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'FAILED':
      return 'Thất bại';
    default:
      return status;
  }
};
const statusTabs = [
  { key: 'ALL', name: 'Tất cả', statuses: [] },
  { key: 'PENDING', name: 'Chờ xử lý', statuses: ['CREATED', 'PENDING'] },
  { key: 'PROCESSING', name: 'Đang giao hàng', statuses: ['CONFIRMED', 'PROCESSING', 'SHIPPING'] },
  { key: 'COMPLETED', name: 'Đã hoàn thành', statuses: ['DELIVERED', 'COMPLETED'] },
  { key: 'CANCELLED', name: 'Đã hủy', statuses: ['CANCELLED', 'FAILED'] },
];
const translatePaymentStatus = (status: string | undefined): string => {
  if (!status) return 'Chờ thanh toán';
  const s = status.toUpperCase();
  switch (s) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'UNPAID':
      return 'Chưa thanh toán';
    case 'FAILED':
      return 'Thanh toán thất bại';
    default:
      return status;
  }
};
const translatePaymentMethod = (method: string | undefined): string => {
  if (!method) return '—';
  const m = method.toUpperCase();
  switch (m) {
    case 'COD':
    case 'ONSITE':
      return 'Thanh toán khi nhận hàng (COD)';
    case 'VNPAY':
    case 'CARD':
      return 'Thẻ/VNPay';
    default:
      return method;
  }
};
export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Record<number, any>>({});
  const { clear: clearCart } = useCart();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const handleCancelOrder = async (orderId: any) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      try {
        await orderApi.updateOrder(Number(orderId), {
          status: 'CANCELLED',
          actorType: 'CUSTOMER',
        });
        setOrders(prevOrders =>
          prevOrders.map(order =>
            (order.id ?? order._id) == orderId
              ? { ...order, status: 'CANCELLED' }
              : order
          )
        );
        toast.success('Đã hủy đơn hàng thành công.');
      } catch (error) {
        console.error('Lỗi hủy đơn hàng:', error);
        toast.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
      }
    }
  };
  const handleReturnOrder = async (orderId: any) => {
    // TODO: Implement return logic
    if (window.confirm('Bạn có chắc chắn muốn hoàn đơn hàng này không?')) {
      try {
        await orderApi.updateOrder(Number(orderId), {
          status: 'RETURN_REQUESTED',
          actorType: 'CUSTOMER',
        });
        setOrders(prevOrders =>
          prevOrders.map(order =>
            (order.id ?? order._id) == orderId
              ? { ...order, status: 'RETURN_REQUESTED' }
              : order
          )
        );
        toast.success('Đã hoàn đơn hàng thành công.');
      } catch (error) {
        console.error('Lỗi hoàn đơn hàng:', error);
        toast.error('Không thể hoàn đơn hàng. Vui lòng thử lại.');
      }
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('order_id');

    if (paymentStatus === 'success' && orderId) {
      (async () => {
        try {
          await orderApi.updateOrder(Number(orderId), {
            status: 'CONFIRMED',
            payment_status: 'PAID',
          });
          clearCart();
          toast.success('🎉 Thanh toán thành công!');
          window.history.replaceState({}, '', '/orders');
        } catch (err) {
          console.error('❌ Lỗi cập nhật đơn:', err);
          toast.error('Không thể cập nhật trạng thái đơn hàng.');
        }
      })();
    } else if (paymentStatus === 'failed') {
      toast.error('❌ Thanh toán thất bại, vui lòng thử lại!');
      window.history.replaceState({}, '', '/orders');
    }
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = orders.flatMap(o => o.items?.map((i: any) => i.product_id)).filter(Boolean);
      const uniqueIds = [...new Set(productIds)];
      const result: Record<number, any> = {};

      await Promise.all(uniqueIds.map(async id => {
        try {
          const data = await productApi.getProductById(String(id));
          result[id] = data;
        } catch { }
      }));
      setProductMap(result);
    };

    if (orders.length > 0) fetchProducts();
  }, [orders]);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderApi.getOrdersByCustomer(user.id as string, 1, 50);
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : data?.data || [];
        const seen = new Set();
        const unique = list.filter((o: any) => {
          const id = o?.id ?? o?._id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setOrders(unique);
      } catch (e: any) {
        setError(e?.message || 'Không thể tải đơn hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user?.id]);

  const formatPrice = (price: number | string) => {
    const num = Number(price) || 0;
    return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };
  const filteredOrders = orders.filter((order) => {
    const normalizedStatus = order.status?.toUpperCase();

    // 1. Lọc theo Tab Trạng thái
    const currentTab = statusTabs.find(tab => tab.key === activeTab);
    const statusMatch = activeTab === 'ALL' || currentTab?.statuses.includes(normalizedStatus);

    if (!statusMatch) return false;

    // 2. Lọc theo Thanh tìm kiếm (ID hoặc Tên sản phẩm)
    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase().trim();
    const orderId = (order.id ?? order._id)?.toString();

    // Check nếu ID khớp
    if (orderId?.includes(query)) return true;

    // Check nếu Tên sản phẩm khớp
    const items = order.current_order?.items || order.items || [];
    const productNameMatch = items.some((item: any) =>
      item.product_name?.toLowerCase().includes(query)
    );

    if (productNameMatch) return true;

    return false;
  });
  const tabCounts = statusTabs.reduce((acc, tab) => {
    const count = orders.filter((order) => {
      const normalizedStatus = order.status?.toUpperCase();

      // 1. Check Status Match (sử dụng tiêu chí của tab hiện tại)
      const statusMatch = tab.key === 'ALL' || tab.statuses.includes(normalizedStatus);
      if (!statusMatch) return false;

      // 2. Check Search Query Match (giữ nguyên logic tìm kiếm)
      if (searchQuery.trim() === "") return true;

      const query = searchQuery.toLowerCase().trim();
      const orderId = (order.id ?? order._id)?.toString();

      if (orderId?.includes(query)) return true;

      const items = order.current_order?.items || order.items || [];
      const productNameMatch = items.some((item: any) =>
        item.product_name?.toLowerCase().includes(query)
      );

      return productNameMatch;
    }).length;

    acc[tab.key] = count;
    return acc;
  }, {} as Record<string, number>);
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'created':
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'completed':
      case 'delivered':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
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
            className={`fixed top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[100] transition-all duration-300 ${isChatDropdownOpen ? 'right-1' : 'right-1'
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

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 p-4 ml-10 rounded-xl text-gray-500 hover:bg-gray-100 active:scale-95 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="">Trang trước đó</span>
      </button>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#F5F1EB] min-h-[80vh]">

        {/* Tiêu đề: Tinh tế, font serif */}
        <h1 className="text-3xl font-serif mb-8 text-[#2C2A24] text-center tracking-wider relative pb-2 border-b border-[#C4975A]/30">
          Lịch sử Đơn hàng
        </h1>
        <div className="bg-white p-4 rounded-xl shadow-lg mb-2 border border-[#E5E2D8]">
          {/* Thanh tìm kiếm */}
          <div className="mb-2">
            {/* Thêm relative để định vị icon bên trong */}
            <div className="relative">
              {/* Icon Search */}
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
              {/* Input field */}
              <input
                type="text"
                placeholder="Tìm kiếm theo Mã đơn hàng hoặc Tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // Thay đổi p-3 thành pl-10 để nhường chỗ cho icon
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#C4975A] focus:border-[#C4975A] transition duration-150"
              />
            </div>
          </div>
          {/* Tabs trạng thái */}
          <div className="flex flex-wrap gap-2 sm:gap-4 pb-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                px-2 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 flex gap-2
                ${activeTab === tab.key
                    ? 'bg-[#C4975A] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {tab.name}
                <span className={`
                    text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full
                    ${activeTab === tab.key ? 'bg-white text-[#C4975A]' : 'bg-gray-100 text-gray-800'}
                `}>
                  {tabCounts[tab.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-10 text-[#65604E] text-sm">Đang tải đơn hàng...</div>}
        {error && <div className="text-center text-red-600 py-10 text-sm border border-red-300 bg-red-50 rounded-lg mx-auto max-w-lg">{error}</div>}

        {!loading && !error && (


          filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-md border border-[#E5E2D8]">
              <p className="text-base mb-4">
                {orders.length === 0
                  ? 'Bạn chưa có đơn hàng nào.'
                  : 'Không tìm thấy đơn hàng nào khớp với tiêu chí tìm kiếm/lọc.'
                }
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-2 text-sm bg-[#C4975A] text-white font-medium rounded-full shadow-md hover:bg-[#a97e4a] transition-all"
              >
                Khám phá Sản phẩm
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const id = order.id ?? order._id;
                const info = order.current_order || order;
                const items = info.items || [];
                const total = info.total_amount ?? info.total ?? order.total_amount ?? 0;
                console.log(`Order ID: ${id}, Status: ${order.status}`);
                return (
                  <div
                    key={id}
                    className="bg-white rounded-xl border border-[#E5E2D8] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >

                    {/* Header */}
                    <div className="flex justify-between items-center px-5 py-3 border-b border-[#E5E2D8]">
                      <div>
                        <div className="font-semibold text-base text-[#2C2A24] ">
                          Mã đơn hàng: <span className="font-bold text-[#C4975A]">#{id}</span>
                        </div>
                        <div className="text-xs text-[#65604E] mt-0.5">
                          Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        <span
                          className={`px-3 py-1 text-xs uppercase tracking-wider rounded-full font-bold border ${getStatusColor(order.status)}`}
                        >
                          {translateStatus(order.status)}
                        </span>
                        <span className='text-xs font-medium text-gray-500'>
                          ({translatePaymentStatus(info.payment_status)})
                        </span>
                      </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="divide-y divide-gray-100">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-5 py-3 hover:bg-[#FEFDFB] transition">
                          <div className="w-16 h-16 relative flex-shrink-0 border border-gray-100 rounded-lg"> {/* Ảnh 64x64, rounded-lg */}
                            <Image
                              src={
                                item?.product_images?.[0]?.image_data
                                  ? `data:image/avif;base64,${item.product_images[0].image_data}`
                                  : productMap[item.product_id]?.images?.[0]
                                    ? productMap[item.product_id].images[0]
                                    : '/no-image.png'
                              }
                              alt={item.product_name || 'Sản phẩm'}
                              fill
                              unoptimized
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#2C2A24] leading-snug truncate">
                              {item.product_name}
                            </div>
                            {(item.attribute1_name || item.attribute2_name) && (
                              <div className="text-xs text-[#A38D64] font-semibold mt-0.5">
                                Phân loại:
                                {item.attribute1_name && (
                                  <span> {item.attribute1_name}</span>
                                )}
                                {item.attribute2_name && (
                                  <span>{item.attribute1_name ? ' - ' : ''}{item.attribute2_name}</span>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-0.5">
                              Số lượng: <span className="font-medium text-[#2C2A24]">{item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right font-semibold text-sm text-[#2C2A24] whitespace-nowrap pt-1">
                            {formatPrice(item.price_at_order * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Tổng cộng & Nút chi tiết */}
                    <div className="flex justify-between items-center px-5 py-3 border-[#E5E2D8]">

                      <div className='text-left'>
                        <div className="text-sm text-gray-600">
                          Thanh toán: <span className="font-semibold text-[#2C2A24]">{translatePaymentMethod(info.payment_method)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Phí vận chuyển: <span className="font-semibold text-[#2C2A24]">{formatPrice(30000)}</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div> 
                          <div className="text-sm font-semibold  text-gray-600">Tổng tiền hàng: <span>{formatPrice(info.total_amount)}</span></div>
                          <div className="text-sm font-semibold  text-gray-600">Tổng thanh toán: <span className="font-bold text-[#A38D64]">{formatPrice(info.total_amount + 30000)}</span></div>
                        </div>
                      </div>

                    </div>
                    <div className="flex justify-end items-center p-5 bg-white border-t border-[#E5E2D8] gap-4">
                      {['CREATED', 'PENDING', 'CONFIRMED', 'SHIPPING'].includes(order.status?.toUpperCase()) && (
                        <button
                          onClick={() => handleCancelOrder(id)}
                          className="px-6 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md"
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                      {(() => {
                        const isDelivered = order.status?.toUpperCase() === 'DELIVERED';

                        // Lấy ngày giao hàng (tùy API bạn)
                        const deliveredAt = order.delivery_date || order.delivered_at || order.updated_at;

                        if (!deliveredAt) return null;

                        const diffDays =
                          (new Date().getTime() - new Date(deliveredAt).getTime()) /
                          (1000 * 60 * 60 * 24);

                        const within7Days = diffDays <= 7;

                        return isDelivered && within7Days ? (
                          <button
                            onClick={() => handleReturnOrder(id)}
                            className="px-6 py-2 text-sm font-semibold border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-md"
                          >
                            Đổi trả đơn hàng
                          </button>
                        ) : null;
                      })()}
                      <Link
                        href={`/orders/${id}`}
                        className="px-6 py-2 text-sm font-semibold border border-[#C4975A] rounded-full
                          hover:bg-gradient-to-r hover:from-[#C4975A] hover:to-[#b88648]
                          hover:text-white text-[#C4975A] transition-all shadow-md"
                      >
                        Xem chi tiết đơn hàng
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </BaseLayout >
  );
}