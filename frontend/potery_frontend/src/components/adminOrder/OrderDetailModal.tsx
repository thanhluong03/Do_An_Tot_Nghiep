// src/components/adminOrders/OrderDetailModal.tsx
import React from 'react';
import { Order } from '@/api/services/orderService';
import { X, MapPin, CreditCard, ShoppingBag, Truck } from 'lucide-react'; // Thêm Truck

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm hiển thị một dòng thông tin
const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    // Sử dụng màu xám đậm và đường line mỏng
    <div className="flex justify-between items-start py-2 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
    </div>
);

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-1000 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all border border-gray-100">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-light text-gray-900 tracking-wide">
                        Chi tiết Đơn hàng <span className="font-semibold text-orange-600">#{order.id}</span>
                    </h2>
                    <button
                        title='close' 
                        onClick={onClose} className="p-3 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 grid md:grid-cols-3 gap-10">
                    <div className="md:col-span-1 space-y-6">
                        <section className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
                            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                <Truck className="w-5 h-5 mr-2 text-orange-600" />
                                Giao hàng & Địa chỉ
                            </h3>
                            <InfoRow label="Ngày đặt hàng" value={new Date(order.order_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                            <div className="py-3 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-600 block mb-1">Địa chỉ Giao hàng:</span>
                                <p className="text-sm font-semibold text-gray-900">{order.shipping_address || 'Chưa cung cấp'}</p>
                            </div>
                            <InfoRow label="Khách hàng ID" value={<span className="font-mono">{order.customer_id}</span>} />
                            <InfoRow label="Trạng thái đơn" value={<span className={`font-bold uppercase text-xs px-2 py-1 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>} />
                        </section>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <section className="bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200 shadow-md">
                            <h3 className="flex items-center text-lg font-bold text-orange-600 mb-4 pb-2 border-b border-indigo-300">
                                <CreditCard className="w-5 h-5 mr-2" />
                                Tóm tắt Thanh toán
                            </h3>
                            <InfoRow label="Tổng Giá trị Sản phẩm" value={formatCurrency(order.total_amount)} />
                            <InfoRow label="Phí Vận chuyển" value={<span className="text-green-600 font-semibold">Miễn phí</span>} />
                            <div className="pt-4 mt-4 border-t-2 border-indigo-300">
                                <InfoRow label="TỔNG THANH TOÁN" value={<span className="text-2xl font-extrabold text-indigo-900">{formatCurrency(order.total_amount)}</span>} />
                                <InfoRow label="Phương thức" value={<span className="font-medium text-gray-800">{order.payment_method.replace('_', ' ')}</span>} />
                                <InfoRow label="Trạng thái TT" value={<span className={`font-bold uppercase text-xs px-2 py-1 rounded-full ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{order.payment_status}</span>} />
                            </div>
                        </section>
                    </div>
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            <ShoppingBag className="w-5 h-5 mr-2 text-orange-600" />
                            Sản phẩm Đã đặt ({order.items?.length ?? 0})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 rounded-lg border bg-white shadow-sm hover:border-indigo-400 transition duration-150">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">{item.product_name || `Sản phẩm ID: ${item.product_id}`}</p>
                                        <p className="text-xs text-gray-500 italic">
                                            @{item.store_name || `Cửa hàng ${item.store_id}`}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="font-bold text-sm text-gray-700">x{item.quantity}</p>
                                        <p className="text-xs text-indigo-600">{formatCurrency(item.price_at_order * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-gray-50 p-5 border-t border-gray-200 flex justify-end rounded-b-2xl">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}