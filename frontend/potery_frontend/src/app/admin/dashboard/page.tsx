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
import { listInventories, Inventory } from "@/api/services/inventoryService";

import { useRouter } from "next/navigation";

interface RevenueData {
  month: string;
  revenue: number;
}

// Minimal interfaces
interface Order { status?: string }
interface User { is_active?: boolean; active?: boolean; age?: number }
interface Product { id?: number; stock?: number; quantity?: number; name?: string }
interface Review { rating?: number }

const DashboardPage = () => {
  // State cho tất cả dữ liệu dashboard
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  const router = useRouter();
  const ORDERS_ROUTE = "/admin/orders";
  const INVENTORY_ROUTE = "/admin/inventory";

  const [selectedStore, setSelectedStore] = useState<string>("");

  const handleFilterChange = (filters: { storeId: string }) => {
    setSelectedStore(filters.storeId);
    console.log("Cửa hàng được chọn:", filters.storeId);
  };

  // Fetch dữ liệu
  useEffect(() => {
    (async () => {
      try {
        const [revenue, orderList, userList, productList, inventoryList] = await Promise.all([
          getRevenueData(),
          (await import("@/api/services/orderService")).listOrders({}),
          (await import("@/api/services/userService")).listUsers({}),
          (await import("@/api/services/productApi")).getProducts(),
          listInventories({}),
        ]);

        setRevenueData(revenue);
        setOrders(orderList.data);
        setUsers(userList);
        setProducts(productList);
        setInventories(inventoryList.data || []);

        // const allReviews = await (await import("@/api/modules/reviews")).reviewsApi.list("");
        // setReviews(allReviews);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
      
    })();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Đang tải dữ liệu dashboard...</div>;
  }

  // 📊 Tổng hợp dữ liệu cho DashboardSummary
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;
  const totalCustomers = users.length;
  const activeCustomers = users.filter(u => u.is_active || u.active).length;
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => (p.stock || p.quantity || 0) > 0).length;
  const bestSeller = products.length
    ? products.reduce((max, p) => ((p.quantity || 0) > ((max.quantity as number) || 0) ? p : max), products[0])
    : null;

  // 📈 Biểu đồ doanh thu
  const revenueChartData = revenueData.map(d => ({ name: d.month, revenue: d.revenue }));

  // 📦 Trạng thái đơn hàng
  const statusMap = orders.reduce((acc, o) => {
    const st = o.status || "UNKNOWN";
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const orderStatusData = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count: Number(count),
  }));

  // 🏆 Sản phẩm bán chạy theo quantity_sold trong inventory
  const productSalesMap = inventories.reduce((acc, inv) => {
    acc[inv.product_id] = (acc[inv.product_id] || 0) + (inv.quantity_sold || 0);
    return acc;
  }, {} as Record<number, number>);

  const bestSellerData = products
    .map(p => ({
      name: p.name || "",
      value: productSalesMap[p.id || 0] || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // 👥 Nhân khẩu khách hàng
  const ageGroups = ["<18", "18-25", "26-35", "36-45", "46-55", "56+"];
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
  const customerDemographicsData = ageGroups.map(group => ({
    age: group,
    count: ageMap[group] || 0,
  }));

  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter(r => (r.rating || 0) >= 4).length;
  const avgRating = totalReviews
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
    : 0;
  type FeedbackDatum = { name: string; value: number; fill?: string; avg: number; total: number };
  const feedbackGaugeData: FeedbackDatum[] = [
    {
      name: "Phản hồi tích cực",
      value: Math.round((positiveReviews / (totalReviews || 1)) * 100),
      fill: "#22c55e",
      avg: avgRating,
      total: totalReviews,
    },
  ];

  return (
    <div className="bg-[#f7f8fa] min-h-screen p-6">
      {/* Banner chào mừng */}
      <div
        className="rounded-xl p-8 md:p-12 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #f97316, #e47e3f)" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          Chào mừng trở lại,{" "}<span>{localStorage.getItem("adminName") || "Quản trị viên"}</span>!
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(ORDERS_ROUTE)}
            className="px-6 py-3 bg-white text-[#f97316] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-150 ease-in-out whitespace-nowrap"
          >
            Xem đơn hàng mới
          </button>
          <button
            onClick={() => router.push(INVENTORY_ROUTE)}
            className="px-6 py-3 border-2 border-white border-opacity-40 text-white font-semibold rounded-lg transition duration-150 ease-in-out whitespace-nowrap"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          >
            Quản lý kho
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl shadow flex flex-wrap items-center gap-4 p-6 mb-6 border border-gray-100">
        <DashboardFilter onFilterChange={handleFilterChange} />
      </div>

      {/* Tổng hợp thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardSummary
          revenue={totalRevenue}
          ordersLabel={`${deliveredOrders}/${totalOrders}`}
          customersLabel={`${activeCustomers}/${totalCustomers}`}
          productsLabel={`${inStockProducts}/${totalProducts}`}
          bestSeller={bestSeller?.name || "Không có dữ liệu"}
        />
      </div>

      {/* Biểu đồ doanh thu + trạng thái đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-3 border border-gray-100 md:col-span-2">
          <div className="font-semibold text-lg mb-2">Doanh số bán hàng</div>
          <RevenueChart data={revenueChartData} />
        </div>
        <div className="bg-white rounded-2xl shadow p-3 border border-gray-100">
          <div className="font-semibold text-lg mb-2">Trạng thái đơn hàng</div>
          <OrderStatusChart data={orderStatusData} />
        </div>
      </div>

      {/* Biểu đồ sản phẩm bán chạy */}
      <div className="bg-white rounded-2xl shadow p-3 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-lg">Sản phẩm bán chạy</div>
          <div className="text-xs text-gray-400">Top 10</div>
        </div>
        <BestSellerChart data={bestSellerData} />
      </div>

      {/* Nhân khẩu & Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="font-semibold text-lg mb-2">Nhân khẩu khách hàng</div>
          <CustomerDemographicsChart data={customerDemographicsData} />
        </div>
        <div className="bg-white rounded-2xl shadow p-3 border border-gray-100">
          <div className="font-semibold text-lg mb-2">Phản hồi của khách hàng</div>
          <CustomerFeedbackGauge data={feedbackGaugeData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
