"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook quan trọng để lấy URL hiện tại
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBox,
  faShoppingCart,
  faUsers,
  faStar,
  faChartLine,
  faChartBar,
  faCog,
  faLifeRing,
  faEnvelope,
  faPercent,
  faBullhorn,
  faStore,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// --- Định nghĩa Kiểu dữ liệu ---
interface MenuItem {
  name: string;
  icon: IconDefinition;
  count: number | string | null;
  href: string;
  // Bỏ trường 'active' tĩnh vì chúng ta sẽ tính toán nó động
  color?: string;
}

// --- Dữ liệu Menu (Giữ nguyên) ---
const mainMenuItems: MenuItem[] = [
  { name: "Dashboard", icon: faHome, count: null, href: "/admin/dashboard" },
  { name: "Product Management", icon: faBox, count: 247, href: "/admin/products", color: "bg-gray-100 text-gray-600" },
  { name: "Inventory", icon: faWarehouse, count: 1, href: "/admin/inventory", color: "bg-yellow-100 text-yellow-600" },
  { name: "Categories", icon: faStore, count: "4", href: "/admin/categories", color: "bg-green-100 text-green-600" },
  { name: "Stores", icon: faStore, count: "2", href: "/admin/stores", color: "bg-green-100 text-green-600" },
  { name: "Suppliers", icon: faUsers, count: "5", href: "/admin/supplier", color: "bg-green-100 text-green-600" },
  { name: "Orders", icon: faShoppingCart, count: 12, href: "/admin/orders", color: "bg-red-100 text-red-600" },
  { name: "Reviews", icon: faStar, count: 89, href: "/admin/reviews", color: "bg-yellow-100 text-yellow-600" },

];

const analyticItems: MenuItem[] = [
  { name: "Sales Analytics", icon: faChartLine, count: null, href: "/admin/analytics/sales" },
  { name: "Product Performance", icon: faChartBar, count: null, href: "/admin/analytics/products" },
  { name: "Customer Insights", icon: faUsers, count: null, href: "/admin/analytics/customers" },
];

const marketingItems: MenuItem[] = [
  { name: "Campaigns", icon: faBullhorn, count: null, href: "/admin/marketing/campaigns" },
  { name: "Promotions", icon: faPercent, count: null, href: "/admin/marketing/promotions" },
  { name: "Email Marketing", icon: faEnvelope, count: null, href: "/admin/marketing/email" },
];

const systemItems: MenuItem[] = [
  { name: "Settings", icon: faCog, count: null, href: "/admin/settings" },
  { name: "Support", icon: faLifeRing, count: null, href: "/admin/support" },
];

// --- Component SidebarItem đã sửa để nhận currentPath ---
const SidebarItem = ({ item, currentPath }: { item: MenuItem, currentPath: string }) => {
  
  const isActive = currentPath === item.href; 
  const activeClass = isActive
    ? "text-[#B95D26] font-semibold bg-orange-50" 
    : "text-gray-600 hover:bg-gray-100";

  return (
    <Link
      href={item.href}
      className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${activeClass}`}
    >
      <div className="flex items-center space-x-3">
        <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
        <span className="text-sm">{item.name}</span>
      </div>
      {item.count && (
        <span
          className={`px-2 py-0.5 text-xs rounded-full font-medium ${item.color || "bg-gray-100 text-gray-600"}`}
        >
          {item.count}
        </span>
      )}
      {/* Hiển thị chấm tròn màu cam khi mục đang hoạt động */}
      {isActive && <span className="w-2 h-2 rounded-full bg-[#B95D26] ml-2"></span>}
    </Link>
  );
};

// --- Component AdminSidebar đã sửa để lấy URL hiện tại ---
export default function AdminSidebar() {
  // Lấy đường dẫn URL hiện tại
  const pathname = usePathname(); 

  // Hàm helper để render nhóm menu
  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <div>
      <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem 
            key={item.name} 
            item={item} 
            currentPath={pathname} // Truyền pathname động vào component con
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-64 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 flex flex-col">
        <div className="flex items-center mb-1">
          <div className="w-9 h-9 bg-[#B95D26] flex items-center justify-center rounded-md mr-3">
            <FontAwesomeIcon icon={faHome} className="w-5 h-5 text-white" />
          </div>
          <div className="text-base font-bold text-gray-800">Tiệm Gốm Nhà Gạo</div>
        </div>
        <p className="text-xs text-gray-500 ml-12">Admin Dashboard</p>
      </div>

      {/* Menus */}
      <nav className="p-4 flex-1 space-y-6">
        {renderMenuSection("Main Menu", mainMenuItems)}
        {renderMenuSection("Analytics", analyticItems)}
        {renderMenuSection("Marketing", marketingItems)}
        {renderMenuSection("System", systemItems)}
      </nav>
    </div>
  );
}