import React from "react";

interface SummaryCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100">
        <div className="w-12 h-12 rounded-md bg-indigo-50 flex items-center justify-center">{icon}</div>
        <div className="flex-1">
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-lg font-semibold text-gray-800">{value}</div>
        </div>
    </div>
);


interface DashboardSummaryProps {
    revenue: number;
    ordersLabel: string;
    customersLabel: string;
    productsLabel: string;
    bestSeller: string;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ revenue, ordersLabel, customersLabel, productsLabel, bestSeller }) => {
    const cards = [
        { title: "Tổng doanh thu", value: revenue.toLocaleString() + " ₫", icon: <span className="text-green-500">$</span> },
        { title: "Tổng đơn hàng", value: ordersLabel, icon: <span className="text-blue-500">◻</span> },
        { title: "Tổng khách hàng", value: customersLabel, icon: <span className="text-purple-500">👤</span> },
        { title: "Sản phẩm", value: productsLabel, icon: <span className="text-orange-500">🛍️</span>, subtitle: bestSeller },
    ];

    return (
        <>
            {cards.map((c, i) => (
                <div key={i}>
                    <SummaryCard title={c.title} value={c.value} icon={c.icon} />
                    {c.subtitle && <div className="text-xs text-gray-400 mt-1">Sản phẩm bán chạy: {c.subtitle}</div>}
                </div>
            ))}
        </>
    );
};

export default DashboardSummary;
