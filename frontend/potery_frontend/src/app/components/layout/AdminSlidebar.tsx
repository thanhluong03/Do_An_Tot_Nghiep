"use client";

import Link from "next/link";
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
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface MenuItem {
  name: string;
  icon: IconDefinition;
  count: number | string | null;
  href: string;
  active: boolean;
  color?: string;
}

const mainMenuItems: MenuItem[] = [
  { name: "Dashboard", icon: faHome, count: null, href: "/dashboard", active: true },
  { name: "Product Management", icon: faBox, count: 247, href: "/admin/products", active: false, color: "bg-gray-100 text-gray-600" },
  { name: "Orders", icon: faShoppingCart, count: 12, href: "/admin/orders", active: false, color: "bg-red-100 text-red-600" },
  { name: "Customers", icon: faUsers, count: "1.2k", href: "/admin/customers", active: false, color: "bg-green-100 text-green-600" },
  { name: "Reviews", icon: faStar, count: 89, href: "/admin/reviews", active: false, color: "bg-yellow-100 text-yellow-600" },
];

const analyticItems: MenuItem[] = [
  { name: "Sales Analytics", icon: faChartLine, count: null, href: "/admin/analytics/sales", active: false },
  { name: "Product Performance", icon: faChartBar, count: null, href: "/admin/analytics/products", active: false },
  { name: "Customer Insights", icon: faUsers, count: null, href: "/admin/analytics/customers", active: false },
];

const marketingItems: MenuItem[] = [
  { name: "Campaigns", icon: faBullhorn, count: null, href: "/admin/marketing/campaigns", active: false },
  { name: "Promotions", icon: faPercent, count: null, href: "/admin/marketing/promotions", active: false },
  { name: "Email Marketing", icon: faEnvelope, count: null, href: "/admin/marketing/email", active: false },
];

const systemItems: MenuItem[] = [
  { name: "Settings", icon: faCog, count: null, href: "/admin/settings", active: false },
  { name: "Support", icon: faLifeRing, count: null, href: "/admin/support", active: false },
];

const SidebarItem = ({ item }: { item: MenuItem }) => {
  const activeClass = item.active
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
      {item.active && <span className="w-2 h-2 rounded-full bg-[#B95D26] ml-2"></span>}
    </Link>
  );
};

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-white border-r flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 flex flex-col border-b">
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
        <div>
          <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2">Main Menu</h3>
          <div className="space-y-1">
            {mainMenuItems.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2">Analytics</h3>
          <div className="space-y-1">
            {analyticItems.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2">Marketing</h3>
          <div className="space-y-1">
            {marketingItems.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2">System</h3>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
