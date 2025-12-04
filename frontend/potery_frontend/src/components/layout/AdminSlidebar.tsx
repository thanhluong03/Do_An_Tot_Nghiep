"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faBox,
    faShoppingCart,
    faStore,
    faWarehouse,
    faList,
    faBolt,
    faNewspaper,
    faTruck,
    faTags,
    faUserShield,
    faUser,
    faChevronDown,
    faChevronUp,
    faGift,
    faUsersCog,
    faTruckArrowRight,
    faClipboardList,
    faUserCheck,
    faMessage,
    faRobot,
    faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Image from "next/image";
// import { ClipboardCheck } from "lucide-react"; // Đã bỏ import không cần thiết

interface MenuItem {
    name: string;
    icon: IconDefinition;
    href?: string;
    color?: string;
    children?: MenuItem[];
}

// --- LOGIC KIỂM TRA QUYỀN HẠN ---
// Cache để lưu trữ quyền sau khi load lần đầu, tránh đọc localStorage nhiều lần.
// --- LOGIC KIỂM TRA QUYỀN HẠN ---
// Cache để lưu trữ quyền sau khi load lần đầu, tránh đọc localStorage nhiều lần.
const permissionsCache: string[] = [];
// Thêm cache cho Role ID để tránh đọc localStorage nhiều lần
let adminRoleIdCache: string | null = null; 

/**
 * Lấy danh sách quyền hạn từ Local Storage.
 * @returns Mảng các chuỗi quyền hạn.
 */
const getAdminPermissions = (): string[] => {
    if (typeof window === 'undefined') return [];
    
    // Nếu cache đã có quyền, trả về ngay
    if (permissionsCache.length > 0) {
        return permissionsCache;
    }

    // 1. Lấy Admin Role ID
    if (!adminRoleIdCache) {
        adminRoleIdCache = localStorage.getItem('adminRoleId');
    }

    // Nếu không có Role ID, không thể xác định key quyền hạn
    if (!adminRoleIdCache) {
        console.warn("adminRoleId not found in localStorage. Cannot load permissions.");
        return [];
    }

    // 2. Xây dựng key dựa trên Role ID: adminPermissions_<ID>
    const permissionKey = `adminPermissions_${adminRoleIdCache}`;

    const permissionsJson = localStorage.getItem(permissionKey); 

    try {
        const permissions = permissionsJson ? JSON.parse(permissionsJson) : [];
        
        // Lưu vào cache
        if (Array.isArray(permissions)) {
            permissionsCache.length = 0; // Xóa cache cũ
            permissionsCache.push(...permissions);
        }
    } catch (error) {
        console.error(`Error parsing admin permissions from localStorage for key ${permissionKey}:`, error);
    }
    
    return permissionsCache;
};

/**
 * Kiểm tra xem người dùng có quyền truy cập vào một đường dẫn cụ thể không.
 * (Không cần thay đổi hàm này, nó sử dụng permissionsCache đã được cập nhật)
 */
const isPermitted = (href: string): boolean => {
    // Đảm bảo cache đã được load
    if (permissionsCache.length === 0) {
        getAdminPermissions();
    }
    
    // Đường dẫn trong sidebar: /admin/dashboard
    // Đường dẫn trong permissions: admin/dashboard
    const cleanHref = href.startsWith('/') ? href.substring(1) : href;
    
    // Chuyển sang lowercase để đảm bảo so sánh
    return permissionsCache.map(p => p.toLowerCase()).includes(cleanHref.toLowerCase());
};

// --- ĐỊNH NGHĨA CÁC MỤC MENU ---

const dashboardItems: MenuItem[] = [
    { name: "Dashboard", icon: faHome, href: "/admin/dashboard" },
    { name: "Tư vấn khách hàng", icon: faMessage, href: "/admin/conversation", color: "bg-blue-100 text-blue-600" },
];

const salesOperationsItems: MenuItem[] = [
    {
        name: "Kho hàng",
        icon: faWarehouse,
        children: [
            { name: "Duyệt yêu cầu nhập kho cửa hàng", icon: faClipboardCheck, href: "/admin/adminImportrequests" },
            { name: "Nhập kho sản phẩm", icon: faTruckArrowRight, href: "/admin/importproduct" },
            { name: "Tồn kho cửa hàng", icon: faClipboardList, href: "/admin/inventory" },
        ],
    },
    { name: "Sản phẩm", icon: faBox, href: "/admin/products", color: "bg-blue-100 text-blue-600" },

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

const systemItems: MenuItem[] = [
    { name: "Quản lý AI chat", icon: faRobot, href: "/admin/ai" },
    { name: "Tài khoản nhân viên", icon: faUserCheck, href: "/admin/users" },
    {
        name: "Phân quyền",
        icon: faUsersCog,
        children: [
            { name: "Vai trò", icon: faUserShield, href: "/admin/roles" },
            { name: "Quyền hạn", icon: faUserShield, href: "/admin/permissions" },
        ],
    },
];

// --- COMPONENT SIDEBAR ITEM ---
const SidebarItem = ({
    item,
    currentPath,
}: {
    item: MenuItem;
    currentPath: string;
}) => {
    // Logic tự động mở/đóng mục cha nếu mục con active
    const isChildActive = item.children?.some(
        (child) => child.href && currentPath.startsWith(child.href)
    );

    // Tự động mở nếu có mục con đang active
    const [open, setOpen] = useState(!!isChildActive);

    // Xác định trạng thái active cho mục đơn
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
                                className={`flex items-center justify-between px-0 py-2 rounded-md text-sm transition-colors ${currentPath === child.href
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

    // Mục đơn
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

// --- COMPONENT ADMIN SIDEBAR CHÍNH ---
export default function AdminSidebar() {
    const pathname = usePathname();

    /**
     * Lọc các mục menu dựa trên quyền hạn của người dùng.
     * @param items Mảng MenuItem đầu vào.
     * @returns Mảng MenuItem đã được lọc.
     */
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
        return items
            .map(item => {
                if (item.children) {
                    // 1. Lọc các mục con
                    const filteredChildren = item.children.filter(child => 
                        child.href ? isPermitted(child.href) : true
                    );
                    
                    // 2. Chỉ giữ lại mục cha nếu có ít nhất 1 mục con hợp lệ
                    if (filteredChildren.length > 0) {
                        return { ...item, children: filteredChildren };
                    }
                    return null; // Loại bỏ mục cha
                }
                
                // 3. Kiểm tra mục đơn (không có con)
                if (item.href && isPermitted(item.href)) {
                    return item;
                }
                
                return null; // Loại bỏ mục đơn
            })
            .filter((item): item is MenuItem => item !== null); // Lọc bỏ các mục null
    };

    const renderMenuSection = (title: string, items: MenuItem[]) => {
        // Lọc các mục trước khi render
        const filteredItems = filterMenuItems(items);

        // Không render section nếu không có mục nào được phép
        if (filteredItems.length === 0) return null;

        return (
            <div>
                <h3 className="text-[11px] font-semibold uppercase text-gray-400 mb-2 mt-4 first:mt-0">
                    {title}
                </h3>
                <div className="space-y-1">
                    {filteredItems.map((item) => (
                        <SidebarItem
                            key={item.name}
                            item={item}
                            currentPath={pathname}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Khởi tạo permission cache khi component được render
    getAdminPermissions();

    return (
        <div className="w-58 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-gray-200 shadow-md scrollbar-none">

            <div className="p-4 flex flex-col items-center justify-center border-b border-gray-100 mb-4">
                <Link href="/admin/dashboard" passHref>
                    <Image
                        src="/logoADmin.jpg"
                        alt="Tiệm Gốm Nhà Gạo Admin Logo"
                        width={800}
                        height={250}
                        className=" object-contain cursor-pointer hover:scale-[1.02]"
                    />
                </Link>
            </div>
            <nav className="p-4 flex-1 space-y-4 mb-10 text-sm">
                {renderMenuSection("Tổng Quan", dashboardItems)}
                {renderMenuSection("Đơn hàng", orderItems)}
                {renderMenuSection("Sản phẩm", salesOperationsItems)}
                {renderMenuSection("Người dùng", usersItems)}
                {renderMenuSection("Marketing", contentResourcesItems)}
                {renderMenuSection("Hệ thống", systemItems)}
            </nav>
        </div>
    );
}