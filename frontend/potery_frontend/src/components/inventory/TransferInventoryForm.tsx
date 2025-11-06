// src/components/inventory/TransferInventoryForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    transferInventory,
    TransferInventoryDto,
    TransferInventoryDetailDto,
    listStoreProducts,
    listDropdownStores,
    getProductClassifications,
    getStoreProductInventoryDetails,
    SelectOption,
    ProductClassification
} from '@/api/services/inventoryService';
import { ArrowRight, Package, Store, Shuffle } from 'lucide-react';

interface TransferInventoryFormProps {
    onSuccess?: () => void;
}

interface ClassificationSelection {
    [key: number]: {
        checked: boolean;
        quantity: string;
        availableStock: number;
    };
}

interface TransferInventoryFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const TransferInventoryForm: React.FC<TransferInventoryFormProps> = ({ onSuccess, onCancel }) => {
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [stores, setStores] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedFromStoreId, setSelectedFromStoreId] = useState<number | null>(null);
    const [selectedToStoreId, setSelectedToStoreId] = useState<number | null>(null);

    // Classifications and selections
    const [classifications, setClassifications] = useState<ProductClassification[]>([]);
    const [classificationSelections, setClassificationSelections] = useState<ClassificationSelection>({});

    const loadStoresData = useCallback(async () => {
        try {
            const storesData = await listDropdownStores();
            setStores(storesData);
        } catch (error) {
            console.error('Error loading stores data:', error);
            toast.error('Không thể tải dữ liệu cửa hàng');
        }
    }, []);

    const loadStoreProducts = useCallback(async () => {
        if (!selectedFromStoreId) return;

        try {
            const productsData = await listStoreProducts(selectedFromStoreId);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading store products:', error);
            toast.error('Không thể tải danh sách sản phẩm cửa hàng');
        }
    }, [selectedFromStoreId]);

    const loadProductClassifications = useCallback(async () => {
        if (!selectedProductId) return;

        try {
            const classificationsData = await getProductClassifications(selectedProductId);
            setClassifications(classificationsData);

            // Initialize selections
            const initialSelections: ClassificationSelection = {};
            classificationsData.forEach(c => {
                initialSelections[c.id] = {
                    checked: false,
                    quantity: '',
                    availableStock: 0
                };
            });
            setClassificationSelections(initialSelections);
        } catch (error) {
            console.error('Error loading product classifications:', error);
            toast.error('Không thể tải phân loại sản phẩm');
        }
    }, [selectedProductId]);

    const loadAvailableStock = useCallback(async () => {
        if (!selectedProductId || !selectedFromStoreId) return;

        try {
            const inventoryDetails = await getStoreProductInventoryDetails(selectedFromStoreId, selectedProductId);

            if (inventoryDetails) {
                setClassificationSelections(prev => {
                    const updatedSelections = { ...prev };
                    inventoryDetails.inventory_details.forEach(detail => {
                        if (updatedSelections[detail.classification_attribute_relationship_id]) {
                            updatedSelections[detail.classification_attribute_relationship_id].availableStock = detail.quantity_stock;
                        }
                    });
                    return updatedSelections;
                });
            }
        } catch (error) {
            console.error('Error loading available stock:', error);
        }
    }, [selectedProductId, selectedFromStoreId]);

    useEffect(() => {
        loadStoresData();
    }, [loadStoresData]);

    // Load products when store is selected
    useEffect(() => {
        if (selectedFromStoreId) {
            loadStoreProducts();
        } else {
            setProducts([]);
        }
    }, [selectedFromStoreId, loadStoreProducts]);

    useEffect(() => {
        if (selectedProductId) {
            loadProductClassifications();
        } else {
            setClassifications([]);
            setClassificationSelections({});
        }
    }, [selectedProductId, loadProductClassifications]);

    useEffect(() => {
        if (selectedProductId && selectedFromStoreId) {
            loadAvailableStock();
        }
    }, [selectedProductId, selectedFromStoreId, loadAvailableStock]);

    const handleClassificationCheckboxChange = (classificationId: number) => {
        setClassificationSelections(prev => ({
            ...prev,
            [classificationId]: {
                ...prev[classificationId],
                checked: !prev[classificationId]?.checked
            }
        }));
    };

    const handleQuantityChange = (classificationId: number, quantity: string) => {
        const numericValue = quantity.replace(/[^0-9]/g, '');
        setClassificationSelections(prev => ({
            ...prev,
            [classificationId]: {
                ...prev[classificationId],
                quantity: numericValue
            }
        }));
    };

    const handleSubmit = async () => {
        if (!selectedProductId || !selectedFromStoreId || !selectedToStoreId) {
            toast.error('Vui lòng chọn đầy đủ sản phẩm và cửa hàng!');
            return;
        }

        if (selectedFromStoreId === selectedToStoreId) {
            toast.error('Cửa hàng gửi và nhận không thể giống nhau!');
            return;
        }

        // Collect selected classifications
        const selectedDetails: TransferInventoryDetailDto[] = [];
        Object.entries(classificationSelections).forEach(([classificationId, selection]) => {
            if (selection.checked && selection.quantity && Number(selection.quantity) > 0) {
                const quantity = Number(selection.quantity);
                if (quantity > selection.availableStock) {
                    toast.error(`Số lượng vượt quá tồn kho có sẵn cho phân loại ${classificationId}`);
                    return;
                }
                selectedDetails.push({
                    classification_attribute_relationship_id: Number(classificationId),
                    quantity
                });
            }
        });

        if (selectedDetails.length === 0) {
            toast.error('Vui lòng chọn ít nhất một phân loại và nhập số lượng hợp lệ!');
            return;
        }

        const transferData: TransferInventoryDto = {
            product_id: selectedProductId,
            from_store_ids: [selectedFromStoreId],
            to_store_ids: [selectedToStoreId],
            details: selectedDetails
        };

        setLoading(true);
        try {
            await transferInventory(transferData);
            toast.success('Chuyển combo phân loại thành công!');
            resetForm();
            onSuccess?.();
        } catch (error) {
            console.error('Error transferring inventory:', error);
            toast.error('Có lỗi xảy ra khi chuyển hàng!');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedProductId(null);
        setSelectedFromStoreId(null);
        setSelectedToStoreId(null);
        setClassifications([]);
        setClassificationSelections({});
    };

    const handleCancel = () => {
        resetForm();
        onCancel?.();
    };

    const getSelectedProduct = () => products.find(p => p.id === selectedProductId);
    const getFromStore = () => stores.find(s => s.id === selectedFromStoreId);
    const getToStore = () => stores.find(s => s.id === selectedToStoreId);

    return (
        <div className="p-10 rounded-2xl bg-white border border-blue-200 shadow-2xl transition duration-500 hover:shadow-blue-500/20">
            <label className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-700 border-b-2 border-gray-100 pb-3">
                <Shuffle size={18} className="text-blue-500" />
                CHUYỂN HÀNG GIỮA CỬA HÀNG
            </label>

            {/* Điều chỉnh Grid chính */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                {/* 1. Card Chọn Cửa hàng gửi */}
                <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                    <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                        <Store size={18} className="text-red-500" />
                        1. CỬA HÀNG GỬI
                    </h4>
                    <div className="p-4">
                        <select
                            value={selectedFromStoreId || ''}
                            onChange={(e) => {
                                setSelectedFromStoreId(Number(e.target.value) || null);
                                // Reset product and to store when changing from store
                                setSelectedProductId(null);
                                setSelectedToStoreId(null);
                                setClassifications([]);
                                setClassificationSelections({});
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Chọn cửa hàng gửi --</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 2. Card Chọn sản phẩm */}
                <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                    <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                        <Package size={18} className="text-orange-500" />
                        2. CHỌN SẢN PHẨM
                    </h4>
                    <div className="p-4">
                        <select
                            value={selectedProductId || ''}
                            onChange={(e) => setSelectedProductId(Number(e.target.value) || null)}
                            disabled={!selectedFromStoreId}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {selectedFromStoreId ? "-- Chọn sản phẩm --" : "-- Chọn cửa hàng gửi trước --"}
                            </option>
                            {selectedFromStoreId && products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Card Chọn cửa hàng nhận */}
                <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                    <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                        <Store size={18} className="text-green-500" />
                        3. CỬA HÀNG NHẬN
                    </h4>
                    <div className="p-4">
                        <select
                            value={selectedToStoreId || ''}
                            onChange={(e) => setSelectedToStoreId(Number(e.target.value) || null)}
                            disabled={!selectedFromStoreId}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {selectedFromStoreId ? "-- Chọn cửa hàng nhận --" : "-- Chọn cửa hàng gửi trước --"}
                            </option>
                            {selectedFromStoreId && stores.filter(s => s.id !== selectedFromStoreId).map(store => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Hiển thị thông tin đã chọn */}
            {selectedProductId && selectedFromStoreId && selectedToStoreId && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-medium text-gray-700">Từ cửa hàng</div>
                            <div className="text-red-600 font-semibold">{getFromStore()?.name}</div>
                        </div>
                        <ArrowRight className="text-gray-400" size={20} />
                        <div className="text-center">
                            <div className="font-medium text-gray-700">Sản phẩm</div>
                            <div className="text-blue-600 font-semibold">{getSelectedProduct()?.name}</div>
                        </div>
                        <ArrowRight className="text-gray-400" size={20} />
                        <div className="text-center">
                            <div className="font-medium text-gray-700">Đến cửa hàng</div>
                            <div className="text-green-600 font-semibold">{getToStore()?.name}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Danh sách combo phân loại */}
            {classifications.length > 0 && selectedFromStoreId && (
                <div className="mt-6">
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-blue-700 mb-4 flex items-center gap-2">
                            <Package size={16} className="text-blue-500" />
                            CHỌN COMBO PHÂN LOẠI ĐỂ CHUYỂN
                        </label>
                        <div className="space-y-3">
                            {classifications.map(classification => {
                                const selection = classificationSelections[classification.id];
                                const availableStock = selection?.availableStock || 0;

                                return (
                                    <div key={classification.id} className="bg-white border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                type="checkbox"
                                                checked={selection?.checked || false}
                                                onChange={() => handleClassificationCheckboxChange(classification.id)}
                                                className="text-blue-600"
                                            />
                                            <span className="font-medium text-gray-700">
                                                {classification.name}
                                            </span>
                                            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                Tồn kho: {availableStock}
                                            </span>
                                        </div>

                                        {selection?.checked && (
                                            <div className="ml-6">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm font-medium text-gray-700 min-w-[80px]">Số lượng:</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nhập số lượng"
                                                        value={selection.quantity}
                                                        onChange={(e) => handleQuantityChange(classification.id, e.target.value)}
                                                        className="w-32 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                {Number(selection.quantity) > availableStock && (
                                                    <div className="text-red-500 text-xs mt-1 ml-[84px]">
                                                        Vượt quá tồn kho có sẵn
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Button controls - Giống InventoryForm */}
            <div className="flex justify-end gap-3 pt-8 border-t mt-8 border-gray-100">
                <button
                    onClick={handleCancel}
                    className="px-8 py-3 rounded-xl font-bold shadow-lg transition duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2 transform hover:scale-[1.02]"
                >
                    ĐÓNG FORM
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedProductId || !selectedFromStoreId || !selectedToStoreId}
                    className="px-8 py-3 rounded-xl font-extrabold shadow-xl transition duration-200 text-white flex items-center gap-2 transform hover:scale-[1.02] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'ĐANG CHUYỂN...' : 'CHUYỂN HÀNG'}
                </button>
            </div>
        </div>
    );
};

export default TransferInventoryForm;
