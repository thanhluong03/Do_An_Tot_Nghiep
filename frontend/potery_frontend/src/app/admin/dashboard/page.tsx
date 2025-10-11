"use client";
import React, { useEffect, useState } from "react";
import { getRevenueData } from "@/api/services/orderService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  month: string;
  revenue: number;
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await getRevenueData();
      setData(result);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading revenue data...</div>;
  }

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>

      {/* Tổng doanh thu */}
      <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">Total Revenue (Delivered Orders)</p>
          <h2 className="text-3xl font-bold text-green-600">
            {totalRevenue.toLocaleString()}₫
          </h2>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Revenue by Month</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
