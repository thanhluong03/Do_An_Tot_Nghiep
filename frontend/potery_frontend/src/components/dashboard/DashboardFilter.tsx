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
    <div className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-2">
      {/* Select cửa hàng */}
      <div className="relative flex-1">
        <select
          title="select"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 pr-8"
        >
          <option value="">Chọn hoặc nhập tên cửa hàng</option>
          <option value="1">Cửa hàng A</option>
          <option value="2">Cửa hàng B</option>
        </select>
        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      {/* Bộ lọc ngày */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <Calendar className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
};

export default DashboardFilter;
