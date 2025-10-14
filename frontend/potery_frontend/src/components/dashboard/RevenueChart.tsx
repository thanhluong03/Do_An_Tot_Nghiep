import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RevenueChartProps {
    data: Array<{ name: string; revenue: number }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 h-72">
        <div className="font-semibold mb-2">Doanh số bán hàng</div>
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#fb923c" fill="url(#colorRevenue)" strokeWidth={3} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export default RevenueChart;
