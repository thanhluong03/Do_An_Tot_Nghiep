import { OrderStatusChart } from "@/components/Charts/OrderStatusChart";
import { SalesOverTimeChart } from "@/components/Charts/SalesOverTimeChart";



export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
     {/* 1. Banner Chào mừng
      <WelcomeBanner name="Mai Ngọc" />

      {/* 2. Các Thẻ Thống kê Tổng quan (Stats Cards) */}
      {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Sales" 
          value="₫24,780,000" 
          change="+12.5%" 
          color="green" 
          iconType="sales"
        />
        <StatCard 
          title="Total Orders" 
          value="1,247" 
          change="+8.2%" 
          color="blue" 
          iconType="orders"
        />
        <StatCard 
          title="Total Customers" 
          value="2,847" 
          change="+15.3%" 
          color="purple" 
          iconType="customers"
        />
        <StatCard 
          title="Total Products" 
          value="247" 
          change="+5.7%" 
          color="orange" 
          iconType="products"
        />
      </div> */} 

      {/* 3. Biểu đồ và Trạng thái Đơn hàng */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Over Time Chart (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md">
          <SalesOverTimeChart /> 
        </div>
        
        {/* Order Status Chart (1/3) */}
        <div className="bg-white rounded-xl shadow-md">
          <OrderStatusChart />
        </div>
      </div>
      
      {/* 4. Các Phần Khác (Nếu có) */}
      {/* Bạn có thể tiếp tục thêm các component như Recent Orders, Product Ranking ở đây */}
      
    </div>
  );
}