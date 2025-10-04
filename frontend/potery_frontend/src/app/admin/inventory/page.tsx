// src/app/admin/inventory/page.tsx (Final Code)

"use client";
import React, { useEffect, useState } from "react";
import {
    listInventories,
    createInventory,
    updateInventory,
    deleteInventory,
    listDropdownProducts,
    listDropdownStores,
    Inventory,
    CreateInventoryDto,
    UpdateInventoryDto,
    ListInventoryDto,
    SelectOption,
} from "@/api/services/inventoryService"; // Import các hàm API real

export default function InventoryPage() {
    // -----------------------------------------------------
    // 1. State
    // -----------------------------------------------------
    const [inventories, setInventories] = useState<Inventory[]>([]); 
    // State cho dữ liệu dropdown (tải từ API thực)
    const [products, setProducts] = useState<SelectOption[]>([]); 
    const [stores, setStores] = useState<SelectOption[]>([]); 
    
    // Form data
    const [form, setForm] = useState<Partial<CreateInventoryDto & UpdateInventoryDto> & { quantity_sold?: number }>({
        product_id: undefined,
        store_id: undefined,
        quantity_stock: 0,
        quantity_sold: 0, 
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // -----------------------------------------------------
    // 2. Data Fetching
    // -----------------------------------------------------
    useEffect(() => {
        fetchData();
        fetchDropdownData(); 
    }, []); 

    const fetchDropdownData = async () => {
        try {
            // Lấy danh sách Sản phẩm (REAL API)
            const productsData = await listDropdownProducts();
            setProducts(productsData);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
        }
        
        try {
            // Lấy danh sách Cửa hàng (REAL API)
            const storesData = await listDropdownStores();
            setStores(storesData);
        } catch (error) {
            console.error("Lỗi khi tải danh sách cửa hàng:", error);
        }
    }

    const fetchData = async () => {
        try {
            const listDto: ListInventoryDto = { page: 1, size: 9999 }; // Gửi tham số lớn để lấy hết data
            const invData = await listInventories(listDto); 
            setInventories(invData); 
            
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu tồn kho:", error);
            setInventories([]);
        }
    };

    // -----------------------------------------------------
    // 3. Handlers
    // -----------------------------------------------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const finalValue = ['quantity_stock', 'quantity_sold', 'product_id', 'store_id'].includes(name) 
                            ? (value === "" ? undefined : Number(value)) 
                            : value;

        setForm({ ...form, [name]: finalValue });
        setErrors({ ...errors, [name]: "" });
    };

    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};
        if (isCreating) {
            // Yêu cầu ID phải là số hợp lệ
            if (!form.product_id || isNaN(Number(form.product_id))) newErrors.product_id = "Chọn sản phẩm";
            if (!form.store_id || isNaN(Number(form.store_id))) newErrors.store_id = "Chọn cửa hàng";
        }
        if (form.quantity_stock === undefined || form.quantity_stock < 0) newErrors.quantity_stock = "Số lượng tồn kho không hợp lệ";
        if (form.quantity_sold !== undefined && form.quantity_sold < 0) newErrors.quantity_sold = "Số lượng bán không hợp lệ";
        return newErrors;
    };

    const handleSubmit = async () => {
        const isCreating = !editingId;
        const newErrors = validate(isCreating);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (editingId) {
                const updateDto: UpdateInventoryDto = {
                    quantity_stock: form.quantity_stock,
                    quantity_sold: form.quantity_sold
                };
                await updateInventory(editingId, updateDto);
                setEditingId(null);
            } else {
                const createDto: CreateInventoryDto = {
                    // Chuyển về number/string tùy theo yêu cầu chính xác của NestJS service
                    product_id: Number(form.product_id), 
                    store_id: Number(form.store_id),
                    quantity_stock: form.quantity_stock as number
                };
                await createInventory(createDto);
            }
            
            setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 });
            setErrors({});
            fetchData(); 

        } catch (error) {
            console.error("Lỗi API:", error);
            alert("Đã xảy ra lỗi khi lưu tồn kho! (Kiểm tra console)");
        }
    };

    const handleEdit = (item: Inventory) => {
        setForm({
            product_id: item.product_id,
            store_id: item.store_id,
            quantity_stock: item.quantity_stock,
            quantity_sold: item.quantity_sold
        });
        setEditingId(item.id);
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        if (confirm("Bạn có chắc muốn xoá tồn kho này?")) {
            await deleteInventory(id);
            fetchData();
        }
    };
    
    // Hàm tìm tên Product/Store dựa trên ID để hiển thị trong bảng
    const getDisplayName = (list: SelectOption[], id: number | undefined) => {
        if (!id) return `ID: ${id}`;
        return list.find(item => item.id === id)?.name || `ID: ${id}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Tồn kho
                </h2>

                {/* Form Thêm/Sửa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    
                    {/* Product ID (Thêm mới) */}
                    {editingId === null && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                            <select title="Chọn Sản phẩm"
                                name="product_id"
                                value={form.product_id ?? ""} 
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">-- Chọn Sản phẩm --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                        </div>
                    )}

                    {/* Store ID (Thêm mới) */}
                    {editingId === null && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                            <select title="Chọn Cửa hàng"
                                name="store_id"
                                value={form.store_id ?? ""}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">-- Chọn Cửa hàng --</option>
                                {stores.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.store_id && <p className="text-red-500 text-xs mt-1">{errors.store_id}</p>}
                        </div>
                    )}
                    
                    {/* Số lượng tồn kho (Stock) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SL Tồn kho</label>
                        <input
                            type="number"
                            name="quantity_stock"
                            placeholder="Nhập SL Tồn"
                            value={form.quantity_stock ?? 0}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.quantity_stock && <p className="text-red-500 text-xs mt-1">{errors.quantity_stock}</p>}
                    </div>

                    {/* Số lượng đã bán (Sửa) */}
                    {editingId !== null && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SL Đã bán</label>
                            <input
                                type="number"
                                name="quantity_sold"
                                placeholder="Nhập SL Bán"
                                value={form.quantity_sold ?? 0}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.quantity_sold && <p className="text-red-500 text-xs mt-1">{errors.quantity_sold}</p>}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleSubmit}
                        className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
                            editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                    >
                        {editingId ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Sản phẩm</th>
                                <th className="px-4 py-3 text-left">Cửa hàng</th>
                                <th className="px-4 py-3 text-left">Tồn kho</th>
                                <th className="px-4 py-3 text-left">Đã bán</th>
                                <th className="px-4 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(inventories) && inventories.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
                                >
                                    <td className="px-4 py-3">{item.id}</td>
                                    {/* Hiển thị tên từ danh sách Dropdown nếu có, nếu không hiển thị ID */}
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {getDisplayName(products, item.product_id)}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {getDisplayName(stores, item.store_id)}
                                    </td>
                                    <td className="px-4 py-3">{item.quantity_stock}</td>
                                    <td className="px-4 py-3">{item.quantity_sold}</td>
                                    <td className="px-4 py-3 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-medium shadow"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {inventories.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">
                                        Không có dữ liệu tồn kho
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Tổng cộng {inventories.length} mục.
                </div>
            </div>
        </div>
    );
}