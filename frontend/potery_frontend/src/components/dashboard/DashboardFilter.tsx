"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface DashboardFilterProps {
  onFilterChange: (filters: { storeId: string; startDate: string; endDate: string }) => void;
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [storeId, setStoreId] = useState<string>("");

  const handleFilterChange = useCallback(() => {
    onFilterChange({ storeId, startDate, endDate });
  }, [storeId, startDate, endDate, onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleFilterChange]);

  return (
    <div className="w-full flex items-center bg-white p-4 gap-6">

      {/* Label cho bộ lọc */}
      <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
        <span className="mr-2"></span> Lọc theo khoảng thời gian:
      </div>

      {/* Bộ lọc ngày */}
      <div className="flex items-center gap-2">

        {/* Input Ngày Bắt Đầu */}
        <label className="inline-flex items-center text-sm font-medium text-gray-500">
          Từ ngày
        </label>
        <input
          title="Ngày bắt đầu"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          // Tinh chỉnh CSS cho input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 bg-white focus:outline-none focus:border-orange-500 transition duration-150 cursor-pointer"
        />

        {/* Dấu phân cách */}
        <span className="text-gray-500 font-bold mx-1">→</span>

       <label className="inline-flex items-center text-sm font-medium text-gray-500">
          Đến ngày
        </label>
        <input
          title="Ngày kết thúc"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          // Tinh chỉnh CSS cho input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 bg-white focus:outline-none focus:border-orange-500 transition duration-150 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default DashboardFilter;
