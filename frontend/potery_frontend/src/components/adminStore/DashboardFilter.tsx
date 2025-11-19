// src/components/dashboard/DashboardFilter.tsx

"use client";
import React, { useState, useEffect, useCallback } from "react";

// ✅ CHỈNH SỬA: Loại bỏ storeId khỏi props và callback
interface DashboardFilterProps {
  onFilterChange: (filters: { startDate: string; endDate: string }) => void;
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // const [storeId, setStoreId] = useState<string>(""); // LOẠI BỎ

  const handleFilterChange = useCallback(() => {
    // ✅ CHỈNH SỬA: Chỉ truyền startDate và endDate
    onFilterChange({ startDate, endDate }); 
  }, [startDate, endDate, onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange();
    }, 300);
    return () => clearTimeout(timer);
  }, [handleFilterChange]);

  return (
    // ✅ LOẠI BỎ UI CHO VIỆC CHỌN CỬA HÀNG (SELECT DROPDOWN)
    <div className="w-full flex items-center bg-white p-4 gap-6 flex-wrap">
      {/* Lọc theo khoảng thời gian */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-500">Từ ngày:</label>
        <input
          title="dateStart"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-orange-500 transition"
        />
        <span className="text-gray-500 font-bold mx-1">→</span>
        <label className="text-sm font-medium text-gray-500">Đến ngày:</label>
        <input
          title="dateEnd"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-orange-500 transition"
        />
      </div>
    </div>
  );
};

export default DashboardFilter;