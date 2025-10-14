import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CustomerDemographicsChartProps {
    data: Array<{ age: string; count: number }>;
}

const CustomerDemographicsChart: React.FC<CustomerDemographicsChartProps> = ({ data }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 h-64">
        <div className="font-semibold mb-2">Nhân khẩu khách hàng</div>
        <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" barSize={24} radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default CustomerDemographicsChart;
