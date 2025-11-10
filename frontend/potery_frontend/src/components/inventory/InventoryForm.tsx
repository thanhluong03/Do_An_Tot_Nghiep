// src/components/inventory/InventoryForm.tsx (MÀU CHỦ ĐẠO LÀ MÀU CAM)

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { SelectOption, Product, getProductClassifications, ProductClassification, getProductImageUrl } from "@/api/services/inventoryService";
import { InventoryFormState, FormName } from "@/app/admin/inventory/page";
import CheckboxList from "./Checkboxlist";
import { Package, Store, Box, MinusCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
import { getCategories, Category } from "@/api/services/categoryService";
interface InventoryFormProps {
    form: InventoryFormState;
    editingId: number | null;
    errors: { [key: string]: string };
    products: SelectOption[];
    stores: SelectOption[];
    allProducts: Product[];
    getDisplayName: (list: SelectOption[], id: number | string | undefined) => string;
    handleValueChange: (name: "product_id" | "store_id", value: string | string[] | undefined) => void;
    handleNumberChange: (name: FormName, value: number) => void;
    handleSubmit: () => Promise<void>;
    handleSubmitWithClassifications?: (classificationData: { [classificationId: number]: number }) => Promise<void>;
    handleCancelEdit: () => void;
    editClassificationData?: { [classificationId: number]: number };
}

interface ClassificationQuantity {
    classificationId: number;
    quantity: number;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
    form,
    editingId,
    errors,
    products,
    stores,
    allProducts,
    getDisplayName,
    handleValueChange,
    handleNumberChange,
    handleSubmit,
    handleSubmitWithClassifications,
    handleCancelEdit,
    editClassificationData
}) => {
    // State để quản lý phân loại sản phẩm
    const [productClassifications, setProductClassifications] = useState<{ [productId: number]: ProductClassification[] }>({});
    const [classificationQuantities, setClassificationQuantities] = useState<{ [classificationId: number]: number }>({});
    const [showClassifications, setShowClassifications] = useState(false);


    // Load classifications khi sản phẩm được chọn
    useEffect(() => {
        const loadClassifications = async () => {
            if (!form.product_id) return;

            const selectedProductIds: number[] = [];
            if (Array.isArray(form.product_id)) {
                selectedProductIds.push(...form.product_id.map(id => Number(id)));
            } else if (form.product_id !== 'all' && form.product_id) {
                selectedProductIds.push(Number(form.product_id));
            }

            if (selectedProductIds.length === 0) return;

            try {
                const newClassifications: { [productId: number]: ProductClassification[] } = {};
                let hasClassifications = false;

                for (const productId of selectedProductIds) {
                    const classifications = await getProductClassifications(productId);
                    newClassifications[productId] = classifications;
                    if (classifications.length > 0) {
                        hasClassifications = true;
                    }
                }

                setProductClassifications(newClassifications);
                setShowClassifications(hasClassifications);
                // Chỉ reset quantities khi không đang edit
                if (!editingId) {
                    setClassificationQuantities({}); // Reset quantities
                }
            } catch (error) {
                console.error("Error loading classifications:", error);
            }
        };

        loadClassifications();
    }, [form.product_id, editingId]);

    // Load edit classification data when editing
    useEffect(() => {
        if (editingId && editClassificationData) {
            setClassificationQuantities(editClassificationData);
        }
    }, [editingId, editClassificationData]);

    const handleClassificationQuantityChange = (classificationId: number, quantity: number) => {
        setClassificationQuantities(prev => ({
            ...prev,
            [classificationId]: Math.max(0, quantity)
        }));
    };

    const handleFormSubmit = async () => {
        try {
            const { createInventory } = await import("@/api/services/inventoryService");
            const productId = form.product_id;
            const storeId = form.store_id;

            // Kiểm tra xem sản phẩm có phân loại hay không
            const hasClassifications = Object.values(productClassifications).some(
                (classifications) => classifications.length > 0
            );

            // Nếu sản phẩm có phân loại → xử lý inventory_details
            if (hasClassifications) {
                const hasClassificationData = Object.values(classificationQuantities).some(qty => qty > 0);

                if (!hasClassificationData) {
                    toast.error("Vui lòng nhập số lượng cho ít nhất một phân loại!");
                    return;
                }

                const totalQuantity = Object.values(classificationQuantities).reduce((sum, qty) => sum + qty, 0);
                const inventoryDetails = Object.entries(classificationQuantities)
                    .filter(([, qty]) => qty > 0)
                    .map(([classificationId, quantity]) => ({
                        classification_attribute_relationship_id: parseInt(classificationId),
                        quantity_stock: quantity,
                        quantity_sold: 0
                    }));

                await createInventory({
                    product_id: productId as string | string[],
                    store_id: storeId as string | string[],
                    quantity_stock: totalQuantity,
                    inventory_details: inventoryDetails,
                });

                toast.success("Tạo tồn kho theo phân loại thành công!");
            }
            // Nếu sản phẩm KHÔNG có phân loại → chỉ gửi quantity_stock
            else {
                if (!form.quantity_stock || form.quantity_stock <= 0) {
                    toast.error("Vui lòng nhập số lượng tồn kho hợp lệ!");
                    return;
                }

                await createInventory({
                    product_id: productId as string | string[],
                    store_id: storeId as string | string[],
                    quantity_stock: form.quantity_stock,
                });

                toast.success("Tạo tồn kho thành công (sản phẩm không có phân loại)!");
            }

            handleCancelEdit();
            window.location.reload();
        } catch (error) {
            console.error("Error submitting inventory form:", error);
            toast.error("Có lỗi xảy ra khi tạo tồn kho!");
        }
    };

    const onNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let numericValue = 0;
        if (value !== "" && value !== null && value !== undefined) {
            const cleanValue = value.replace(/[^0-9]/g, '');
            const parsed = Number(cleanValue);
            numericValue = isNaN(parsed) ? 0 : parsed;
        }
        handleNumberChange(name as FormName, numericValue);
    };

    const productDisplayName = useMemo(() => {
        const id = typeof form.product_id === 'string' ? form.product_id : undefined;
        return editingId && id ? getDisplayName(products, id) : '';
    }, [form.product_id, products, getDisplayName, editingId]);

    const storeDisplayName = useMemo(() => {
        const id = typeof form.store_id === 'string' ? form.store_id : undefined;
        return editingId && id ? getDisplayName(stores, id) : '';
    }, [form.store_id, stores, getDisplayName, editingId]);

    const editingProduct = useMemo(() => {
        const id = typeof form.product_id === 'string' ? Number(form.product_id) : null;
        return allProducts.find(p => p.id === id);
    }, [form.product_id, allProducts]);
    const [categories, setCategories] = React.useState<Category[]>([]);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Đổi màu sắc: Primary (Thêm mới) là Orange, Accent (Sửa) là Red-Orange/Red
    const PRIMARY_COLOR_CLASS = 'orange'; // Dùng orange-600
    const ACCENT_COLOR_CLASS = 'red'; // Dùng red-600

    const colorClass = editingId ? ACCENT_COLOR_CLASS : PRIMARY_COLOR_CLASS;

    // Class CSS cho container dựa trên chế độ
    const modeClass = editingId
        ? 'border-red-200 shadow-2xl transition duration-500 hover:shadow-red-500/20' // Màu đỏ cam cho Sửa
        : 'border-orange-200 shadow-2xl transition duration-500 hover:shadow-orange-500/20'; // Màu cam cho Thêm mới

    // Class CSS cho tiêu đề và các thành phần nhấn
    const accentColor = editingId ? 'text-red-700' : 'text-orange-700';

    // Class CSS cho nút chính
    const btnPrimaryClass = editingId
        ? "bg-red-600 hover:bg-red-700"
        : "bg-orange-600 hover:bg-orange-700";

    // Class CSS cho Icon
    const iconColor = editingId ? 'text-red-500' : 'text-orange-500';

    return (
        <div className={`p-10 rounded-2xl bg-white border ${modeClass}`}>

            <label className={`text-xl font-bold mb-6 flex items-center gap-3 ${accentColor} border-b-2 border-gray-100 pb-3`}>
                <Zap size={18} className={iconColor} />
                {editingId ? `SỬA TỒN KHO ID: ${editingId}` : "QUẢN LÝ TỒN KHO LINH HOẠT"}
            </label>

            <div className={`grid gap-8 ${editingId === null ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

                {editingId === null ? (
                    <>
                        {/* 1. Card chọn sản phẩm */}
                        <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                            <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                                <Package size={18} className="text-orange-500" />
                                1. CHỌN SẢN PHẨM
                            </h4>
                            <div className="p-4">
                                <CheckboxList
                                    name="product_id"
                                    label="Sản phẩm"
                                    options={products}
                                    selectedValues={form.product_id}
                                    onChange={handleValueChange}
                                    error={errors.product_id}
                                    allProducts={allProducts}
                                    categories={categories}
                                />
                            </div>
                        </div>

                        {/* 2. Card chọn cửa hàng */}
                        <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                            <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                                <Store size={18} className="text-orange-500" />
                                2. CHỌN CỬA HÀNG
                            </h4>
                            <div className="p-4">
                                <CheckboxList
                                    name="store_id"
                                    label="Cửa hàng"
                                    options={stores}
                                    selectedValues={form.store_id}
                                    onChange={handleValueChange}
                                    error={errors.store_id}
                                    allProducts={[]}
                                />
                            </div>
                        </div>

                        {/* 3. Phân loại sản phẩm & input số lượng */}
                        <div className="col-span-2 pt-4">
                            <div>
                                <label className="block text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                    <Box size={18} className="text-orange-500" /> CHIA THEO PHÂN LOẠI SẢN PHẨM
                                </label>

                                {Object.keys(productClassifications).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(productClassifications).map(([productId, classifications]) => {
                                            const product = allProducts.find(p => p.id === Number(productId));
                                            return (
                                                <div key={productId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">

                                                    {/* Header sản phẩm: ảnh + tên */}
                                                    <div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                                        {/* Ảnh sản phẩm */}
                                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            {product && (
                                                                <Image
                                                                    src={getProductImageUrl(product)}
                                                                    alt={product.name}
                                                                    width={64}
                                                                    height={64}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Thông tin sản phẩm */}
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="font-semibold text-gray-800 text-base truncate">{product?.name}</h5>
                                                            <p className="text-sm text-gray-500 mt-1">Còn lại: <span className="font-medium text-gray-700">{product?.total_quantity_divided || 0}</span></p>
                                                        </div>

                                                        {/* Input số lượng (không phân loại) */}
                                                        {classifications.length === 0 && (
                                                            <div className="flex flex-col items-end w-24">
                                                                <label className="text-xs font-medium text-gray-600 mb-1">Số lượng</label>
                                                                <input
                                                                    title="quantity_stock"
                                                                    type="number"
                                                                    min={0}
                                                                    value={form.quantity_stock || 0}
                                                                    onChange={onNumberInputChange}
                                                                    name="quantity_stock"
                                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>


                                                    {/* Phân loại sản phẩm nếu có */}
                                                    {classifications.length > 0 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {classifications.map(classification => (
                                                                <div key={classification.id} className="border border-gray-300 rounded-lg p-3 bg-white">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="flex-1">
                                                                            <h6 className="font-medium text-gray-800 text-sm">{classification.name}</h6>
                                                                            <p className="text-xs text-gray-600">
                                                                                {classification.attribute1_name} | {classification.attribute2_name}
                                                                            </p>
                                                                            <p className="text-xs text-green-600 font-medium">
                                                                                Giá: {classification.price?.toLocaleString()}đ
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-xs text-gray-600">Còn</p>
                                                                            <p className="font-medium text-blue-600">{classification.quantity}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <label className="text-sm font-medium text-gray-700 min-w-[40px]">Chia:</label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max={classification.quantity}
                                                                            value={classificationQuantities[classification.id] || 0}
                                                                            onChange={(e) => handleClassificationQuantityChange(classification.id, parseInt(e.target.value) || 0)}
                                                                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>

                                                                    {(classificationQuantities[classification.id] || 0) > classification.quantity && (
                                                                        <p className="text-xs text-red-500 mt-1">Vượt quá số lượng có sẵn!</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                                        <Box size={48} className="mx-auto mb-3 text-gray-400" />
                                        <p>Vui lòng chọn sản phẩm để xem phân loại</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    // --- Khối
                    // <> sửa ---
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* 1. Sản phẩm (Readonly) */}
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                                <label className="text-xs uppercase font-semibold text-red-600 mb-2 flex items-center gap-2">
                                    <Package size={14} className="text-red-500" /> Sản phẩm
                                </label>
                                <div className="flex items-center gap-3">
                                    {editingProduct && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shadow-sm">
                                            <Image
                                                src={getProductImageUrl(editingProduct)}
                                                alt={productDisplayName}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{productDisplayName}</h4>
                                        <p className="text-xs text-red-600">Còn: {editingProduct?.total_quantity_divided || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Cửa hàng (Readonly) */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                                <label className="text-xs uppercase font-semibold text-blue-600 mb-2 flex items-center gap-2">
                                    <Store size={14} className="text-blue-500" /> Cửa hàng
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Store size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{storeDisplayName}</h4>
                                        <p className="text-xs text-blue-600">Điểm nhận hàng</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Phân loại sản phẩm (Compact) */}
                        <div className="col-span-1">
                            <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 shadow-sm">
                                <label className="block text-sm font-semibold text-orange-700 mb-4 flex items-center gap-2">
                                    <Box size={16} className="text-orange-500" />
                                    Chỉnh sửa phân loại
                                </label>

                                {Object.keys(productClassifications).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(productClassifications).map(([productId, classifications]) => {
                                            const product = allProducts.find(p => p.id === Number(productId));
                                            return (
                                                <div key={productId} className="bg-white rounded-lg border border-orange-200 p-4">
                                                    {/* Header sản phẩm compact */}
                                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-orange-100">
                                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                                                            {product && (
                                                                <Image
                                                                    src={getProductImageUrl(product)}
                                                                    alt={product.name}
                                                                    width={32}
                                                                    height={32}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-semibold text-gray-900 text-sm">{product?.name}</h5>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                                                                    Tổng: {product?.total_quantity_divided || 0}
                                                                </span>
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                                    {classifications.length} loại
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {classifications.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                            {classifications.map(classification => (
                                                                <div key={classification.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                                                                    {/* Thông tin phân loại compact */}
                                                                    <div className="mb-3">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                                                            <h6 className="font-medium text-gray-900 text-xs">{classification.name}</h6>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                                                                                {classification.attribute1_name}
                                                                            </p>
                                                                            <p className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                                                                                {classification.attribute2_name}
                                                                            </p>
                                                                        </div>
                                                                        <div className="mt-2">
                                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                                                Còn: {classification.quantity}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Input số lượng compact */}
                                                                    <div>
                                                                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                                            Số lượng:
                                                                        </label>
                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max={classification.quantity + (classificationQuantities[classification.id] || 0)}
                                                                                value={classificationQuantities[classification.id] || 0}
                                                                                onChange={(e) => handleClassificationQuantityChange(classification.id, parseInt(e.target.value) || 0)}
                                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono text-center focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                                                placeholder="0"
                                                                            />
                                                                            <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                                                                                <span className="text-xs text-gray-400">/{classification.quantity + (classificationQuantities[classification.id] || 0)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <label className="text-sm font-medium text-gray-700">Số lượng:</label>
                                                            <input
                                                                title='quantity_stock'
                                                                type="number"
                                                                min={0}
                                                                value={form.quantity_stock || 0}
                                                                onChange={onNumberInputChange} // hàm bạn đã có
                                                                name="quantity_stock"
                                                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-orange-500"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white rounded border border-dashed border-orange-300">
                                        <Box size={40} className="mx-auto mb-3 text-orange-400" />
                                        <h5 className="font-medium text-orange-600 mb-1">Không có phân loại</h5>
                                        <p className="text-orange-500 text-sm">Sản phẩm này chưa có phân loại nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* --- Button controls --- */}
            <div className="flex justify-end gap-3 pt-8 border-t mt-8 border-gray-100">
                <button
                    onClick={handleCancelEdit}
                    className="px-8 py-3 rounded-xl font-bold shadow-lg transition duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2 transform hover:scale-[1.02]"
                >
                    {editingId ? "HỦY BỎ" : "ĐÓNG FORM"}
                </button>

                <button
                    onClick={handleFormSubmit}
                    className={`px-8 py-3 rounded-xl font-extrabold shadow-xl transition duration-200 text-white flex items-center gap-2 transform hover:scale-[1.02] ${btnPrimaryClass}`}
                >
                    {editingId ? "CẬP NHẬT TỒN KHO" : "THÊM MỚI TỒN KHO"}
                </button>
            </div>
        </div>
    );
};

export default InventoryForm;