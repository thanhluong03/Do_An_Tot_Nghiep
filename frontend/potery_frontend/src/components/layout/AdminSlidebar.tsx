"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faBox,
    faShoppingCart,
    faStar,
    faChartLine,
    faChartBar,
    faStore,
    faWarehouse,
    faList,
    faBolt,
    faNewspaper,
    faTruck,
    faTags,
    faUserShield, // Giữ lại icon này cho mục cha
    faUser,
    faChevronDown,
    faChevronUp,
    faGift,
    faUsersCog,
    faTruckArrowRight,
    faBoxesStacked,
    faClipboardList,
    faUserCheck, // 💡 Icon mới cho mục cha "Phân quyền/Tài khoản"
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface MenuItem {
    name: string;
    icon: IconDefinition;
    href?: string;
    color?: string;
    children?: MenuItem[];
}

const dashboardItems: MenuItem[] = [
    { name: "Dashboard", icon: faHome, href: "/admin/dashboard" },
];

const salesOperationsItems: MenuItem[] = [
    {
        name: "Kho hàng",
        icon: faWarehouse,
        children: [
            { name: "Nhập kho sản phẩm", icon: faTruckArrowRight, href: "/admin/importproduct" },
            { name: "Tồn kho cửa hàng", icon: faClipboardList, href: "/admin/inventory" },
        ],
    },
    { name: "Sản phẩm", icon: faBox, href: "/admin/products", color: "bg-blue-100 text-blue-600" },
     { name: "Test chat", icon: faBox, href: "/admin/conversation", color: "bg-blue-100 text-blue-600" },
    { name: "Danh mục", icon: faList, href: "/admin/categories", color: "bg-green-100 text-green-600" },
    { name: "Cửa hàng", icon: faStore, href: "/admin/stores", color: "bg-green-100 text-green-600" },
];

const orderItems: MenuItem[] = [
    { name: "Đơn hàng", icon: faShoppingCart, href: "/admin/orders", color: "bg-red-100 text-red-600" },
    {
        name: "Khuyến mãi",
        icon: faGift,
        children: [
            { name: "Promotions", icon: faTags, href: "/admin/promotions" },
            { name: "Vouchers", icon: faBolt, href: "/admin/vouchers" },
        ],
    },
];
const usersItems: MenuItem[] = [
    { name: "Nhà cung cấp", icon: faTruck, href: "/admin/supplier", color: "bg-blue-100 text-blue-600" },
    { name: "Khách hàng", icon: faUser, href: "/admin/customers", color: "bg-red-100 text-red-600" },
];

const contentResourcesItems: MenuItem[] = [
    { name: "Tin tức/Bài viết", icon: faNewspaper, href: "/admin/news", color: "bg-red-100 text-red-600" },
];

// 💡 SỬA ĐỔI: Gộp Vai trò và Quyền hạn vào mục con "Phân quyền"
const systemItems: MenuItem[] = [
    { name: "Tài khoản", icon: faUserCheck, href: "/admin/users" },
    {
        name: "Phân quyền", // Tên mục cha mới
        icon: faUsersCog, // Icon cho Phân quyền (Users with Cog/Gear)
        children: [
            { name: "Vai trò", icon: faUserShield, href: "/admin/roles" },
            { name: "Quyền hạn", icon: faUserShield, href: "/admin/permissions" },
        ],
    },
];

const SidebarItem = ({
    item,
    currentPath,
}: {
    item: MenuItem;
    currentPath: string;
}) => {
    // Thêm logic để tự động mở/đóng mục cha nếu mục con active
    const isChildActive = item.children?.some(
        (child) => child.href && currentPath.startsWith(child.href)
    );
    
    // 💡 Tự động mở nếu có mục con đang active
    const [open, setOpen] = useState(!!isChildActive); 
    
    const isActive = item.href
        ? currentPath === item.href ||
          (currentPath.startsWith(item.href + "/") &&
              item.href !== "/admin/dashboard")
        : false;

    const activeClass = isActive
        ? "text-[#B95D26] font-semibold bg-orange-50"
        : "text-gray-600 hover:bg-gray-100";

    if (item.children && item.children.length > 0) {
        // Sử dụng isChildActive để xác định màu nền cho mục cha
        const parentActiveClass = isChildActive ? "text-[#B95D26] font-semibold bg-orange-50" : "text-gray-600 hover:bg-gray-100";
        
        return (
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${parentActiveClass}`}
                >
                    <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                        <span className="text-sm">{item.name}</span>
                    </div>
                    <FontAwesomeIcon
                        icon={open ? faChevronUp : faChevronDown}
                        className="w-3 h-3 text-gray-400"
                    />
                </button>
                {open && (
                    <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                            <Link
                                key={child.name}
                                href={child.href!}
                                className={`flex items-center justify-between px-0 py-2 rounded-md text-sm transition-colors ${
                                    currentPath === child.href
                                        ? "text-[#B95D26] font-semibold bg-orange-50"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                
                                    <FontAwesomeIcon
                                        icon={child.icon}
                                        className="w-4 h-4"
                                    />
                                    <span>{child.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href!}
            className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${activeClass}`}
        >
            <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
            </div>
            {isActive && (
                <span className="w-2 h-2 rounded-full bg-[#B95D26] ml-2"></span>
            )}
        </Link>
    );
};

export default function AdminSidebar() {
    const pathname = usePathname();

    const renderMenuSection = (title: string, items: MenuItem[]) => (
        <div>
            <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2 mt-4 first:mt-0">
                {title}
            </h3>
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
            <div className="p-4 flex flex-col border-b border-gray-100">
                <div className="flex items-center mb-1">
                    <div className="w-9 h-9 bg-[#B95D26] flex items-center justify-center rounded-md mr-3 shadow-sm">
                        <FontAwesomeIcon
                            icon={faHome}
                            className="w-5 h-5 text-white"
                        />
                    </div>
                    <div className="text-base font-bold text-gray-800">
                        Tiệm Gốm Nhà Gạo
                    </div>
                </div>
                <p className="text-xs text-gray-500 ml-12">Admin Dashboard</p>
            </div>
            <nav className="p-4 flex-1 space-y-4">
                {renderMenuSection("Tổng Quan", dashboardItems)}
                {renderMenuSection("Đơn hàng", orderItems)}
                {renderMenuSection("Sản phẩm", salesOperationsItems)}
                {renderMenuSection("Người dùng", usersItems)}
                {renderMenuSection("Marketing", contentResourcesItems)}
                {renderMenuSection("Phân quyền", systemItems)}
            </nav>
        </div>
    );
}