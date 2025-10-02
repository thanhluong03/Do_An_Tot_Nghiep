// src/components/Charts/OrderStatusChart.tsx

export function OrderStatusChart() {
    const data = [
        { name: 'Completed', value: 847, color: 'text-green-500' },
        { name: 'Pending', value: 234, color: 'text-orange-500' },
        { name: 'Processing', value: 166, color: 'text-blue-500' },
    ];

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
            <p className="text-sm text-gray-500 mb-4">Current order distribution</p>
            
            <div className="flex flex-col items-center">
                <div className="w-40 h-40 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 border">
                    [Donut Chart]
                </div>
                
                <div className="mt-6 space-y-2">
                    {data.map(item => (
                        <div key={item.name} className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${item.color.replace('text-', 'bg-')}`}></span>
                            <span className="text-sm text-gray-700">{item.name}</span>
                            <span className="text-sm font-semibold text-gray-600 ml-auto">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}