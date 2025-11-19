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
import toast from "react-hot-toast"; // Cần thiết cho thông báo lỗi
import { getUserDetail } from "@/api/services/userService"; // ✅ IMPORT BẮT BUỘC
import { getStoreById } from "@/api/services/storeService"; // ✅ IMPORT BẮT BUỘC


interface RevenueData {
  month: string;
  revenue: number;
}
// Loại bỏ MappedStore vì chúng ta không cần danh sách stores nữa
// interface MappedStore { id?: number; name: string; } 
// Minimal interfaces (Giữ nguyên)
interface Order {
  status?: string;
  current_order?: {
    items?: Array<{
      product_name?: string;
      product_id?: number;
      quantity?: number;
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

// Loại bỏ import { getStores, Store } từ đây
// vì chúng ta chỉ cần getStoreById và không cần state stores[]


const DashboardPage = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  // ✅ NEW: Store ID đã lọc (cố định theo Admin)
  const [filteredStoreId, setFilteredStoreId] = useState<number | undefined>(undefined); 
  const [storeName, setStoreName] = useState<string>("Tất cả cửa hàng"); // Tên cửa hàng để hiển thị
  
  const router = useRouter();
  const ORDERS_ROUTE = "/admin/orders";
  const INVENTORY_ROUTE = "/admin/inventory";
  
  // ✅ LOẠI BỎ state stores và selectedStore (đã cố định)
  // const [stores, setStores] = useState<MappedStore[]>([]); 
  // const [selectedStore, setSelectedStore] = useState<string>(""); 
  
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: ""
  });
  const [isFiltering, setIsFiltering] = useState(false);

  // ✅ HÀM LẤY STORE ID TỪ ADMIN LOGIN (giống logic CreateImportRequestPage)
  const getAdminStoreContext = async () => {
    try {
      const adminId = Number(localStorage.getItem("adminID"));
      if (!adminId) {
        console.warn("Không tìm thấy adminID. Lọc toàn bộ.");
        return { storeId: undefined, name: "Tất cả cửa hàng" };
      }
      
      const user = await getUserDetail(adminId);
      const currentStoreId = user.store_id ?? undefined; 

      let name: string;
      if (currentStoreId) {
        try {
          // Lấy thông tin store → storeName
          const store = await getStoreById(currentStoreId); 
          name = store.store_name;
        } catch (err) {
          console.error(err);
          name = `Cửa hàng ID ${currentStoreId} (Không tải được tên)`;
          toast.error(`Không tải được tên cửa hàng ID ${currentStoreId}`);
        }
      } else {
        name = "Tất cả cửa hàng (Admin chưa gán store)";
        toast.error("Admin chưa được gán cửa hàng, đang lọc toàn bộ dữ liệu.");
      }
      
      setFilteredStoreId(currentStoreId);
      setStoreName(name);
      return { storeId: currentStoreId, name };
    } catch (err) {
      console.error("Lỗi khi lấy Store Context:", err);
      toast.error("Lỗi khi xác định cửa hàng Admin.");
      return { storeId: undefined, name: "Tất cả cửa hàng" };
    }
  };


  // ✅ CHỈNH SỬA: handleFilterChange giờ chỉ nhận ngày tháng, storeId là cố định
  const handleFilterChange = useCallback(async (filters: { startDate: string; endDate: string }) => {
    setDateFilter(filters);
    
    const storeIdToFilter = filteredStoreId;
    console.log("Bộ lọc:", { ...filters, storeId: storeIdToFilter });

    setIsFiltering(true);
    try {
      const [orderList, customerList, productList] = await Promise.all([
        (await import("@/api/services/orderService")).listOrderAll({
          start_date: filters.startDate,
          end_date: filters.endDate,
          // ✅ SỬ DỤNG store ID đã được khởi tạo
          store_id: storeIdToFilter 
        }),
        (await import("@/api/services/customerService")).getCustomers({
          start_date: filters.startDate,
          end_date: filters.endDate
        }),
        (await import("@/api/services/productApi")).getProducts({
          start_date: filters.startDate,
          end_date: filters.endDate
        })
      ]);
      setOrders(orderList.data);
      setCustomers(customerList);
      setProducts(productList);
    } catch (err) {
      console.error("Lỗi khi lọc dữ liệu:", err);
    } finally {
      setIsFiltering(false);
    }
  }, [filteredStoreId]); // Thêm filteredStoreId vào dependency

  // ✅ CHỈNH SỬA: loadData chỉ cần nhận ngày tháng và storeId từ state
  const loadData = async (initialStoreId?: number) => {
    const storeIdToUse = initialStoreId !== undefined ? initialStoreId : filteredStoreId;

    try {
      const currentFilter = dateFilter; // Dùng state dateFilter
      
      const [revenue, orderList, customerList, productList, inventoryList] = await Promise.all([
        // Truyền store_id và date vào getRevenueData
        getRevenueData({
          start_date: currentFilter.startDate,
          end_date: currentFilter.endDate,
          store_id: storeIdToUse
        }),
        (await import("@/api/services/orderService")).listOrderAll({
          start_date: currentFilter.startDate,
          end_date: currentFilter.endDate,
          // ✅ SỬ DỤNG storeIdToUse
          store_id: storeIdToUse 
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

      setRevenueData(revenue);
      setOrders(orderList.data);
      setCustomers(customerList);
      setProducts(productList);
      setInventories(inventoryList.data || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
    }
  };


  // Fetch dữ liệu
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // ✅ Khởi tạo Store ID & Name
        const { storeId: initialStoreId } = await getAdminStoreContext(); 
        
        await loadData(initialStoreId);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // LOẠI BỎ useEffect gọi fetchStores()


  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Đang tải dữ liệu dashboard...</div>;
  }

  // 📊 Tổng hợp dữ liệu cho DashboardSummary
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(u => u.is_active || u.active).length;
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => (p.stock || p.quantity || 0) > 0).length;

  // 🏆 Tính sản phẩm bán chạy (Giữ nguyên)
  const bestSeller = (() => {
    const productSales: Record<string, { name: string; totalSold: number }> = {};
    orders.forEach(order => {
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

  // 📈 Biểu đồ doanh thu (Giữ nguyên)
  const revenueChartData = revenueData.map(d => ({ name: d.month, revenue: d.revenue }));

  // 📦 Trạng thái đơn hàng (Giữ nguyên)
  const statusMap = orders.reduce((acc, o) => {
    const st = o.status || "UNKNOWN";
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const orderStatusData = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count: Number(count),
  }));

  // 🏆 Sản phẩm bán chạy (Giữ nguyên)
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
      <div className="bg-white rounded-2xl flex flex-wrap justify-center items-center gap-2 p-2 mb-4">
        {/* ✅ CHỈNH SỬA: DashboardFilter không cần stores props */}
        <DashboardFilter onFilterChange={handleFilterChange} />
        {isFiltering && (
          <div className="ml-2 text-sm text-blue-600">
            Đang lọc dữ liệu...
          </div>
        )}
        {/* ✅ HIỂN THỊ CỬA HÀNG ĐANG LỌC */}
        <div className="ml-2 text-sm font-semibold text-[#f97316]">
            Dữ liệu đang lọc cho: {storeName}
        </div>
      </div>

      {/* Tổng hợp thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <DashboardSummary
          revenue={totalRevenue}
          ordersLabel={`${deliveredOrders}/${totalOrders}`}
          customersLabel={`${activeCustomers}/${totalCustomers}`}
          productsLabel={`${inStockProducts}/${totalProducts}`}
          bestSeller={bestSeller?.name || "Không có dữ liệu"}
        />
      </div>

      {/* Biểu đồ doanh thu + trạng thái đơn hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow p-3 md:col-span-2">
          <div className="font-semibold text-lg mb-2 ml-4">Doanh số bán hàng</div>
          <RevenueChart data={revenueChartData} />
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