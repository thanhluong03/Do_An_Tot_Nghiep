// src/app/admin/inventory/page.tsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  SelectOption,
} from "@/api/services/inventoryService";

import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryTable from "@/components/inventory/InventoryTable";
import Pagination from "@/components/inventory/Pagination";

export interface InventoryFormState {
  product_id: string | string[] | undefined;
  store_id: string | string[] | undefined;
  quantity_stock: number;
  quantity_sold: number;
}
export type FormName = "product_id" | "store_id" | "quantity_stock" | "quantity_sold";

export default function InventoryPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [stores, setStores] = useState<SelectOption[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);

  // --- Bộ lọc theo thời gian ---
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [form, setForm] = useState<InventoryFormState>({
    product_id: undefined,
    store_id: undefined,
    quantity_stock: 0,
    quantity_sold: 0,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getDisplayName = useCallback(
    (list: SelectOption[], id: number | string | undefined): string => {
      if (id === undefined || id === null) return "";
      const numericId = Number(id);
      if (isNaN(numericId)) return "";
      const found = list.find((item) => Number(item.id) === numericId);
      return found?.name || `ID: ${id}`;
    },
    []
  );

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const fetchDropdownData = async () => {
    try {
      const [productRes, storeRes] = await Promise.all([
        listDropdownProducts(),
        listDropdownStores(),
      ]);
      setProducts(Array.isArray(productRes) ? productRes : []);
      setStores(Array.isArray(storeRes) ? storeRes : []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách sản phẩm hoặc cửa hàng.");
      setProducts([]);
      setStores([]);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listInventories({
        page: currentPage,
        size: pageSize,
        key: searchQuery,
        store_id: selectedStoreId === 0 ? undefined : selectedStoreId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      const inventoryList = res.data || [];
      setInventories(Array.isArray(inventoryList) ? inventoryList : []);
      setTotalItems(res.total || inventoryList.length);
      setCurrentPage(res.page || currentPage);
      setPageSize(res.size || pageSize);
    } catch (error) {
      toast.error("Không thể tải danh sách tồn kho.");
      setInventories([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedStoreId, fromDate, toDate]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData();
    }
  }, [selectedStoreId, searchQuery, fromDate, toDate]);

  const handleNumberChange = (name: FormName, value: number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleValueChange = (name: "product_id" | "store_id", value: string | string[] | undefined) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 });
    setErrors({});
  };

  const handleEdit = (item: Inventory) => {
    setEditingId(item.id);
    setForm({
      product_id: String(item.product_id),
      store_id: String(item.store_id),
      quantity_stock: item.quantity_stock || 0,
      quantity_sold: item.quantity_sold || 0,
    });
    toast(`Đang chỉnh sửa tồn kho ID ${item.id}`, { icon: "✏️" });
  };

  const handleDelete = async (id: number) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="font-medium mb-2">Bạn có chắc muốn xoá tồn kho ID <b>{id}</b>?</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteInventory(id);
                  toast.success(`Đã xoá tồn kho ID ${id}!`);
                  fetchData();
                } catch {
                  toast.error("Không thể xoá tồn kho!");
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
            >
              Xoá
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-1 rounded-md"
            >
              Huỷ
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  const validate = (isCreating: boolean) => {
    const newErrors: { [key: string]: string } = {};
    if (isCreating) {
      if (!form.product_id) newErrors.product_id = "Vui lòng chọn sản phẩm.";
      if (!form.store_id) newErrors.store_id = "Vui lòng chọn cửa hàng.";
    }
    if (form.quantity_stock < 0) newErrors.quantity_stock = "SL Tồn kho phải ≥ 0.";
    if (editingId !== null && form.quantity_sold < 0)
      newErrors.quantity_sold = "SL Đã bán phải ≥ 0.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isCreating = editingId === null;
    if (!validate(isCreating)) return;

    try {
      if (isCreating) {
        const createDto: CreateInventoryDto = {
          product_id: form.product_id || "all",
          store_id: form.store_id || "all",
          quantity_stock: form.quantity_stock,
        };
        await createInventory(createDto);
        toast.success("Tạo tồn kho thành công!");
      } else {
        const updateDto: UpdateInventoryDto = {
          quantity_stock: form.quantity_stock,
          quantity_sold: form.quantity_sold,
        };
        await updateInventory(editingId!, updateDto);
        toast.success(`Cập nhật tồn kho ID ${editingId} thành công!`);
      }

      handleCancelEdit();
      fetchData();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xử lý yêu cầu!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <Toaster position="top-center" />
      <div className="w-full mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8 tracking-wide">
          Quản lý Tồn kho
        </h2>

        {/* --- FORM THÊM/SỬA --- */}
        <InventoryForm
          form={form}
          editingId={editingId}
          errors={errors}
          products={products}
          stores={stores}
          getDisplayName={getDisplayName}
          handleValueChange={handleValueChange}
          handleNumberChange={handleNumberChange}
          handleSubmit={handleSubmit}
          handleCancelEdit={handleCancelEdit}
        />

        {/* --- BỘ LỌC & TÌM KIẾM --- */}
        <div className="mt-10 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            🔍 Bộ lọc & Tìm kiếm
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cửa hàng
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>-- Tất cả --</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm (SP / Cửa hàng)
              </label>
              <input
                type="text"
                placeholder="Nhập từ khoá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 flex justify-end gap-6">
            <p>
              Tổng số mục:{" "}
              <span className="font-semibold text-gray-800">{totalItems}</span>
            </p>
            <p>
              Đang hiển thị:{" "}
              <span className="font-semibold text-gray-800">{inventories.length}</span>
            </p>
          </div>
        </div>

        {/* --- BẢNG DỮ LIỆU --- */}
        {loading ? (
          <div className="text-center py-10 text-lg text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <InventoryTable
            inventories={inventories}
            products={products}
            stores={stores}
            getDisplayName={getDisplayName}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            totalItems={totalItems}
          />
        )}

        <Pagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
