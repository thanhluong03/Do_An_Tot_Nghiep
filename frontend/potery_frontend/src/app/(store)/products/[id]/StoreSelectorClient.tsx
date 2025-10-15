'use client';

import React, { useState, useCallback } from 'react';

interface StoreInventory {
  store_id: number; // ✅ kiểu số
  store_name: string;
  store_address: string;
  quantity_stock: number;
}

interface StoreSelectorProps {
  stores: StoreInventory[];
  initialStoreId?: number | null;
  onStoreChange?: (storeId: number) => void; // ✅ callback truyền số
}

export const StoreSelectorClient: React.FC<StoreSelectorProps> = ({
  stores,
  initialStoreId,
  onStoreChange,
}) => {
  // Lọc cửa hàng còn hàng
  const availableStores = stores.filter((s) => s.quantity_stock > 0);

  // Cửa hàng được chọn mặc định
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(
    initialStoreId || (availableStores.length > 0 ? availableStores[0].store_id : null)
  );

  // Khi người dùng chọn cửa hàng khác
  const handleStoreChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newStoreId = Number(event.target.value);
      setSelectedStoreId(newStoreId);
      console.log(`✅ ID Cửa hàng được chọn: ${newStoreId}`);

      if (onStoreChange) onStoreChange(newStoreId); // Gọi callback để báo cho cha (ProductDetailClient)
    },
    [onStoreChange]
  );

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">🛒 Chọn Cửa hàng Còn Hàng</h3>

      {availableStores.length > 0 ? (
        <div className="space-y-3">
          {availableStores.map((store) => (
            <div
              key={store.store_id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <label className="flex items-center cursor-pointer">
                <input
                    type="radio"
                    name="store"
                    value={store.store_id} // hoặc store.id nếu API dùng vậy
                    checked={selectedStoreId === Number(store.store_id)} // ✅ ép kiểu về number
                    onChange={(e) => {
                        const newId = Number(e.target.value);
                        setSelectedStoreId(newId);
                        if (onStoreChange) onStoreChange(newId);
                    }}
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

          
        </div>
      ) : (
        <p className="text-red-600 font-medium">
          ❌ Sản phẩm hiện đã hết hàng tại tất cả các cửa hàng được phân phối.
        </p>
      )}
    </section>
  );
};
