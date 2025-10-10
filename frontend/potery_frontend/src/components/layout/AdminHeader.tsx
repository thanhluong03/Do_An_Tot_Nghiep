"use client";

import { Search, Bell, Mail } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
interface HeaderInfo {
    title: string;
    breadcrumb: string;
}

const getTitleAndBreadcrumb = (pathname: string): HeaderInfo => {
    const parts = pathname.split('/').filter(part => part && part !== 'admin');

    const nameMap: { [key: string]: string } = {
        'dashboard': 'Dashboard Overview',
        'products': 'Product Management',
        'inventory': 'Inventory',
        'stores': 'Stores',
        'supplier': 'Suppliers',
        'orders': 'Orders',
        'categories': 'Categories',
        'news': 'News/Blog',
        'reviews': 'Reviews',
        'promotions': 'Promotions/Vouchers',
        'flashsales': 'Flash Sales',
        'settings': 'Settings',
        'support': 'Support',
        'analytics': 'Analytics',
        'sales': 'Sales Analytics',
        // Thêm các mục khác nếu cần
    };


    if (parts.length === 0 || parts[0] === 'dashboard') {
        return { 
            title: nameMap['dashboard'] || "Dashboard Overview", 
            breadcrumb: "Dashboard" 
        };
    }

    // Lấy phần tử cuối cùng
    const lastPart = parts[parts.length - 1];
    
    const breadcrumbParts = parts.map(part => {
        if (nameMap[part]) return nameMap[part];
        
        return part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    });

    let title = breadcrumbParts[breadcrumbParts.length - 1] || "Trang";
    if (!nameMap[lastPart] && !isNaN(parseInt(lastPart))) {
        const parentName = breadcrumbParts[breadcrumbParts.length - 2];
        title = parentName ? `${parentName} (Chi tiết)` : `${title} (Chi tiết)`;
    } else {
        title = nameMap[lastPart] || title;
    }

    return { 
        title, 
        breadcrumb: breadcrumbParts.join(' > ') 
    };
};

export default function AdminHeader() {
    const pathname = usePathname() || '/admin/dashboard'; 
    const { title, breadcrumb } = getTitleAndBreadcrumb(pathname);

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between h-20 bg-white px-6 shadow-sm border-b border-gray-100">

            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
                <nav className="hidden sm:flex items-center text-sm text-gray-500">
                    <span className="text-gray-400">Home</span>
                    <span className="mx-2 text-gray-400">{'>'}</span>
                    {breadcrumb.split(' > ').map((item, index, array) => (
                        <span 
                            key={index} 
                            className={index === array.length - 1 ? "text-[#B95D26] font-medium" : "text-gray-500"}
                        >
                            {item}
                            {index < array.length - 1 && <span className="mx-2 text-gray-400">{'>'}</span>}
                        </span>
                    ))}
                </nav>
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products, orders, customers..."
                        className="pl-10 pr-4 py-2 text-sm border text-gray-500 border-gray-200 rounded-full focus:ring-[#B95D26] focus:border-[#B95D26] w-64 transition duration-150"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full ring-2 ring-white">
                            3
                        </span>
                    </div>
                    <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 rounded-full ring-2 ring-white">
                            7
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                    <div className="flex flex-col text-right">
                        <p className="text-sm font-medium text-gray-800 leading-none">Mai Ngọc</p>
                        <p className="text-xs text-gray-500 leading-none mt-1">Administrator</p>
                    </div>
                    <Image
                        src="/images/avaa.jpg" 
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full object-cover border-2 border-orange-100"
                    />
                    <svg
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </header>
    );
}