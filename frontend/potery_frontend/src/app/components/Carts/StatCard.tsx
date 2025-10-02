import { DollarSign, ShoppingCart, Users, Package, LucideIcon } from 'lucide-react';
import React from 'react';

// Định nghĩa props
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
  iconType: 'sales' | 'orders' | 'customers' | 'products';
}

// Định nghĩa màu sắc và icons
const colorMap = {
  green: { text: 'text-green-500', bg: 'bg-green-500', bar: 'bg-green-500', iconBg: 'bg-green-100' },
  blue: { text: 'text-blue-500', bg: 'bg-blue-500', bar: 'bg-blue-500', iconBg: 'bg-blue-100' },
  purple: { text: 'text-purple-500', bg: 'bg-purple-500', bar: 'bg-purple-500', iconBg: 'bg-purple-100' },
  orange: { text: 'text-orange-500', bg: 'bg-orange-500', bar: 'bg-orange-500', iconBg: 'bg-orange-100' },
};

const iconMap: Record<StatCardProps['iconType'], LucideIcon> = {
  sales: DollarSign,
  orders: ShoppingCart,
  customers: Users,
  products: Package,
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, color, iconType }) => {
  const { text: textColor, bg: bgColor, bar: barColor, iconBg } = colorMap[color];
  const Icon = iconMap[iconType];

  return (
    <div className="bg-white p-5 rounded-xl shadow-md transition duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        {/* Change Percentage */}
        <span className={`text-xs font-semibold ${textColor}`}>{change}</span>
      </div>
      
      <div className="mt-3">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
      
      {/* Progress Bar (Mô phỏng) */}
      <div className="w-full h-1 mt-4 bg-gray-200 rounded-full">
        {/* Độ dài thanh bar có thể điều chỉnh theo giá trị thực tế */}
        <div className={`h-1 rounded-full ${barColor}`} style={{ width: '70%' }}></div> 
      </div>
    </div>
  );
}

export default StatCard;