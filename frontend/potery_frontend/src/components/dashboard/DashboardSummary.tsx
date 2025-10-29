import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react"; // ✅ Icon từ lucide-react

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100">
    <div className="w-12 h-12 rounded-md bg-indigo-50 flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-lg font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

interface DashboardSummaryProps {
  revenue: number;
  ordersLabel: string;
  customersLabel: string;
  productsLabel: string;
  bestSeller: string;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  revenue,
  ordersLabel,
  customersLabel,
  productsLabel,
  bestSeller,
}) => {
  const cards = [
    {
      title: "Tổng doanh thu bán hàng",
      value: revenue.toLocaleString() + " ₫",
      icon: <DollarSign className="text-green-500 w-6 h-6" />,
    },
    {
      title: "Tổng đơn hàng đã giao",
      value: ordersLabel,
      icon: <ShoppingCart className="text-blue-500 w-6 h-6" />,
    },
    {
      title: "Tổng tk khách hàng hoạt động",
      value: customersLabel,
      icon: <Users className="text-purple-500 w-6 h-6" />,
    },
    {
      title: "Sản phẩm còn trong kho",
      value: productsLabel,
      icon: <Package className="text-orange-500 w-6 h-6" />,
      subtitle: bestSeller,
    },
  ];

  return (
    <>
      {cards.map((c, i) => (
        <div key={i}>
          <SummaryCard title={c.title} value={c.value} icon={c.icon} />
          {c.subtitle && (
            <div className="text-xs text-gray-400 mt-1">
              {/* Sản phẩm bán chạy: {c.subtitle} */}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default DashboardSummary;
