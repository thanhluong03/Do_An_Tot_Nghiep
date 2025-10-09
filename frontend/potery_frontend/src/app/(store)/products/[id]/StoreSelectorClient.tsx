// components/products/[id]/StoreSelectorClient.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Giả định types đã được định nghĩa trong productApi.ts hoặc ../../types
interface StoreInventory {
    store_id: string;
    store_name: string;
    store_address: string;
    quantity_stock: number;
}

interface StoreSelectorProps {
    stores: StoreInventory[]; // Danh sách cửa hàng kèm tồn kho
    initialStoreId?: string;
     
}

export const StoreSelectorClient: React.FC<StoreSelectorProps> = ({ stores, initialStoreId }) => {
    // Chỉ lọc các cửa hàng còn tồn kho để hiển thị
    const availableStores = stores.filter(s => s.quantity_stock > 0);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(initialStoreId || (availableStores.length > 0 ? availableStores[0].store_id : null));

    // Cập nhật selectedStoreId và gọi callback khi có thay đổi
    const handleStoreChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newStoreId = event.target.value;
        setSelectedStoreId(newStoreId);
       
        console.log(`✅ ID Cửa hàng được chọn: ${newStoreId}`);
    }, []);


    return (
        <section className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">🛒 Chọn Cửa hàng Còn Hàng</h3>
            
            {availableStores.length > 0 ? (
                <div className="space-y-3">
                    {availableStores.map(store => (
                        <div key={store.store_id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="storeSelection"
                                    value={store.store_id}
                                    checked={selectedStoreId === store.store_id}
                                    onChange={handleStoreChange}
                                    className="h-4 w-4 text-[#65604E] focus:ring-[#65604E] border-gray-300"
                                />
                                <div className="ml-3 text-sm">
                                    <strong className="text-gray-900">{store.store_name}</strong> 
                                    <p className="text-gray-600 line-clamp-1">{store.store_address}</p>
                                    <span className="text-sm font-medium text-green-600">
                                        Còn: {store.quantity_stock} sản phẩm
                                    </span>
                                </div>
                            </label>
                        </div>
                    ))}

                    <div className="mt-4 p-3 bg-[#F5F1EB] rounded-lg text-sm text-gray-700">
                        Cửa hàng đã chọn: **{availableStores.find(s => s.store_id === selectedStoreId)?.store_name || 'Vui lòng chọn'}**
                    </div>
                </div>
            ) : (
                <p className="text-red-600 font-medium">❌ Sản phẩm hiện đã hết hàng tại tất cả các cửa hàng được phân phối.</p>
            )}
        </section>
    );
};