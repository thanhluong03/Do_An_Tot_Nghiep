import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface OrderStatusChartProps {
    data: Array<{ status: string; count: number }>;
}

// Map backend status keys to Vietnamese labels
const STATUS_LABELS: Record<string, string> = {
    CREATED: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang vận chuyển",
    DELIVERED: "Đã giao thành công",
    CANCELLED: "Đã hủy",
    RETURN_REQUESTED: "Đang yêu cầu hoàn trả",
    EXCHANGED: "Đã đổi trả",
};

// Colors chosen to match the screenshot; CANCELLED uses a red color
const STATUS_COLORS: Record<string, string> = {
    CREATED: "#ffba52ff", // text-orange-700 bg-orange-100
    CONFIRMED: "#4649ffff", // bg-indigo-100 text-indigo-700
    SHIPPING: "#ffd83dff", // bg-yellow-100 text-yellow-700
    DELIVERED: "#26dc69ff", // bg-green-100 text-green-700
    CANCELLED: "#d1d5db", // bg-gray-100 text-gray-700
    EXCHANGED: "#a78bfa", // bg-purple-100 text-purple-700
    RETURN_REQUESTED: "#f472b6", // bg-pink-100 text-pink-700
};

// Order to display legend so it matches the screenshot
const STATUSES_ORDER = ["SHIPPING", "CREATED", "CANCELLED", "CONFIRMED", "DELIVERED", "EXCHANGED", "RETURN_REQUESTED"];

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
    const countsMap: Record<string, number> = {};
    data.forEach((d) => {
        countsMap[d.status] = (countsMap[d.status] || 0) + d.count;
    });

    // total not needed for current labels; compute if needed later

    // Build pie data in the fixed order so colors/legend align predictably
    const pieData = STATUSES_ORDER.map((status) => ({
        status,
        name: STATUS_LABELS[status] || status,
        value: countsMap[status] || 0,
    }));

    type LabelLike = { cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; payload?: { status?: string; name?: string; value?: number } };
    const renderLabel = (p: unknown) => {
        const props = (p as LabelLike) || {};
        const cx = Number(props.cx || 0);
        const cy = Number(props.cy || 0);
        const midAngle = Number(props.midAngle || 0);
        const innerRadius = Number(props.innerRadius || 0);
        const outerRadius = Number(props.outerRadius || 0);
        const payload = props.payload || { status: '', name: '', value: 0 };
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.4; // push labels further out for spacing
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const isRight = x > cx;
        const status = payload.status || '';
        const textAnchor = isRight ? 'start' : 'end';
        // hide labels for zero values to avoid clutter
        if (!payload.value) return null;

        return (
            <text x={x} y={y} textAnchor={textAnchor} fontSize={13}>
                <tspan fill="#374151">{payload.name}</tspan>
                <tspan x={x} dy="1.2em" fill={STATUS_COLORS[status] ?? '#000'} fontWeight={700}>{payload.value}</tspan>
            </text>
        );
    };

    return (
        <div>
            {/* Prevent default mousedown so the SVG doesn't receive a focus outline/box when clicked */}
            <div className="flex justify-center" onMouseDown={(e) => e.preventDefault()}>
                <ResponsiveContainer width={320} height={260}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx={'50%'}
                            cy={'50%'}
                            innerRadius={28}
                            outerRadius={65}
                            paddingAngle={0}
                            label={renderLabel}
                            labelLine={false}
                        >
                            {pieData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status] || "#ddd"} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [value, "Số lượng"]} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm pl-8">
                {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div style={{ width: 10, height: 10, background: STATUS_COLORS[d.status] || "#ddd", borderRadius: 6 }}></div>
                        <div className="text-gray-600">{d.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderStatusChart;
