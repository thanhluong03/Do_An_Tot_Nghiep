"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getRevenueData } from "@/api/services/orderService";
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

interface RevenueData {
  month: string;
  revenue: number;
}

interface Order {
  status?: string;
  current_order?: {
    customer_id?: number;
    items?: Array<{
      product_name?: string;
      product_id?: number;
      quantity?: number;
      store_id?: number;

    }>;
  };
  items?: Array<{
    product_name?: string;
    product_id?: number;
    quantity?: number;
  }>;
}

interface Customer { is_active?: boolean; active?: boolean; age?: number }
interface Product { id?: number; stock?: number; quantity?: number; name?: string }

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

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
        const ordersList = await listOrdersByStore(filteredStoreId ?? 0);
        setOrders(ordersList);



        const [customerList, productList] = await Promise.all([
          (await import("@/api/services/customerService")).getCustomers({
            start_date: filters.startDate,
            end_date: filters.endDate
          }),
          (await import("@/api/services/productApi")).getProducts({
            start_date: filters.startDate,
            end_date: filters.endDate
          })
        ]);

        setOrders(ordersList);
        setCustomers(customerList);
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

      const revenue = await getRevenueData({
        start_date: currentFilter.startDate,
        end_date: currentFilter.endDate,
        store_id: storeIdToUse
      });

      const ordersList = await listOrdersByStore(storeIdToUse);

      const [customerList, productList] = await Promise.all([
        (await import("@/api/services/customerService")).getCustomers({}),
        (await import("@/api/services/productApi")).getProducts({}),
        listInventories({})
      ]);
      const inventoryList = await listInventories({ store_id: storeIdToUse });

      setRevenueData(revenue);
      setOrders(ordersList);
      setCustomers(customerList);
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
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Đang tải dữ liệu dashboard...</div>;
  }

  // ----------------------------------------------
  // 🔥 TÍNH TOÁN DASHBOARD
  // ----------------------------------------------

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(u => u.is_active || u.active).length;
  
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

  const revenueChartData = revenueData.map(d => ({ name: d.month, revenue: d.revenue }));

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
          revenue={totalRevenue}
          ordersLabel={`${deliveredOrders}/${totalOrders}`}
          customersLabel={`${totalCustomersForStore}`}
          productsLabel={`${inStockProducts}/${totalProducts}`}
          bestSeller={bestSeller?.name || "Không có"}
        />
      </div>

      {/* Revenue + Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
          <div className="font-semibold text-lg mb-2 ml-3">Doanh số</div>
          <RevenueChart data={revenueChartData} />
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
