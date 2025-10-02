import { Search, Bell, Mail } from 'lucide-react';
import Image from 'next/image';

export default function AdminHeader() {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-20 bg-white border-b px-6">
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
                <nav className="hidden sm:flex items-center text-xl text-gray-500">
                    <span>Home</span>
                    <span className="mx-2">{'>'}</span>
                    <span className="text-[#B95D26] font-medium">Dashboard</span>
                </nav>
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products, orders, customers..."
                        className="pl-10 pr-4 py-2 text-sm border text-gray-500 border-gray-200 rounded-full focus:ring-orange-500 focus:border-orange-500 w-180"
                    />
                </div>

                {/* Mail + Bell */}
                <div className="flex items-center space-x-4">
                    <div className="relative cursor-pointer">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                            3
                        </span>
                    </div>
                    <div className="relative cursor-pointer">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-1.5 rounded-full">
                            7
                        </span>
                    </div>
                </div>

                {/* User info */}
                <div className="flex items-center space-x-3 pl-6 border-l">
                    <div className="flex flex-col">
                        <p className="text-md font-medium text-gray-800 leading-none pb-1">Mai Ngọc</p>
                        <p className="text-md text-gray-500 leading-none">Administrator</p>
                    </div>
                    <Image
                        src="/images/avaa.jpg" 
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                    />
                    <svg
                        className="w-4 h-4 text-gray-500"
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
