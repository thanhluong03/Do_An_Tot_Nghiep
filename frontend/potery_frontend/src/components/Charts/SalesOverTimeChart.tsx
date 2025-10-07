// src/components/Charts/SalesOverTimeChart.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';

interface DailyData {
    day: string; 
    net_revenue: number; 
    gross_profit: number; 
}

const FAKE_SALES_DATA: DailyData[] = [
    { day: 'T.Hai', net_revenue: 35000000, gross_profit: 15000000 },
    { day: 'T.Ba', net_revenue: 42000000, gross_profit: 21000000 },
    { day: 'T.Tư', net_revenue: 28000000, gross_profit: 10000000 },
    { day: 'T.Năm', net_revenue: 51000000, gross_profit: 26000000 },
    { day: 'T.Sáu', net_revenue: 40000000, gross_profit: 18000000 },
    { day: 'T.Bảy', net_revenue: 65000000, gross_profit: 35000000 },
    { day: 'CN', net_revenue: 72000000, gross_profit: 40000000 },
];

const formatYAxis = (value: number) => {
    return `${(value / 1000000).toFixed(0)}M`;
};

// Định nghĩa kiểu dữ liệu cho Tooltip props (đã sửa lỗi TSX)
interface TooltipPayload {
    name: string;
    value: number | string;
    color: string;
    payload: DailyData; 
}
interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
                <p className="font-semibold text-gray-700 mb-1">{`Ngày: ${label}`}</p>
                {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color }}>
                        {`${p.name}: `}
                        <span className="font-bold">{(p.value as number).toLocaleString('vi-VN')} VNĐ</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


export function SalesOverTimeChart() {
    const [data, setData] = useState<DailyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setData(FAKE_SALES_DATA);
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="p-6 h-[400px] flex flex-col">
            <div className="flex items-center text-xl font-semibold text-gray-800 mb-4">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                Báo cáo Doanh thu 7 ngày gần nhất
            </div>
            
            {isLoading ? (
                <div className="flex-1 flex justify-center items-center bg-gray-50 rounded-lg animate-pulse">
                    <p className="text-gray-400">Đang tải dữ liệu doanh thu...</p>
                </div>
            ) : (
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                            <XAxis dataKey="day" stroke="#a0a0a0" />
                            <YAxis tickFormatter={formatYAxis} stroke="#a0a0a0" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            
                            <Line 
                                type="monotone" 
                                dataKey="net_revenue" 
                                name="Doanh thu Thuần"
                                stroke="#B95D26" 
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            
                            <Line 
                                type="monotone" 
                                dataKey="gross_profit" 
                                name="Lợi nhuận Gộp"
                                stroke="#00C49F" 
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}