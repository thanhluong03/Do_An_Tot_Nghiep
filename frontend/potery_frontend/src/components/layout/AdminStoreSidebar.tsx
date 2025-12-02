"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faShoppingCart,
    faWarehouse,
    faUser,
    faChevronDown,
    faChevronUp,
    faTruckArrowRight,
    faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Image from "next/image";

interface MenuItem {
    name: string;
    icon: IconDefinition;
    href?: string;
    color?: string;
    children?: MenuItem[];
}

// --- LOGIC KIỂM TRA QUYỀN HẠN ---
const permissionsCache: string[] = []; 

/**
 * Lấy danh sách quyền hạn từ Local Storage (key: 'adminPermissions_3').
 * Dữ liệu chỉ được load 1 lần vào permissionsCache.
 */
const getAdminPermissions = (): string[] => {
    if (typeof window !== 'undefined' && permissionsCache.length === 0) {
        // Sử dụng key giả định 'adminPermissions_3'
        const permissionsJson = localStorage.getItem('adminPermissions_1'); 
        
        try {
            const permissions = permissionsJson ? JSON.parse(permissionsJson) : [];
            if (Array.isArray(permissions)) {
                permissionsCache.push(...permissions);
            }
        } catch (error) {
            console.error("Error parsing store admin permissions from localStorage:", error);
        }
    }
    return permissionsCache;
};

/**
 * Kiểm tra xem người dùng có quyền truy cập vào một đường dẫn cụ thể không.
 * @param href Đường dẫn cần kiểm tra (ví dụ: '/adminstore/dashboard').
 * @returns true nếu người dùng có quyền.
 */
const isPermitted = (href: string): boolean => {
    // Đảm bảo cache đã được load
    if (permissionsCache.length === 0) {
        getAdminPermissions();
    }
    
    // Xử lý đường dẫn: /adminstore/dashboard -> adminstore/dashboard
    const cleanHref = href.startsWith('/') ? href.substring(1) : href;
    
    // Kiểm tra trong danh sách quyền (không phân biệt chữ hoa/thường để an toàn)
    return permissionsCache.map(p => p.toLowerCase()).includes(cleanHref.toLowerCase());
};

// --- ĐỊNH NGHĨA CÁC MỤC MENU ---

const dashboardItems: MenuItem[] = [
    { name: "Dashboard", icon: faHome, href: "/adminstore/dashboard" },
];

const salesOperationsItems: MenuItem[] = [
    {
        name: "Kho hàng",
        icon: faWarehouse,
        children: [
            { name: "Yêu cầu nhập kho sản phẩm", icon: faTruckArrowRight, href: "/adminstore/storeRequestImportProduct" },
            { name: "Tồn kho cửa hàng", icon: faClipboardList, href: "/adminstore/inventory" },
        ],
    },
];

const usersItems: MenuItem[] = [
    { name: "Khách hàng", icon: faUser, href: "/adminstore/customers", color: "bg-red-100 text-red-600" },
];

const orderItems: MenuItem[] = [
    { name: "Đơn hàng", icon: faShoppingCart, href: "/adminstore/orders", color: "bg-red-100 text-red-600" },
];

// --- COMPONENT SIDEBAR ITEM (Giữ nguyên) ---

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
            item.href !== "/adminstore/dashboard")
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

// --- COMPONENT ADMIN SIDEBAR CHÍNH (Đã áp dụng logic lọc) ---
export default function AdminSidebar() {
    const pathname = usePathname();

    /**
     * Lọc các mục menu dựa trên quyền hạn của người dùng.
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
                <Link href="/adminstore/dashboard" passHref>
                    <Image
                        width={250}
                        height={800}
                        src="/logoADmin.jpg"
                        alt="Tiệm Gốm Nhà Gạo Admin Logo"
                        className="w-40 h-auto object-contain cursor-pointer hover:scale-[1.02]"
                    />
                </Link>
            </div>
            <nav className="p-4 flex-1 space-y-4 mb-10 text-sm">
                {renderMenuSection("Tổng Quan", dashboardItems)}
                {renderMenuSection("Đơn hàng", orderItems)}
                {renderMenuSection("Sản phẩm", salesOperationsItems)}
                {renderMenuSection("Người dùng", usersItems)}
            </nav>
        </div>
    );
}