// src/components/inventory/InventoryForm.tsx (MÀU CHỦ ĐẠO LÀ MÀU CAM)

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { SelectOption, Product, getProductClassifications, ProductClassification, getProductImageUrl } from "@/api/services/inventoryService";
import { InventoryFormState, FormName } from "@/app/admin/inventory/page";
import CheckboxList from "./Checkboxlist";
import { Package, Store, Box, Zap } from 'lucide-react';
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

    handleCancelEdit: () => void;
    editClassificationData?: { [classificationId: number]: number };
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
    handleCancelEdit,
    editClassificationData
}) => {
    // State để quản lý phân loại sản phẩm
    const [productClassifications, setProductClassifications] = useState<{ [productId: number]: ProductClassification[] }>({});
    const [classificationQuantities, setClassificationQuantities] = useState<{ [classificationId: number]: number }>({});
    const [, setShowClassifications] = useState(false);
    // State để quản lý số lượng riêng cho từng sản phẩm không có phân loại
    const [individualQuantities, setIndividualQuantities] = useState<{ [productId: number]: number }>({});
    // State để quản lý lỗi validation
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});


    // Load classifications khi sản phẩm được chọn
    useEffect(() => {
        const loadClassifications = async () => {
            if (!form.product_id) {
                // Reset state khi không có sản phẩm nào được chọn
                setProductClassifications({});
                setClassificationQuantities({});
                setIndividualQuantities({});
                setValidationErrors({});
                setShowClassifications(false);
                return;
            }

            const selectedProductIds: number[] = [];
            if (Array.isArray(form.product_id)) {
                selectedProductIds.push(...form.product_id.map(id => Number(id)));
            } else if (form.product_id === 'all') {
                // Khi chọn "all", thêm tất cả sản phẩm vào danh sách
                selectedProductIds.push(...products.map(p => p.id));
            } else if (form.product_id !== 'all' && form.product_id) {
                selectedProductIds.push(Number(form.product_id));
            }

            if (selectedProductIds.length === 0) {
                // Reset state khi không có ID hợp lệ
                setProductClassifications({});
                setClassificationQuantities({});
                setIndividualQuantities({});
                setValidationErrors({});
                setShowClassifications(false);
                return;
            }

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
                    setClassificationQuantities({}); // Reset quantities hoàn toàn khi tạo mới
                    setIndividualQuantities({}); // Reset individual quantities
                    setValidationErrors({}); // Reset validation errors
                }
            } catch (error) {
                console.error("Error loading classifications:", error);
            }
        };

        loadClassifications();
    }, [form.product_id, editingId, products]);

    // Filter classification quantities khi productClassifications thay đổi
    useEffect(() => {
        if (!editingId && Object.keys(productClassifications).length > 0) {
            // Chỉ giữ lại quantities của classifications thuộc sản phẩm hiện tại
            const validClassificationIds = new Set<number>();
            Object.values(productClassifications).forEach(classifications => {
                classifications.forEach(classification => {
                    validClassificationIds.add(classification.id);
                });
            });

            setClassificationQuantities(prev => {
                const filtered: { [classificationId: number]: number } = {};
                Object.entries(prev).forEach(([classificationId, quantity]) => {
                    if (validClassificationIds.has(parseInt(classificationId))) {
                        filtered[parseInt(classificationId)] = quantity;
                    }
                });
                return filtered;
            });
        }
    }, [productClassifications, editingId]);

    // Load edit classification data when editing
    useEffect(() => {
        if (editingId && editClassificationData) {
            setClassificationQuantities(editClassificationData);
        }
    }, [editingId, editClassificationData]);

    const handleClassificationQuantityChange = (classificationId: number, quantity: number) => {
        // Tìm classification để lấy max quantity
        let maxQuantity = 0;
        Object.values(productClassifications).forEach(classifications => {
            const classification = classifications.find(c => c.id === classificationId);
            if (classification) {
                maxQuantity = classification.quantity;
            }
        });

        // Lưu giá trị thực tế mà người dùng nhập (không giới hạn)
        setClassificationQuantities(prev => ({
            ...prev,
            [classificationId]: Math.max(0, quantity) // Chỉ giới hạn >= 0
        }));

        // Cập nhật lỗi validation
        const errorKey = `classification_${classificationId}`;
        if (quantity > maxQuantity) {
            setValidationErrors(prev => ({
                ...prev,
                [errorKey]: `Vượt quá số lượng có sẵn (${maxQuantity})`
            }));
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    }; const handleIndividualQuantityChange = (productId: number, quantity: number) => {
        const product = allProducts.find(p => p.id === productId);
        const maxQuantity = product?.total_quantity_divided || 0;

        // Lưu giá trị thực tế mà người dùng nhập (không giới hạn)
        setIndividualQuantities(prev => ({
            ...prev,
            [productId]: Math.max(0, quantity) // Chỉ giới hạn >= 0
        }));

        // Cập nhật lỗi validation
        const errorKey = `individual_${productId}`;
        if (quantity > maxQuantity) {
            setValidationErrors(prev => ({
                ...prev,
                [errorKey]: `Vượt quá số lượng có sẵn (${maxQuantity})`
            }));
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };    // Kiểm tra xem có thể submit form không
    const canSubmit = useMemo(() => {
        // Đối với chế độ edit, luôn cho phép submit
        if (editingId) return Object.keys(validationErrors).length === 0;

        // Đối với chế độ tạo mới, kiểm tra đã chọn sản phẩm và cửa hàng chưa
        const hasValidProduct = form.product_id &&
            form.product_id !== undefined &&
            (Array.isArray(form.product_id) ? form.product_id.length > 0 : form.product_id !== '');

        const hasValidStore = form.store_id &&
            form.store_id !== undefined &&
            (Array.isArray(form.store_id) ? form.store_id.length > 0 : form.store_id !== '');

        // Kiểm tra không có lỗi validation
        const hasNoValidationErrors = Object.keys(validationErrors).length === 0;

        return hasValidProduct && hasValidStore && hasNoValidationErrors;
    }, [editingId, form.product_id, form.store_id, validationErrors]);

    const handleFormSubmit = async () => {
        // Kiểm tra lỗi validation trước khi submit
        if (Object.keys(validationErrors).length > 0) {
            toast.error("Vui lòng sửa lại các lỗi validation trước khi gửi!");
            return;
        }

        try {
            const { createInventory, updateInventory } = await import("@/api/services/inventoryService");
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

                const inventoryDetails = Object.entries(classificationQuantities)
                    .filter(([, qty]) => qty > 0)
                    .map(([classificationId, quantity]) => ({
                        classification_attribute_relationship_id: parseInt(classificationId),
                        quantity_stock: quantity,
                        quantity_sold: 0
                    }));

                if (editingId) {
                    // CẬP NHẬT tồn kho với phân loại
                    await updateInventory(editingId, {
                        inventory_details: inventoryDetails
                    });
                    toast.success(`Cập nhật tồn kho thành công!`);
                } else {
                    // TẠO MỚI tồn kho với phân loại
                    const totalQuantity = Object.values(classificationQuantities).reduce((sum, qty) => sum + qty, 0);
                    await createInventory({
                        product_id: productId as string | string[],
                        store_id: storeId as string | string[],
                        quantity_stock: totalQuantity,
                        inventory_details: inventoryDetails,
                    });
                    toast.success("Tạo tồn kho sản phẩm có phân loại thành công!");
                }
            }
            // Nếu sản phẩm KHÔNG có phân loại → chỉ gửi quantity_stock
            else {
                // Kiểm tra số lượng cho từng sản phẩm
                const selectedProductIds: number[] = [];
                if (Array.isArray(form.product_id)) {
                    selectedProductIds.push(...form.product_id.map(id => Number(id)));
                } else if (form.product_id === 'all') {
                    selectedProductIds.push(...products.map(p => p.id));
                } else if (form.product_id !== 'all' && form.product_id) {
                    selectedProductIds.push(Number(form.product_id));
                }

                const hasValidQuantity = selectedProductIds.some(productId =>
                    (individualQuantities[productId] || 0) > 0
                );

                if (!hasValidQuantity && (!form.quantity_stock || form.quantity_stock <= 0)) {
                    toast.error("Vui lòng nhập số lượng tồn kho hợp lệ!");
                    return;
                }

                if (editingId) {
                    // CẬP NHẬT tồn kho không phân loại
                    const productId = Number(form.product_id);
                    const quantity = individualQuantities[productId] || form.quantity_stock || 0;
                    await updateInventory(editingId, {
                        quantity_stock: quantity,
                        quantity_sold: form.quantity_sold
                    });
                    toast.success(`Cập nhật tồn kho thành công!`);
                } else {
                    // TẠO MỚI tồn kho không phân loại - tạo cho từng sản phẩm riêng biệt
                    for (const productId of selectedProductIds) {
                        const quantity = individualQuantities[productId] || 0;
                        if (quantity > 0) {
                            await createInventory({
                                product_id: productId.toString(),
                                store_id: storeId as string | string[],
                                quantity_stock: quantity,
                            });
                        }
                    }
                    toast.success("Tạo tồn kho sản phẩm không có phân loại thành công!");
                }
            }

            handleCancelEdit();
            window.location.reload();
        } catch (error) {
            console.error("Error submitting inventory form:", error);
            toast.error(editingId ? "Có lỗi xảy ra khi cập nhật tồn kho!" : "Có lỗi xảy ra khi tạo tồn kho!");
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
                {editingId ? `SỬA TỒN KHO ID: ${editingId}` : "Quản lý tồn kho linh hoạt"}
            </label>

            <div className={`grid gap-8 ${editingId === null ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

                {editingId === null ? (
                    <>
                        {/* 1. Card chọn sản phẩm */}
                        <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                            <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                                <Package size={18} className="text-orange-500" />
                                1. Chọn sản phẩm
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
                                2. Chọn cửa hàng
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
                                <label className="block text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                    <Box size={18} className="text-orange-500" /> Chi tiết sản phẩm chia  cho các cửa hàng
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
                                                            <h5 className="text-gray-800 text-sm truncate">{product?.name}</h5>
                                                            <p className="text-sm text-gray-500 mt-1">Còn lại: <span className="text-gray-500">{product?.total_quantity_divided || 0}</span></p>
                                                        </div>

                                                        {/* Input số lượng (không phân loại) */}
                                                        {classifications.length === 0 && (
                                                            <div className="flex flex-col items-end w-32">
                                                                <label className="text-xs font-medium text-gray-600 mb-1">Số lượng</label>
                                                                <div className="relative w-full">
                                                                    <input
                                                                        title="individual_quantity"
                                                                        type="number"
                                                                        min={0}
                                                                        value={individualQuantities[product?.id || 0] || 0}
                                                                        onChange={(e) => handleIndividualQuantityChange(product?.id || 0, parseInt(e.target.value) || 0)}
                                                                        className={`w-full border rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 transition ${validationErrors[`individual_${product?.id || 0}`]
                                                                            ? 'border-red-400 bg-red-50 focus:ring-red-500'
                                                                            : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                                                                            }`}
                                                                    />
                                                                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                                                        <span className="text-xs text-gray-400">/{product?.total_quantity_divided || 0}</span>
                                                                    </div>
                                                                </div>
                                                                {validationErrors[`individual_${product?.id || 0}`] && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors[`individual_${product?.id || 0}`]}</p>
                                                                )}
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
                                                                        <div className="relative flex-1">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={classificationQuantities[classification.id] || 0}
                                                                                onChange={(e) => handleClassificationQuantityChange(classification.id, parseInt(e.target.value) || 0)}
                                                                                className={`w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500 pr-12 ${validationErrors[`classification_${classification.id}`]
                                                                                    ? 'border-red-400 bg-red-50 focus:ring-red-500'
                                                                                    : 'border-gray-300'
                                                                                    }`}
                                                                                placeholder="0"
                                                                            />
                                                                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                                                                <span className="text-xs text-gray-400">/{classification.quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {validationErrors[`classification_${classification.id}`] && (
                                                                        <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors[`classification_${classification.id}`]}</p>
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
                                                                <span
                                                                    className={
                                                                        classifications.length > 0
                                                                            ? "text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium"
                                                                            : "text-xs text-gray-500 px-2 py-1 font-medium"
                                                                    }
                                                                >
                                                                    {classifications.length > 0 ? `${classifications.length} loại` : 'Không có phân loại'}
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
                                                                                value={classificationQuantities[classification.id] || 0}
                                                                                onChange={(e) => handleClassificationQuantityChange(classification.id, parseInt(e.target.value) || 0)}
                                                                                className={`w-full border rounded px-2 py-1 text-sm font-mono text-center focus:ring-1 focus:border-orange-500 outline-none ${validationErrors[`classification_${classification.id}`]
                                                                                    ? 'border-red-400 bg-red-50 focus:ring-red-500'
                                                                                    : 'border-gray-300 focus:ring-orange-500'
                                                                                    }`}
                                                                                placeholder="0"
                                                                            />
                                                                            <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                                                                                <span className="text-xs text-gray-400">/{classification.quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                        {validationErrors[`classification_${classification.id}`] && (
                                                                            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors[`classification_${classification.id}`]}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <label className="text-sm font-medium text-gray-700">Số lượng:</label>
                                                            <div className="flex flex-col w-32">
                                                                <div className="relative w-full">
                                                                    <input
                                                                        title='quantity_stock'
                                                                        type="number"
                                                                        min={0}
                                                                        value={form.quantity_stock || 0}
                                                                        onChange={onNumberInputChange}
                                                                        name="quantity_stock"
                                                                        className={`w-full border rounded px-2 py-1 text-sm text-center focus:ring-1 ${validationErrors['edit_quantity_stock']
                                                                            ? 'border-red-400 bg-red-50 focus:ring-red-500'
                                                                            : 'border-gray-300 focus:ring-orange-500'
                                                                            }`}
                                                                    />
                                                                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                                                        <span className="text-xs text-gray-400">/{product?.total_quantity_divided || 0}</span>
                                                                    </div>
                                                                </div>
                                                                {validationErrors['edit_quantity_stock'] && (
                                                                    <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors['edit_quantity_stock']}</p>
                                                                )}
                                                            </div>
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
            <div className="pt-8 border-t mt-8 border-gray-100">
                {/* Thông báo hướng dẫn khi button bị disable */}
                {!canSubmit && !editingId && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700 font-medium text-center">
                            Vui lòng chọn ít nhất 1 sản phẩm và 1 cửa hàng để tiếp tục
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCancelEdit}
                        className="px-8 py-3 rounded-xl font-bold shadow-lg transition duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2 transform hover:scale-[1.02]"
                    >
                        {editingId ? "HỦY BỎ" : "ĐÓNG FORM"}
                    </button>

                    <button
                        onClick={handleFormSubmit}
                        disabled={!canSubmit}
                        className={`px-8 py-3 rounded-xl font-extrabold shadow-xl transition duration-200 text-white flex items-center gap-2 transform ${canSubmit
                            ? `hover:scale-[1.02] ${btnPrimaryClass}`
                            : 'bg-gray-400 cursor-not-allowed opacity-50'
                            }`}
                    >
                        {editingId ? "CẬP NHẬT TỒN KHO" : "THÊM MỚI TỒN KHO"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryForm;