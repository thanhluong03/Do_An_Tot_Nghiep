// src/components/inventory/TransferInventoryForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Product } from '@/types/product';
import { Category } from '@/api/services/categoryService';
import Image from 'next/image';
import { productApi } from '@/api/modules/products';

interface SelectOption {
    id: number;
    name: string;
}

interface ProductClassification {
    id: number;
    name: string;
    price: number;
    quantity: number;
    product_attribute_id_1: number;
    product_attribute_id_2: number;
    attribute1_name: string;
    attribute2_name: string;
}

interface TransferInventoryDto {
    product_id: number;
    from_store_ids: number[];
    to_store_ids: number[];
    details?: TransferInventoryDetailDto[];
}

interface TransferInventoryDetailDto {
    classification_attribute_relationship_id: number;
    quantity: number;
}

interface InventoryDetail {
    classification_attribute_relationship_id: number;
    quantity_stock: number;
    quantity_sold: number;
}
import { ArrowRight, Package, Store, Shuffle, Box } from 'lucide-react';

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
    // ...
    const [classifications, setClassifications] = useState<ProductClassification[]>([]);
    const [classificationSelections, setClassificationSelections] = useState<ClassificationSelection>({});
    const hasClassifications = classifications.length > 0;
    // Khai báo state lên đầu
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]); // Lưu toàn bộ sản phẩm để lấy ảnh, category
    const [categories, setCategories] = useState<Array<Omit<Category, 'id'> & { id: string }>>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [stores, setStores] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedFromStoreId, setSelectedFromStoreId] = useState<number | null>(null);
    const [selectedToStoreId, setSelectedToStoreId] = useState<number | null>(null);
    // Sau khi khai báo state, mới khai báo useCallback
    const [quantityToTransfer, setQuantityToTransfer] = useState<string>('');
    const [availableStock, setAvailableStock] = useState<number>(0);
    const loadStoresData = useCallback(async () => {
        try {
            const storesData = await productApi.getStoresForDropdown();
            setStores(storesData);
        } catch (error) {
            console.error('Error loading stores data:', error);
            toast.error('Không thể tải dữ liệu cửa hàng');
        }
    }, []);

    const loadProductClassifications = useCallback(async () => {
        if (!selectedProductId) return;

        try {
            const classificationsData = await productApi.getProductClassifications(selectedProductId);
            setClassifications(classificationsData);

            // Initialize selections
            const initialSelections: ClassificationSelection = {};
            classificationsData.forEach((c: ProductClassification) => {
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
            const inventoryDetails = await productApi.getStoreProductInventoryDetails(
                selectedFromStoreId,
                selectedProductId
            );

            if (!inventoryDetails) {
                setAvailableStock(0);
                setQuantityToTransfer('');
                return;
            }

            const details = inventoryDetails.inventory_details || [];

            if (!details || details.length === 0) {
                // Sản phẩm không phân loại
                const stock = inventoryDetails.inventory?.quantity_stock ?? 0;
                setAvailableStock(stock);
                setQuantityToTransfer('');
            } else {
                // Sản phẩm có phân loại
                setClassificationSelections(prev => {
                    const updatedSelections = { ...prev };
                    details.forEach((detail: InventoryDetail) => {
                        updatedSelections[detail.classification_attribute_relationship_id] = {
                            availableStock: detail.quantity_stock ?? 0,
                            quantity: '',
                            checked: false
                        };
                    });
                    return updatedSelections;
                });

                setAvailableStock(0); // reset root stock
                setQuantityToTransfer('');
            }
        } catch (error) {
            console.error('Error loading available stock:', error);
            toast.error('Không thể tải tồn kho sản phẩm');
        }
    }, [selectedProductId, selectedFromStoreId]);


    useEffect(() => {
        loadStoresData();
        // Lấy danh mục sản phẩm
        const fetchCategories = async () => {
            try {
                const cats = await productApi.getCategories();
                setCategories(cats.map(cat => ({
                    ...cat,
                    id: typeof cat.id === 'number' ? String(cat.id) : (cat.id || '')
                })));
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        fetchCategories();
    }, [loadStoresData]);

    // Load products when store is selected
    useEffect(() => {
        if (selectedFromStoreId) {
            const fetchProducts = async () => {
                try {
                    const productsByStore = await productApi.getStoreProducts(selectedFromStoreId);

                    // Nếu chọn category, lọc tiếp theo category
                    let filteredProducts = productsByStore;
                    if (selectedCategory !== 'all') {
                        // Lấy thêm thông tin chi tiết sản phẩm để lọc category
                        const { products: allProducts } = await productApi.getProductsByStore(selectedFromStoreId);
                        setAllProducts(allProducts);

                        const filteredIds = allProducts
                            .filter(p => String(p.category) === String(selectedCategory))
                            .map(p => Number(p.id));

                        filteredProducts = productsByStore.filter(p => filteredIds.includes(p.id));
                    } else {
                        const { products: allProducts } = await productApi.getProductsByStore(selectedFromStoreId);
                        setAllProducts(allProducts);
                    }

                    setProducts(filteredProducts);
                } catch (error) {
                    console.error('Error fetching products:', error);
                    toast.error('Không thể tải danh sách sản phẩm');
                }
            };
            fetchProducts();
        } else {
            setProducts([]);
        }
    }, [selectedFromStoreId, selectedCategory]);

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

        let transferData: TransferInventoryDto;

        if (hasClassifications) {
            // Sản phẩm có phân loại (giữ nguyên logic cũ)
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

            transferData = {
                product_id: selectedProductId,
                from_store_ids: [selectedFromStoreId],
                to_store_ids: [selectedToStoreId],
                details: selectedDetails
            };
        } else {
            // Sản phẩm không phân loại
            const qty = Number(quantityToTransfer);
            if (!qty || qty <= 0) {
                toast.error('Vui lòng nhập số lượng hợp lệ!');
                return;
            }
            if (qty > availableStock) {
                toast.error('Số lượng vượt quá tồn kho có sẵn!');
                return;
            }

            transferData = {
                product_id: selectedProductId,
                from_store_ids: [selectedFromStoreId],
                to_store_ids: [selectedToStoreId],
                details: [
                    { classification_attribute_relationship_id: 0, quantity: qty }
                ]
            };
        }

        setLoading(true);
        try {
            await productApi.transferInventory(transferData);
            toast.success('Chuyển hàng thành công!');
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
                Chuyển hàng giữa các cửa hàng
            </label>

            {/* Điều chỉnh Grid mới */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-6 items-start">
                {/* Cột trái: 2 card chọn cửa hàng xếp dọc */}
                <div className="flex flex-col gap-8 col-span-2">
                    {/* 1. Card Chọn Cửa hàng gửi */}
                    <div className='p-0 border border-blue-200 rounded-xl shadow-lg bg-white overflow-hidden h-[180px] max-w-sm'>
                        <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                            <Store size={18} className="text-red-500" />
                            1. Cửa hàng gửi
                        </h4>
                        <div className="p-4">
                            <select
                                title='storeFirst'
                                value={selectedFromStoreId || ''}
                                onChange={(e) => {
                                    setSelectedFromStoreId(Number(e.target.value) || null);
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
                    {/* 2. Card Chọn cửa hàng nhận */}
                    <div className='p-0 border border-blue-200 rounded-xl shadow-lg bg-white overflow-hidden h-[180px] max-w-sm'>
                        <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                            <Store size={18} className="text-green-500" />
                            3. Cửa hàng nhận
                        </h4>
                        <div className="p-4">
                            <select
                                title='storeSecond'
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
                {/* Cột phải: card sản phẩm tự động cao lên */}
                <div className='p-0 border border-blue-200 rounded-xl shadow-lg bg-white overflow-hidden w-full max-w-none min-w-[600px] flex-1 ml-0.5 col-span-4'>
                    <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                        <Package size={18} className="text-orange-500" />
                        2. Chọn sản phẩm
                    </h4>
                    <div className="p-4">
                        {/* Lọc theo danh mục */}
                        <select
                            value={selectedCategory}
                            onChange={e => {
                                setSelectedCategory(e.target.value);
                                setSearchTerm('');
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                            disabled={!selectedFromStoreId}
                        >
                            <option value="all">-- Tất cả danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id?.toString() || ''}>{cat.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                            disabled={!selectedFromStoreId}
                        />
                        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                            {selectedFromStoreId && products.length > 0 && (
                                products
                                    .filter(product => {
                                        if (selectedCategory !== 'all') {
                                            const prod = allProducts.find(p => String(p.id) === String(product.id));
                                            if (!prod || String(prod.category) !== String(selectedCategory)) return false;
                                        }
                                        // Tìm kiếm không phân biệt dấu và chữ hoa/thường
                                        if (searchTerm.trim()) {
                                            const normalize = (str: string) => str
                                                .toLowerCase()
                                                .normalize('NFD')
                                                .replace(/\p{Diacritic}/gu, '');
                                            const productName = normalize(product.name);
                                            const search = normalize(searchTerm);
                                            if (!productName.includes(search)) return false;
                                        }
                                        return true;
                                    })
                                    .map(product => {
                                        const prod = allProducts.find(p => String(p.id) === String(product.id));
                                        const imgSrc = prod?.images?.[0] || '/no-image.jpg';
                                        const stock = prod?.stock ?? 0;
                                        return (
                                            <div
                                                key={product.id}
                                                className={`flex items-center gap-3 px-2 py-2 cursor-pointer rounded hover:bg-blue-50 transition ${selectedProductId === product.id ? 'bg-blue-100' : ''}`}
                                                onClick={() => setSelectedProductId(product.id)}
                                            >
                                                <Image
                                                    src={imgSrc}
                                                    alt={product.name}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 object-cover rounded border"
                                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                        (e.target as HTMLImageElement).src = '/no-image.jpg';
                                                    }}
                                                />
                                                <span className="flex-1 truncate font-medium text-gray-700">{product.name}</span>
                                                <span className={`px-2 py-1 text-xs rounded font-semibold ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Tồn: {stock}</span>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
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

            {/* Chi tiết sản phẩm chia cho chuyển hàng - Tương tự InventoryForm */}
            {selectedProductId && selectedFromStoreId && (
                <div className="mt-6">
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                        <label className="block text-base font-extrabold mb-4 flex items-center gap-2">
                            <Box size={18} className="text-blue-500" />
                            Chi tiết sản phẩm chuyển hàng
                        </label>

                        <div className="space-y-4">
                            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                {/* Header sản phẩm: ảnh + tên */}
                                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                    {/* Ảnh sản phẩm */}
                                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {(() => {
                                            const product = allProducts.find(p => String(p.id) === String(selectedProductId));
                                            const imgSrc = product?.images?.[0] || '/no-image.jpg';
                                            return (
                                                <Image
                                                    src={imgSrc}
                                                    alt={product?.name || 'Sản phẩm'}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                        (e.target as HTMLImageElement).src = '/no-image.jpg';
                                                    }}
                                                />
                                            );
                                        })()}
                                    </div>

                                    {/* Thông tin sản phẩm */}
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-gray-800 text-sm truncate">{getSelectedProduct()?.name}</h5>
                                        {/* Hiển thị giá nếu không có phân loại */}
                                        {classifications.length === 0 && (() => {
                                            const product = allProducts.find(p => String(p.id) === String(selectedProductId));
                                            if (product?.price !== undefined) {
                                                return (
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-xs text-green-600 font-semibold">
                                                            Giá bán: {Number(product.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ
                                                        </p>
                                                        <span className="text-xs text-gray-500 font-medium">Còn lại: {availableStock}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        {/* Hiển thị tổng tồn kho nếu có phân loại */}
                                        {classifications.length > 0 && (
                                            <p className="text-xs text-gray-500 font-semibold mt-1">
                                                Còn lại: {Object.values(classificationSelections).reduce((sum, sel) => sum + (sel?.availableStock || 0), 0)}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Có sẵn tại: <span className="font-medium text-blue-600">{getFromStore()?.name}</span>
                                        </p>
                                    </div>

                                    {/* Input số lượng (không phân loại) */}
                                    {classifications.length === 0 && (
                                        <div className="flex flex-col items-end w-40">
                                            <label className="text-xs font-medium text-gray-600 mb-1">Số lượng chuyển</label>
                                            <div className="relative w-full">
                                                <input
                                                    title="quantity_to_transfer"
                                                    type="text"
                                                    value={quantityToTransfer}
                                                    onChange={(e) => setQuantityToTransfer(e.target.value.replace(/[^0-9]/g, ''))}
                                                    className={`w-32 ml-10 border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 transition ${Number(quantityToTransfer) > availableStock && quantityToTransfer
                                                        ? 'border-red-400 bg-red-50 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
                                                        }`}
                                                    placeholder="0"
                                                />
                                                <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                                                    <span className="text-xs text-gray-400">/{availableStock}</span>
                                                </div>
                                            </div>
                                            {Number(quantityToTransfer) > availableStock && quantityToTransfer && (
                                                <p className="text-xs text-red-500 mt-1 font-medium">Vượt quá tồn kho có sẵn</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Phân loại sản phẩm nếu có - Tương tự InventoryForm */}
                                {classifications.length > 0 && (
                                    <div>
                                        <div className="mb-3">
                                            <h6 className="font-semibold text-gray-800 text-sm mb-2">Chọn phân loại để chuyển:</h6>
                                            <div className="flex gap-2 text-xs">
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                    {classifications.length} phân loại có sẵn
                                                </span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                                    {Object.values(classificationSelections).filter(s => s?.checked).length} đã chọn
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {classifications.map(classification => {
                                                const selection = classificationSelections[classification.id];
                                                const availableStock = selection?.availableStock || 0;
                                                const hasError = selection?.checked && Number(selection.quantity) > availableStock;

                                                return (
                                                    <div key={classification.id}
                                                        className={`border rounded-lg p-3 transition-all duration-200 ${selection?.checked
                                                            ? 'border-blue-300 bg-blue-50 shadow-sm'
                                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                                            }`}>
                                                        {/* Checkbox, tên phân loại và số lượng còn lại */}
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selection?.checked || false}
                                                                onChange={() => handleClassificationCheckboxChange(classification.id)}
                                                                className="mt-1 text-blue-600"
                                                            />
                                                            <div className="flex-1 flex items-center justify-between">
                                                                <h6 className="font-medium text-gray-800 text-sm">{classification.name}</h6>
                                                                <span className="text-xs text-gray-500 px-2 py-1 rounded font-semibold ml-2">
                                                                    Còn lại: {availableStock}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Price */}
                                                        <div className="flex gap-2 ">
                                                            <span className="text-xs font-semibold text-green-700 py-1 rounded">
                                                                Giá bán: {Number(classification.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ
                                                            </span>
                                                        </div>

                                                        {/* Input số lượng khi được chọn */}
                                                        {selection?.checked && (
                                                            <div className="ml-1 mt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-sm font-medium text-gray-700 min-w-[70px]">Số lượng chuyển:</label>
                                                                    <div className="relative flex-1">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="0"
                                                                            value={selection.quantity}
                                                                            onChange={(e) => handleQuantityChange(classification.id, e.target.value)}
                                                                            className={`w-full border rounded px-3 py-1 text-sm focus:ring-2 pr-16 ${hasError
                                                                                ? 'border-red-400 bg-red-50 focus:ring-red-500'
                                                                                : 'border-gray-300 focus:ring-blue-500'
                                                                                }`}
                                                                        />
                                                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                                                            <span className="text-xs text-gray-400">/{availableStock}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {hasError && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium ml-[78px]">
                                                                        Vượt quá tồn kho có sẵn
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                    Đóng
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedProductId || !selectedFromStoreId || !selectedToStoreId}
                    className="px-8 py-3 rounded-xl font-extrabold shadow-xl transition duration-200 text-white flex items-center gap-2 transform hover:scale-[1.02] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Đang chuyển...' : 'Chuyển hàng'}
                </button>
            </div>
        </div>
    );
};

export default TransferInventoryForm;
