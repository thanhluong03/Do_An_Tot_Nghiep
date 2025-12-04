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
    PACKING: "Đang đóng gói",
    PENDING_DELIVERY: "Chờ giao hàng",
    DELIVERY_FAILED: "Giao hàng thất bại",
    CONFIRMED_RETURN: "Đã xác nhận đổi trả",
    PACKING_RETURN: "Đang đóng gói đổi trả",
    PENDING_DELIVERY_RETURN: "Chờ giao hàng đổi trả",
    SHIPPING_RETURN: "Đang giao hàng đổi trả",
    DELIVERY_FAILED_RETURN: "Đã giao đổi trả thất bại",
    CANCELLED_RETURN: "Không chấp nhận đổi trả",
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
    PACKING: "#60a5fa", // bg-blue-100 text-blue-700
    PENDING_DELIVERY: "#34d399", // bg-emerald-100 text-emerald-700
    DELIVERY_FAILED: "#f87171", // bg-red-100 text-red-700
    CONFIRMED_RETURN: "#fbbf24", // bg-yellow-300 text-yellow-800
    PACKING_RETURN: "#a3e635", // bg-lime-100 text-lime-700
    PENDING_DELIVERY_RETURN: "#38bdf8", // bg-sky-100 text-sky-700
    SHIPPING_RETURN: "#f97316", // bg-orange-300 text-orange-800
    DELIVERY_FAILED_RETURN: "#ef4444", // bg-red-300 text-red-800
    CANCELLED_RETURN: "#9ca3af", // bg-gray-300 text-gray-800
};

// Order to display legend so it matches the screenshot
const STATUSES_ORDER = ["SHIPPING", "CREATED", "CANCELLED", "CONFIRMED", "DELIVERED", "EXCHANGED", "RETURN_REQUESTED", "PACKING", "PENDING_DELIVERY", "DELIVERY_FAILED", "CONFIRMED_RETURN", "PACKING_RETURN", "PENDING_DELIVERY_RETURN", "SHIPPING_RETURN", "DELIVERY_FAILED_RETURN", "CANCELLED_RETURN"];

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
        const radius = innerRadius + (outerRadius - innerRadius) * 1.2; // push labels further out for spacing
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const isRight = x > cx;
        const status = payload.status || '';
        const textAnchor = isRight ? 'start' : 'end';
        // hide labels for zero values to avoid clutter
        if (!payload.value) return null;

        return (
            <text x={x} y={y} textAnchor={textAnchor} fontSize={13}>
                <tspan x={x} dy="0" fill={STATUS_COLORS[status] ?? '#000'} fontWeight={700}>{payload.value}</tspan>
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
                            innerRadius={30}
                            outerRadius={100}
                            paddingAngle={0}
                            label={renderLabel}
                            labelLine={false}
                        >
                            {pieData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status] || "#ddd"} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string, props: { payload?: { name?: string } }) => {
                                // props.payload contains the full pieData object
                                const statusName = props.payload?.name || '';
                                return [`${value} (${statusName})`, "Số lượng"];
                            }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 6, padding: '8px 12px', boxShadow: '0 2px 8px #0001' }}>
                                            <div style={{ color: STATUS_COLORS[d.status] || '#333', fontWeight: 700 }}>{d.name}</div>
                                            <div style={{ color: '#374151', fontSize: 14 }}>
                                                Số lượng: <span style={{ fontWeight: 700, color: STATUS_COLORS[d.status] || '#333' }}>{d.value}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm pl-8 mt-5">
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
