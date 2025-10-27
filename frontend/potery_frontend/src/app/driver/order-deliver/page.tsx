"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DriverLayout } from '@/layouts/DriverLayout'; // Import layout mới
import {
  getOrdersForDriver,
  acceptOrder,
  rejectOrder,
  DriverLocation,
  DriverStatus,
} from '@/api/services/deliveryService';
import toast, { Toaster } from 'react-hot-toast';
import { Check, X, Package, Clock, MapPin, User, Phone, Truck, Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount));
};

const OrderCard = ({ assignment, onAccept, onReject, isProcessing }: {
  assignment: DriverLocation;
  onAccept: (orderId: number) => void;
  onReject: (orderId: number) => void;
  isProcessing: boolean;
}) => {
  const order = assignment.order;

  if (!order) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
        Lỗi: Không có thông tin chi tiết cho đơn hàng #{assignment.order_id}.
      </div>
    );
  }

  const isWaiting = assignment.driver_status === DriverStatus.WAITING_ACCEPT;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-lg text-indigo-700">Đơn hàng #{order.id}</h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isWaiting ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
          }`}>
          {isWaiting ? 'Chờ xác nhận' : 'Đang giao'}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-start text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span className="font-semibold">{order.customer_name}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{order.shipping_address}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          <span>{order.customer_phone || 'Chưa có SĐT'}</span>
        </div>
        <div className="pt-4 border-t mt-4 flex justify-between items-center">
          <span className="text-gray-500">Tổng tiền:</span>
          <span className="font-bold text-xl text-red-600">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>
      {isWaiting && (
        <div className="p-4 bg-gray-50 border-t grid grid-cols-2 gap-3">
          <button
            onClick={() => onReject(order.id)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-wait"
          >
            <X className="w-4 h-4" />
            Từ chối
          </button>
          <button
            onClick={() => onAccept(order.id)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 border border-green-700 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait"
          >
            <Check className="w-4 h-4" />
            Nhận đơn
          </button>
        </div>
      )}
    </div>
  );
};

function OrderDeliverContent() {
  const [assignments, setAssignments] = useState<DriverLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DriverStatus>(DriverStatus.WAITING_ACCEPT);
  const [driverId, setDriverId] = useState<number | null>(null);

  // Lấy ID tài xế từ localStorage sau khi component mount
  useEffect(() => {
    const roleId = localStorage.getItem('adminRoleId');
    if (roleId) {
      setDriverId(parseInt(roleId));
    }
  }, []);

  const fetchDriverOrders = useCallback(async () => {
    if (!driverId) {
      setError("Không thể xác thực tài xế. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getOrdersForDriver(Number(driverId), { status: activeTab });
      setAssignments(data);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [driverId, activeTab]);

  useEffect(() => {
    fetchDriverOrders();
  }, [fetchDriverOrders]);

  const handleAcceptOrder = async (orderId: number) => {
    if (!driverId) return;
    setIsProcessing(true);
    const promise = acceptOrder({ order_id: orderId });

    toast.promise(promise, {
      loading: 'Đang xử lý nhận đơn...',
      success: () => {
        // Tải lại danh sách sau khi thành công
        setAssignments(prev => prev.filter(a => a.order_id !== orderId));
        return 'Nhận đơn thành công!';
      },
      error: (err) => err.response?.data?.message || 'Nhận đơn thất bại!',
    }).finally(() => setIsProcessing(false));
  };

  const handleRejectOrder = async (orderId: number) => {
    if (!driverId) return;
    setIsProcessing(true);
    const promise = rejectOrder({ order_id: orderId });

    toast.promise(promise, {
      loading: 'Đang từ chối đơn hàng...',
      success: () => {
        // Tải lại danh sách sau khi thành công
        setAssignments(prev => prev.filter(a => a.order_id !== orderId));
        return 'Đã từ chối đơn hàng.';
      },
      error: (err) => err.response?.data?.message || 'Từ chối đơn hàng thất bại!',
    }).finally(() => setIsProcessing(false));
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý các đơn hàng được giao cho bạn.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab(DriverStatus.WAITING_ACCEPT)}
            className={cn(
              "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === DriverStatus.WAITING_ACCEPT
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Inbox className="mr-2 w-5 h-5" />
            <span>Đơn hàng mới</span>
          </button>
          <button
            onClick={() => setActiveTab(DriverStatus.ACCEPTED)}
            className={cn(
              "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === DriverStatus.ACCEPTED
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Truck className="mr-2 w-5 h-5" />
            <span>Đang giao</span>
          </button>
        </nav>
      </div>

      {loading && (
        <div className="text-center py-10">
          <Clock className="w-8 h-8 mx-auto animate-spin text-green-600" />
          <p className="mt-4 text-gray-500">Đang tải đơn hàng...</p>
        </div>
      )}

      {error && <p className="text-center text-red-600 py-10">{error}</p>}

      {!loading && !error && (
        assignments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <OrderCard
                key={assignment.id}
                assignment={assignment}
                onAccept={handleAcceptOrder}
                onReject={handleRejectOrder}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <Package className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Không có đơn hàng</h3>
            <p className="mt-2 text-gray-500">Hiện không có đơn hàng nào trong mục này.</p>
          </div>
        )
      )}
    </>
  );
}

export default function OrderDeliverPage() {
  return (
    <DriverLayout>
      <OrderDeliverContent />
    </DriverLayout>
  )
}
