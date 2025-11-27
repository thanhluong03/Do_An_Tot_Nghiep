"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getRevenueData, Order as ImportedOrder } from "@/api/services/orderService";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import RevenueChart from "@/components/dashboard/RevenueChart";
import OrderStatusChart from "@/components/dashboard/OrderStatusChart";
import BestSellerChart from "@/components/dashboard/BestSellerChart";
import { listInventories, Inventory } from "@/api/services/inventoryService";
import { useRouter } from "next/navigation";

interface RevenueData {
  month: string;
  revenue: number;
}
interface MappedStore {
  id: number; // Ensure id is always a number
  name: string;
}
// Minimal interfaces
interface Customer { is_active?: boolean; active?: boolean; age?: number }
interface Product { id?: number; stock?: number; quantity?: number; name?: string }

import { getStores, Store } from "@/api/services/storeService";





const DashboardPage = () => {
  // State cho tất cả dữ liệu dashboard
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ImportedOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [totalByStatus, setTotalByStatus] = useState<Record<string, number>>({});

  const router = useRouter();
  const ORDERS_ROUTE = "/admin/orders";
  const INVENTORY_ROUTE = "/admin/inventory";
  const [stores, setStores] = useState<MappedStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: ""
  });
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchStores = async () => {
    try {
      const storeList = await getStores(); // từ storeService
      const mappedStores = storeList.map(s => ({
        id: s.id || 0,
        name: s.store_name // map store_name -> name
      }));
      setStores(mappedStores);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cửa hàng:", err);
    }
  };

  // FILE 1: DashboardPage (Admin Tổng)

  const handleFilterChange = useCallback(async (filters: { storeId: number | string; startDate: string; endDate: string }) => {
    setSelectedStore(String(filters.storeId));
    setDateFilter({ startDate: filters.startDate, endDate: filters.endDate });
    console.log("Bộ lọc:", filters);

    setIsFiltering(true);
    try {
      const [orderResponse, customerList, productList, inventoryList] = await Promise.all([
        (await import("@/api/services/orderService")).listOrderAll({
          start_date: filters.startDate,
          end_date: filters.endDate,
          store_id: filters.storeId ? Number(filters.storeId) : undefined
        }),
        (await import("@/api/services/customerService")).getCustomers({
          start_date: filters.startDate,
          end_date: filters.endDate
        }),
        (await import("@/api/services/productApi")).getProducts({
          start_date: filters.startDate,
          end_date: filters.endDate
        }),
        listInventories({
          store_id: filters.storeId ? Number(filters.storeId) : undefined
        }),
      ]);

      setOrders(orderResponse.data);
      setTotalByStatus(orderResponse.totalByStatus || {});
      setCustomers(customerList);
      setProducts(productList);
      setInventories(inventoryList.data || []);

    } catch (err) {
      console.error("Lỗi khi lọc dữ liệu:", err);
    } finally {
      setIsFiltering(false);
    }
  }, []);
  const loadData = async (filters?: { storeId: string; startDate: string; endDate: string }) => {
    try {
      const currentFilter = filters || { storeId: selectedStore, ...dateFilter };

      const [orderResponse, customerList, productList, inventoryList] = await Promise.all([
        (await import("@/api/services/orderService")).listOrderAll({
          start_date: currentFilter.startDate,
          end_date: currentFilter.endDate,
          store_id: currentFilter.storeId ? Number(currentFilter.storeId) : undefined
        }),
        (await import("@/api/services/customerService")).getCustomers({
          start_date: currentFilter.startDate,
          end_date: currentFilter.endDate,
        }),
        (await import("@/api/services/productApi")).getProducts({
          start_date: currentFilter.startDate,
          end_date: currentFilter.endDate,
        }),

        listInventories({}),
      ]);

      setOrders(orderResponse.data);
      setTotalByStatus(orderResponse.totalByStatus || {});
      setCustomers(customerList);
      setProducts(productList);
      setInventories(inventoryList.data || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadData();
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }

    })();
  }, []);
  useEffect(() => {
    fetchStores();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Đang tải dữ liệu dashboard...</div>;
  }

  // Calculate sales revenue from all statuses except cancelled
  const totalSalesRevenue = Object.entries(totalByStatus)
    .filter(([status]) => !['CANCELLED', 'REJECTED'].includes(status))
    .reduce((sum, [, amount]) => sum + amount, 0);

  // Generate revenue chart data from orders instead of API
  const generateRevenueChartData = () => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const revenueMap = new Map<string, number>();

    // Process orders to calculate revenue by month
    orders.forEach(order => {
      // Get total amount from either direct property or current_order
      const totalAmount = order.total_amount || order.current_order?.total_amount;

      if (!['CANCELLED', 'REJECTED'].includes(order.status || '') && totalAmount) {
        const orderDate = new Date(order.order_date);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth();
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

        const prev = revenueMap.get(monthKey) || 0;
        const amount = typeof totalAmount === 'string'
          ? parseFloat(totalAmount)
          : Number(totalAmount);
        revenueMap.set(monthKey, prev + amount);
      }
    });

    // Generate 12 months data for current year
    const currentYear = new Date().getFullYear();
    const chartData = [];

    for (let i = 0; i < 12; i++) {
      const monthKey = `${currentYear}-${i.toString().padStart(2, '0')}`;
      const revenue = revenueMap.get(monthKey) || 0;

      chartData.push({
        name: monthNames[i],
        revenue: revenue
      });
    }

    return chartData;
  };

  const chartRevenueData = generateRevenueChartData();
  const chartTotalRevenue = chartRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;
  // const totalCustomers = customers.length;
  // const activeCustomers = customers.filter(u => u.is_active || u.active).length;
  let totalCustomersForStore = 0;

  if (selectedStore) {
    // TRƯỜNG HỢP 1: Đang chọn một cửa hàng cụ thể
    // Logic: Chỉ đếm những khách đã mua hàng có chứa sản phẩm thuộc store_id đó
    const uniqueCustomerIds = new Set<number>();
    orders.forEach(order => {
      const items = order.current_order?.items || [];
      const hasStoreItem = items.some(item => item.store_id === Number(selectedStore));

      if (hasStoreItem && order.current_order?.customer_id) {
        uniqueCustomerIds.add(order.current_order.customer_id);
      }
    });
    totalCustomersForStore = uniqueCustomerIds.size;
  } else {
    // TRƯỜNG HỢP 2: Chọn "Tất cả cửa hàng"
    // Logic: Lấy tổng số khách hàng mà API getCustomers trả về (đã được lọc theo ngày)
    totalCustomersForStore = customers.length;
  }

  // 📦 TÍNH TOÁN SỐ SẢN PHẨM TỒN KHO (Tiện thể sửa luôn cho logic đồng bộ)
  const totalProducts = products.length; // Tổng mẫu mã
  let inStockProducts = 0;

  if (selectedStore) {
    // Nếu chọn cửa hàng: Đếm dựa trên danh sách kho của cửa hàng đó
    inStockProducts = inventories.filter(p => (p.quantity_stock || 0) > 0).length;
  } else {
    // Nếu chọn tất cả: Đếm dựa trên danh sách sản phẩm tổng
    inStockProducts = products.filter(p => (p.stock || p.quantity || 0) > 0).length;
  }

  // const totalProducts = products.length;
  // const inStockProducts = products.filter(p => (p.stock || p.quantity || 0) > 0).length;

  // 🏆 Tính sản phẩm bán chạy từ orders trong khoảng ngày
  const bestSeller = (() => {
    const productSales: Record<string, { name: string; totalSold: number }> = {};

    orders.forEach(order => {
      // Kiểm tra current_order.items hoặc items trực tiếp
      const items = order.current_order?.items || order.items || [];
      items.forEach((item) => {
        const productName = item.product_name || `Sản phẩm ${item.product_id}`;
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, totalSold: 0 };
        }
        productSales[productName].totalSold += item.quantity || 0;
      });
    });

    const topProduct = Object.values(productSales).reduce((max, product) =>
      product.totalSold > max.totalSold ? product : max,
      { name: "Không có dữ liệu", totalSold: 0 }
    );

    return topProduct.totalSold > 0 ? topProduct : null;
  })();

  // 📈 Biểu đồ doanh thu (sử dụng dữ liệu đã tính từ orders)
  const revenueChartData = chartRevenueData;

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

  // 🏆 Sản phẩm bán chạy từ orders trong khoảng ngày đã chọn
  const bestSellerData = (() => {
    const productSales: Record<string, { name: string; value: number }> = {};

    orders.forEach(order => {
      const items = order.current_order?.items || order.items || [];
      items.forEach((item) => {
        const productName = item.product_name || `Sản phẩm ${item.product_id}`;
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, value: 0 };
        }
        productSales[productName].value += item.quantity || 0;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();


  return (
    <div className="bg-[#F3F4F6] min-h-screen p-1">
      {/* Banner chào mừng */}
      <div
        className="rounded-xl p-8 md:p-12 text-white shadow-xl mb-3 "
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
      <div className="bg-white rounded-2xl flex flex-wrap justify-center gap-2 p-2 mb-4">
        <DashboardFilter stores={stores} onFilterChange={handleFilterChange} />
        {isFiltering && (
          <div className="ml-2 text-sm text-blue-600">
            Đang lọc dữ liệu...
          </div>
        )}
      </div>

      {/* Tổng hợp thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <DashboardSummary
          revenue={totalSalesRevenue}
          ordersLabel={`${deliveredOrders}/${totalOrders}`}
          customersLabel={`${totalCustomersForStore}`}
          productsLabel={`${inStockProducts}/${totalProducts}`}
          bestSeller={bestSeller?.name || "Không có dữ liệu"}
        />
      </div>

      {/* Biểu đồ doanh thu + trạng thái đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow p-3 md:col-span-2">
          <div className="flex justify-between items-center mb-3 px-4">
            <div className="font-semibold text-lg">Doanh số bán hàng</div>
          </div>
          <RevenueChart data={revenueChartData} />

          {/* Tổng tiền theo trạng thái đơn hàng */}
          <div className="mt-4 px-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Chi tiết doanh thu:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {(() => {
                // Move 'CANCELLED' to the end
                const entries = Object.entries(totalByStatus);
                const cancelled = entries.filter(([status]) => status === 'CANCELLED');
                const others = entries.filter(([status]) => status !== 'CANCELLED');
                const ordered = [...others, ...cancelled];
                return ordered.map(([status, amount]) => {
                  const statusLabel = {
                    'CREATED': 'Chờ xác nhận',
                    'CONFIRMED': 'Đã xác nhận',
                    'SHIPPING': 'Đang vận chuyển',
                    'DELIVERED': 'Đã giao thành công',
                    'CANCELLED': 'Đã hủy',
                    'REJECTED': 'Bị từ chối',
                    'EXCHANGED': 'Đã đổi trả',
                    'RETURN_REQUESTED': 'Đang yêu cầu hoàn trả'
                  }[status] || status;

                  const isPositive = !['CANCELLED', 'REJECTED'].includes(status);
                  return (
                    <div key={status} className={`p-2 rounded-lg border ${isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                      <div className="text-xs text-gray-600">{statusLabel}</div>
                      <div className={`font-semibold ${isPositive ? 'text-green-700' : 'text-red-700'
                        }`}>
                        {amount.toLocaleString()} ₫
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-3 border border-gray-100">
          <div className="font-semibold text-lg mb-2 ml-4">Trạng thái đơn hàng</div>
          <OrderStatusChart data={orderStatusData} />
        </div>
      </div>

      {/* Biểu đồ sản phẩm bán chạy */}
      <div className="bg-white rounded-2xl shadow p-3 mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-lg ml-4">Sản phẩm bán chạy</div>
          <div className="text-xs text-gray-400">Top 10</div>
        </div>
        <BestSellerChart data={bestSellerData} />
      </div>
    </div>
  );
};

export default DashboardPage;
