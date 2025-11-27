"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Order as ImportedOrder } from "@/api/services/orderService";
import DashboardFilter from "@/components/adminStore/DashboardFilter";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import RevenueChart from "@/components/dashboard/RevenueChart";
import OrderStatusChart from "@/components/dashboard/OrderStatusChart";
import BestSellerChart from "@/components/dashboard/BestSellerChart";
import { listInventories, Inventory } from "@/api/services/inventoryService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// IMPORT BẮT BUỘC
import { getUserDetail } from "@/api/services/userService";
import { getStoreById } from "@/api/services/storeService";

// IMPORT API LẤY ORDERS THEO STORE
import { listOrdersByStore } from "@/api/services/orderService";

interface Product { id?: number; stock?: number; quantity?: number; name?: string }

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ImportedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [totalByStatus, setTotalByStatus] = useState<Record<string, number>>({});

  const [filteredStoreId, setFilteredStoreId] = useState<number | undefined>(undefined);
  const [storeName, setStoreName] = useState<string>("Tất cả cửa hàng");

  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: ""
  });

  const [isFiltering, setIsFiltering] = useState(false);

  const router = useRouter();
  const ORDERS_ROUTE = "/adminstore/orders";
  const INVENTORY_ROUTE = "/adminstore/inventory";

  // 🔥 Lấy store của admin đang login
  const getAdminStoreContext = async () => {
    try {
      const adminId = Number(localStorage.getItem("adminID"));

      if (!adminId) {
        return { storeId: undefined, name: "Tất cả cửa hàng" };
      }

      const user = await getUserDetail(adminId);
      const storeId = user.store_id ?? undefined;

      let storeName = "Tất cả cửa hàng";

      if (storeId) {
        try {
          const store = await getStoreById(storeId);
          storeName = store.store_name;
        } catch {
          storeName = `Cửa hàng ID ${storeId}`;
        }
      }

      setFilteredStoreId(storeId);

      setStoreName(storeName);

      return { storeId, name: storeName };
    } catch (err) {
      console.error(err);
      return { storeId: undefined, name: "Tất cả cửa hàng" };
    }
  };

  // 🔥 Lọc theo ngày + store cố định
  const handleFilterChange = useCallback(
    async (filters: { startDate: string; endDate: string }) => {
      setDateFilter(filters);
      setIsFiltering(true);

      try {
        const orderResponse = await (await import("@/api/services/orderService")).listOrders({
          start_date: filters.startDate,
          end_date: filters.endDate,
          store_id: filteredStoreId,
          size: 1000
        });
        setOrders(orderResponse.data);
        setTotalByStatus(orderResponse.totalByStatus || {});

        const [productList] = await Promise.all([
          (await import("@/api/services/productApi")).getProducts({
            start_date: filters.startDate,
            end_date: filters.endDate
          })
        ]);

        setProducts(productList);
      } catch (err) {
        console.error("Lỗi Filter:", err);
      } finally {
        setIsFiltering(false);
      }
    },
    [filteredStoreId]
  );

  // 🔥 Load lần đầu
  const loadData = async (initialStoreId?: number) => {
    const storeIdToUse = initialStoreId ?? filteredStoreId ?? 0;

    try {
      const currentFilter = dateFilter;

      const orderResponse = await (await import("@/api/services/orderService")).listOrders({
        start_date: currentFilter.startDate,
        end_date: currentFilter.endDate,
        store_id: storeIdToUse,
        size: 1000
      });

      const [productList] = await Promise.all([
        (await import("@/api/services/productApi")).getProducts({}),
        listInventories({})
      ]);
      const inventoryList = await listInventories({ store_id: storeIdToUse });

      setOrders(orderResponse.data);
      setTotalByStatus(orderResponse.totalByStatus || {});
      setProducts(productList);
      setInventories(inventoryList.data || []);
    } catch (err) {
      console.error("Lỗi load dashboard:", err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { storeId } = await getAdminStoreContext();
      await loadData(storeId);
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Đang tải dữ liệu dashboard...</div>;
  }

  // ----------------------------------------------
  // 🔥 TÍNH TOÁN DASHBOARD
  // ----------------------------------------------

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

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;

  const uniqueCustomerIds = new Set<number>();

  orders.forEach(order => {
    const items = order.current_order?.items || [];
    const hasStoreItem = items.some(item => item.store_id === filteredStoreId);
    if (hasStoreItem && order.current_order?.customer_id) {
      uniqueCustomerIds.add(order.current_order.customer_id);
    }
  });

  const totalCustomersForStore = uniqueCustomerIds.size;

  const totalProducts = products.length;
  //const inStockProducts = products.filter(p => (p.stock || p.quantity || 0) > 0).length;

  const storeInventories = inventories.filter(inv => inv.store_id === filteredStoreId);

  // Lấy số sản phẩm còn tồn kho
  const inStockProducts = storeInventories.filter(inv => (inv.quantity_stock || 0) > 0).length;
  // Best seller
  const bestSeller = (() => {
    const sales: Record<string, { name: string; totalSold: number }> = {};
    orders.forEach(order => {
      const items = order.current_order?.items || order.items || [];
      items.forEach(it => {
        const name = it.product_name || `SP ${it.product_id}`;
        if (!sales[name]) sales[name] = { name, totalSold: 0 };
        sales[name].totalSold += it.quantity || 0;
      });
    });
    const top = Object.values(sales).sort((a, b) => b.totalSold - a.totalSold)[0];
    return top || null;
  })();

  const revenueChartData = chartRevenueData;

  const statusMap = orders.reduce((acc, o) => {
    const s = o.status || "UNKNOWN";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusData = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count
  }));

  const bestSellerData = (() => {
    const sales: Record<string, { name: string; value: number }> = {};
    orders.forEach(order => {
      const items = order.current_order?.items || order.items || [];
      items.forEach(it => {
        const name = it.product_name || `SP ${it.product_id}`;
        if (!sales[name]) sales[name] = { name, value: 0 };
        sales[name].value += it.quantity || 0;
      });
    });
    return Object.values(sales).sort((a, b) => b.value - a.value).slice(0, 10);
  })();

  // ----------------------------------------------
  // 🔥 RENDER
  // ----------------------------------------------

  return (
    <div className="bg-[#F3F4F6] min-h-screen p-1">

      {/* Banner */}
      <div
        className="rounded-xl p-8 md:p-12 text-white shadow-xl mb-3"
        style={{ background: "linear-gradient(135deg, #f97316, #e47e3f)" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Chi nhánh cửa hàng : {storeName}
        </h1>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push(ORDERS_ROUTE)}
            className="px-6 py-3 bg-white text-[#f97316] font-semibold rounded-lg shadow-md"
          >
            Xem đơn hàng mới
          </button>

          <button
            onClick={() => router.push(INVENTORY_ROUTE)}
            className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            Quản lý kho
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl flex flex-wrap justify-center items-center gap-2 p-2 mb-4">
        <DashboardFilter onFilterChange={handleFilterChange} />
        {isFiltering && <div className="text-blue-600 text-sm">Đang lọc...</div>}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <DashboardSummary
          revenue={totalSalesRevenue}
          ordersLabel={`${deliveredOrders}/${totalOrders}`}
          customersLabel={`${totalCustomersForStore}`}
          productsLabel={`${inStockProducts}/${totalProducts}`}
          bestSeller={bestSeller?.name || "Không có"}
        />
      </div>

      {/* Revenue + Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
          <div className="flex justify-between items-center mb-3 px-4">
            <div className="font-semibold text-lg">Doanh số</div>
          </div>
          <RevenueChart data={revenueChartData} />

          {/* Tổng tiền theo trạng thái đơn hàng */}
          <div className="mt-4 px-3">
            <div className="text-sm font-medium text-gray-700 mb-3">Chi tiết doanh thu:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[...Object.entries(totalByStatus)
                .filter(([status]) => status !== 'CANCELLED')
                .concat(Object.entries(totalByStatus).filter(([status]) => status === 'CANCELLED'))
              ].map(([status, amount]) => {
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
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="font-semibold text-lg mb-2 ml-3">Trạng thái đơn hàng</div>
          <OrderStatusChart data={orderStatusData} />
        </div>
      </div>

      {/* Best seller */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex justify-between">
          <div className="font-semibold text-lg ml-3">Sản phẩm bán chạy</div>
          <div className="text-xs text-gray-400">Top 10</div>
        </div>

        <BestSellerChart data={bestSellerData} />
      </div>

    </div>
  );
};

export default DashboardPage;
