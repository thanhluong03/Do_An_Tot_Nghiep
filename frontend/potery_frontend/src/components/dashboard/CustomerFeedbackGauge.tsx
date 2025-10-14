import React from "react";

interface CustomerFeedbackGaugeProps {
    data: Array<{ name: string; value: number; fill?: string }>;
}

const CustomerFeedbackGauge: React.FC<CustomerFeedbackGaugeProps> = ({ data }) => {
    const percent = data[0]?.value ?? 0;
    const avg = data[0]?.avg ?? 0;
    const total = data[0]?.total ?? 0;
    // semicircle circumference logic
    const r = 45;
    const circ = Math.PI * r;
    const filled = Math.round((percent / 100) * circ);

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 h-72 flex flex-col items-center justify-center">
            <div className="font-semibold mb-2">Phản hồi khách hàng</div>
            <div className="w-full flex items-center gap-4">
                <div className="flex-1 flex items-center">
                    <div className="relative flex items-center justify-center">
                        <svg width="140" height="80" viewBox="0 0 100 50">
                            <defs>
                                <linearGradient id="g1" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#ff7a45" />
                                    <stop offset="100%" stopColor="#ffd6a5" />
                                </linearGradient>
                            </defs>
                            <path d="M5 50 A45 45 0 0 1 95 50" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
                            <path d="M5 50 A45 45 0 0 1 95 50" fill="none" stroke="url(#g1)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${filled} ${circ - filled}`} transform="rotate(180 50 25) translate(0 -50)" />
                        </svg>
                        <div className="absolute text-2xl font-bold">{avg.toFixed(1)}</div>
                    </div>
                </div>
                <div className="w-36 text-sm">
                    <div className="text-lg font-bold">{avg.toFixed(1)} / 5</div>
                    <div className="text-xs text-gray-500">{total} Đánh giá</div>
                    <div className="text-xs text-gray-500">{percent}% Tỉ lệ đánh giá</div>
                </div>
            </div>
        </div>
    );
};

export default CustomerFeedbackGauge;
