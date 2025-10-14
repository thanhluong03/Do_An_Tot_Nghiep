import React from "react";

const DashboardFilter: React.FC = () => {
    return (
        <div className="w-full flex items-center gap-4">
            <div className="flex-1">
                <select className="w-full border rounded-lg px-4 py-3 text-sm bg-white">
                    <option>Chọn hoặc nhập tên cửa hàng</option>
                    <option>Cửa hàng A</option>
                    <option>Cửa hàng B</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">01/12/2025</div>
                <div className="text-sm text-gray-400">›</div>
                <div className="text-sm text-gray-500">18/12/2025</div>
                <button className="ml-3 bg-white border rounded-lg px-3 py-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM3 7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DashboardFilter;
