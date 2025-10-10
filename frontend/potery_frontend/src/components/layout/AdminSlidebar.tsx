"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    faList,
    faBolt,
    faNewspaper,
    faTruck, // Thêm icon cho Supplier/Logistics
    faTags,
    faUserShield,
    faUser, // Thêm icon cho Promotions/Marketing
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// --- Định nghĩa Kiểu dữ liệu ---
interface MenuItem {
    name: string;
    icon: IconDefinition;
    href: string;
    color?: string;
}

// Lấy icon mới để tránh trùng lặp:
const faTagsIcon = faTags;
const faTruckIcon = faTruck;
const faChartArea = faChartLine; // Đổi tên biến để dễ đọc

// --- Dữ liệu Menu ĐÃ PHÂN CHIA LẠI ---

// 1. DASHBOARD
const dashboardItems: MenuItem[] = [
    { name: "Dashboard", icon: faHome, href: "/admin/dashboard" },
];

// 2. QUẢN LÝ BÁN HÀNG & VẬN HÀNH (Sales & Operations)
const salesOperationsItems: MenuItem[] = [
   { name: "Nhập kho", icon: faWarehouse, href: "/admin/importproduct", color: "bg-yellow-100 text-yellow-600" },
    { name: "Tồn kho", icon: faWarehouse, href: "/admin/inventory", color: "bg-yellow-100 text-yellow-600" },
    { name: "Cửa hàng", icon: faStore, href: "/admin/stores", color: "bg-green-100 text-green-600" },
    { name: "Nhà cung cấp", icon: faTruckIcon, href: "/admin/supplier", color: "bg-blue-100 text-blue-600" }, // Dùng icon Truck
    { name: "Đơn hàng", icon: faShoppingCart, href: "/admin/orders", color: "bg-red-100 text-red-600" },
];

// 3. QUẢN LÝ NỘI DUNG & TÀI NGUYÊN (Content & Resources)
const contentResourcesItems: MenuItem[] = [
    { name: "Quản lý sản phẩm", icon: faBox, href: "/admin/products", color: "bg-gray-100 text-gray-600" },
    { name: "Danh mục", icon: faList, href: "/admin/categories", color: "bg-green-100 text-green-600" },
    { name: "Tin tức/Bài viết", icon: faNewspaper, href: "/admin/news", color: "bg-red-100 text-red-600" },
    { name: "Đánh giá", icon: faStar, href: "#", color: "bg-yellow-100 text-yellow-600" },
];

// 4. MARKETING & PHÂN TÍCH (Marketing & Analytics)
const marketingAnalyticsItems: MenuItem[] = [
    // Marketing
    { name: "Promotions", icon: faTagsIcon, href: "/admin/promotions", color: "bg-red-100 text-red-600" }, // Dùng icon Tags
    { name: "Vouchers", icon: faBolt, href: "/admin/vouchers", color: "bg-orange-100 text-orange-600" },
    // Analytics
    { name: "Sales Analytics", icon: faChartArea, href: "#" },
    { name: "Product Performance", icon: faChartBar, href: "#" },
];

// 5. CẤU HÌNH HỆ THỐNG (System)
const systemItems: MenuItem[] = [
    { name: "Roles", icon: faUserShield, href: "/admin/roles" },
    { name: "Permissions", icon: faUserShield, href: "/admin/permissions" },
    { name: "Users", icon: faUser, href: "/admin/users" },
];


// --- Component SidebarItem (Giữ nguyên) ---
const SidebarItem = ({ item, currentPath }: { item: MenuItem, currentPath: string }) => {
    
    // Sử dụng logic so khớp URL linh hoạt hơn: Kiểm tra xem URL hiện tại CÓ BẮT ĐẦU bằng item.href không
    const isActive = currentPath === item.href || (currentPath.startsWith(item.href + '/') && item.href !== '/admin/dashboard'); 
    
    // Đặt màu cam (#B95D26) làm màu chủ đạo
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
           
            {/* Hiển thị chấm tròn màu cam khi mục đang hoạt động */}
            {isActive && <span className="w-2 h-2 rounded-full bg-[#B95D26] ml-2"></span>}
        </Link>
    );
};

// --- Component AdminSidebar (Đã cập nhật) ---
export default function AdminSidebar() {
    // Lấy đường dẫn URL hiện tại
    const pathname = usePathname(); 

    // Hàm helper để render nhóm menu
    const renderMenuSection = (title: string, items: MenuItem[]) => (
        <div>
            <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2 mt-4 first:mt-0">{title}</h3>
            <div className="space-y-1">
                {items.map((item) => (
                    <SidebarItem 
                        key={item.name} 
                        item={item} 
                        currentPath={pathname}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-64 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-gray-200 shadow-md">
            {/* Logo */}
            <div className="p-4 flex flex-col border-b border-gray-100">
                <div className="flex items-center mb-1">
                    <div className="w-9 h-9 bg-[#B95D26] flex items-center justify-center rounded-md mr-3 shadow-sm">
                        <FontAwesomeIcon icon={faHome} className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-base font-bold text-gray-800">Tiệm Gốm Nhà Gạo</div>
                </div>
                <p className="text-xs text-gray-500 ml-12">Admin Dashboard</p>
            </div>

            {/* Menus */}
            <nav className="p-4 flex-1 space-y-4">
                {renderMenuSection("Tổng Quan", dashboardItems)}
                {renderMenuSection("Quản Lý Vận Hành", salesOperationsItems)}
                {renderMenuSection("Quản Lý Nội Dung", contentResourcesItems)}
                {renderMenuSection("Marketing & Phân Tích", marketingAnalyticsItems)}
                {renderMenuSection("Hệ Thống", systemItems)}
            </nav>
        </div>
    );
}