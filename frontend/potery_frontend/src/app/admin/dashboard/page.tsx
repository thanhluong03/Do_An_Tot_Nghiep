"use client";
import React, { useEffect, useState } from "react";
import { getRevenueData } from "@/api/services/orderService";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import RevenueChart from "@/components/dashboard/RevenueChart";
import OrderStatusChart from "@/components/dashboard/OrderStatusChart";
import BestSellerChart from "@/components/dashboard/BestSellerChart";
import CustomerDemographicsChart from "@/components/dashboard/CustomerDemographicsChart";
import CustomerFeedbackGauge from "@/components/dashboard/CustomerFeedbackGauge";

interface RevenueData {
  month: string;
  revenue: number;
}

// Minimal interfaces for typing data returned from APIs
interface Order { status?: string }
interface User { is_active?: boolean; active?: boolean; age?: number }
interface Product { stock?: number; quantity?: number; name?: string }
interface Review { rating?: number }

const DashboardPage = () => {
  // State cho tất cả dữ liệu dashboard
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Fetch tất cả dữ liệu song song
        const [revenue, orderList, userList, productList] = await Promise.all([
          getRevenueData(),
          (await import("@/api/services/orderService")).listOrders({}),
          (await import("@/api/services/userService")).listUsers({}),
          (await import("@/api/services/productApi")).getProducts(),
        ]);
        setRevenueData(revenue);
        setOrders(orderList);
        setUsers(userList);
        setProducts(productList);
        // Fetch reviews cho feedback gauge
        // Lấy tất cả review cho feedback gauge (nếu cần, có thể truyền productId hoặc lấy toàn bộ)
        const allReviews = await (await import("@/api/modules/reviews")).reviewsApi.list("");
        setReviews(allReviews);
      } catch (err) {
        // Log the error for debugging; UI error handling can be added later
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Đang tải dữ liệu dashboard...</div>;
  }

  // Tổng hợp dữ liệu cho DashboardSummary
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const totalCustomers = users.length;
  const activeCustomers = users.filter(u => u.is_active || u.active).length;
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => (p.stock || p.quantity || 0) > 0).length;
  const bestSeller = products.length ? products.reduce((max, p) => ((p.quantity || 0) > ((max.quantity as number) || 0) ? p : max), products[0]) : null;

  // Map dữ liệu cho các biểu đồ
  // RevenueChart: map tháng và doanh thu
  const revenueChartData = revenueData.map(d => ({ name: d.month, revenue: d.revenue }));

  // OrderStatusChart: đếm số lượng theo trạng thái
  const statusMap = orders.reduce((acc, o) => {
    const st = (o as Order).status || 'UNKNOWN';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const orderStatusData = Object.entries(statusMap).map(([status, count]) => ({ status, count: Number(count) }));

  // BestSellerChart: lấy top 10 sản phẩm theo quantity
  const bestSellerData = products
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 10)
    .map(p => ({ name: p.name || '', value: p.quantity || 0 }));

  // CustomerDemographicsChart: nhóm theo độ tuổi (giả sử có trường age)
  const ageGroups = ["18-25", "26-35", "36-45", "46-55", "56+"];
  const ageMap = users.reduce((acc, u) => {
    const age = u.age || 0;
    let group = "56+";
    if (age < 18) group = "<18";
    else if (age <= 25) group = "18-25";
    else if (age <= 35) group = "26-35";
    else if (age <= 45) group = "36-45";
    else if (age <= 55) group = "46-55";
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const customerDemographicsData = ageGroups.map(group => ({ age: group, count: ageMap[group] || 0 }));

  // CustomerFeedbackGauge: tính tỷ lệ tích cực (rating >= 4), điểm trung bình, tổng số đánh giá
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter(r => (r.rating || 0) >= 4).length;
  const avgRating = totalReviews ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews) : 0;
  type FeedbackDatum = { name: string; value: number; fill?: string; avg: number; total: number };
  const feedbackGaugeData: FeedbackDatum[] = [{ name: "Phản hồi tích cực", value: Math.round((positiveReviews / (totalReviews || 1)) * 100), fill: "#22c55e", avg: avgRating, total: totalReviews }];

  return (
    <div className="bg-[#f7f8fa] min-h-screen p-6">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow flex flex-wrap items-center gap-4 p-6 mb-6 border border-gray-100">
        <DashboardFilter />
      </div>

      {/* Card thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardSummary
          revenue={totalRevenue}
          ordersLabel={`${deliveredOrders}/${totalOrders}`}
          customersLabel={`${activeCustomers}/${totalCustomers}`}
          productsLabel={`${inStockProducts}/${totalProducts}`}
          bestSeller={bestSeller?.name || "Không có dữ liệu"}
        />
      </div>

      {/* Biểu đồ doanh thu & trạng thái đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-3 border border-gray-100 flex flex-col justify-between md:col-span-2">
          <div className="font-semibold text-lg mb-2">Doanh số bán hàng</div>
          <RevenueChart data={revenueChartData} />
        </div>
        <div className="bg-white rounded-2xl shadow p-3 border border-gray-100 flex flex-col justify-between">
          <div className="font-semibold text-lg mb-2">Trạng thái đơn hàng</div>
          <OrderStatusChart data={orderStatusData} />
        </div>
      </div>

      {/* Sản phẩm bán chạy */}
      <div className="bg-white rounded-2xl shadow p-3 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-lg">Sản phẩm bán chạy</div>
          <div className="text-xs text-gray-400">Top 10</div>
        </div>
        <BestSellerChart data={bestSellerData} />
      </div>

      {/* Nhân khẩu khách hàng & Phản hồi khách hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex flex-col justify-between">
          <div className="font-semibold text-lg mb-2">Nhân khẩu khách hàng</div>
          <CustomerDemographicsChart data={customerDemographicsData} />
        </div>
        <div className="bg-white rounded-2xl shadow p-3 border border-gray-100 flex flex-col justify-between">
          <div className="font-semibold text-lg mb-2">Phản hồi của khách hàng</div>
          <CustomerFeedbackGauge data={feedbackGaugeData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
