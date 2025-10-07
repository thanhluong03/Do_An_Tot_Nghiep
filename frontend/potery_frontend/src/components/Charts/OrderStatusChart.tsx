// src/components/Charts/OrderStatusChart.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ListChecks } from 'lucide-react'; 

interface StatusData {
    name: string; 
    value: number; 
}

const FAKE_STATUS_DATA: StatusData[] = [
    { name: 'Đã hoàn thành', value: 720 },
    { name: 'Đang giao hàng', value: 150 },
    { name: 'Đơn hàng mới', value: 80 },
    { name: 'Đã hủy/Hoàn tiền', value: 50 },
];

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#B95D26']; 

// Định nghĩa kiểu dữ liệu cho Tooltip props (đã sửa lỗi TSX)
interface TooltipPayload {
    name: string;
    value: number | string;
    fill: string;
    payload: StatusData; 
}
interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const total = FAKE_STATUS_DATA.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((data.value / total) * 100).toFixed(1);
        return (
            <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg text-sm">
                <p style={{ color: payload[0].fill }} className="font-semibold">{data.name}</p>
                <p>{`Số lượng: ${data.value.toLocaleString()}`}</p>
                <p>{`Tỷ lệ: ${percentage}%`}</p>
            </div>
        );
    }
    return null;
};

const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percent * 100 < 5) return null;

    return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central" 
            className='font-semibold text-xs'
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


export function OrderStatusChart() {
    const [data, setData] = useState<StatusData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setData(FAKE_STATUS_DATA);
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);
    
    const totalOrders = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="p-6 h-[400px] flex flex-col">
            <div className="flex items-center text-xl font-semibold text-gray-800 mb-4">
                <ListChecks className="w-6 h-6 mr-2 text-blue-600" />
                Trạng thái Đơn hàng ({totalOrders.toLocaleString()})
            </div>

            {isLoading ? (
                <div className="flex-1 flex justify-center items-center bg-gray-50 rounded-lg animate-pulse">
                    <p className="text-gray-400">Đang tải dữ liệu trạng thái...</p>
                </div>
            ) : (
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60} 
                                outerRadius={120}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomizedLabel}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}