
export function SalesOverTimeChart() {
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sales Over Time</h3>
                <div className="flex space-x-2 text-xs">
                    <button className="px-3 py-1 border rounded-md bg-gray-100 font-medium text-gray-700">6M</button>
                    <button className="px-3 py-1 border rounded-md">1Y</button>
                    <button className="px-3 py-1 border rounded-md">All</button>
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Monthly revenue trends</p>
            <div className="h-64 flex items-center justify-center bg-gray-50 border rounded-lg text-gray-400">
                [Placeholder: Biểu đồ đường Revenue (Tháng 1 - Tháng 12)]
            </div>
        </div>
    );
}