import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
interface BestSellerChartProps {
    data: Array<{ name: string; value: number }>;
}

const BestSellerChart: React.FC<BestSellerChartProps> = ({ data }) => (
    <div className="bg-white rounded-xl p-4 h-80">
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <defs>
                    <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ffd6a5" stopOpacity={1} />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity={1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-35} textAnchor="end" interval={0} height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="url(#barGrad)" barSize={24} radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default BestSellerChart;
