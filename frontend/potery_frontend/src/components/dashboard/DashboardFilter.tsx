"use client";
import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

const DashboardFilter: React.FC = () => {
  return (
    <div className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-2">
      {/* Select cửa hàng */}
      <div className="relative flex-1">
        <select
        title="select"
          className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 pr-8"
        >
          <option>Chọn hoặc nhập tên cửa hàng</option>
          <option>Cửa hàng A</option>
          <option>Cửa hàng B</option>
        </select>
        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      {/* Bộ lọc ngày */}
      <div className="flex items-center px-3 py-2.5 text-sm text-gray-700  hover:bg-white transition">
        <span>01/12/2025</span>
        <span className="mx-2 text-gray-400">→</span>
        <span>18/12/2025</span>
        <Calendar className="ml-2 w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
};

export default DashboardFilter;
