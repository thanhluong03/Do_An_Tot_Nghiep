import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RevenueChartProps {
    data: Array<{ name: string; revenue: number }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    // Custom formatter cho tooltip
    const formatTooltip = (value: number, name: string) => {
        return [value.toLocaleString('vi-VN') + ' ₫', 'Doanh thu'];
    };

    // Custom formatter cho trục Y
    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)} tr`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)} k`;
        }
        return value.toLocaleString('vi-VN');
    };

    return (
        <div className="bg-white rounded-xl p-4 h-72">
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        dy={15}
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis
                        tickFormatter={formatYAxis}
                        dx={-16}
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip
                        formatter={formatTooltip}
                        labelStyle={{ color: '#333', fontWeight: 'bold' }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#fb923c"
                        fill="url(#colorRevenue)"
                        strokeWidth={3}
                        dot={{ fill: '#fb923c', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#fb923c', strokeWidth: 2, fill: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
