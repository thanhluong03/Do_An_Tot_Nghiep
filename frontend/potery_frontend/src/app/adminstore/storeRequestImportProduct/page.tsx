"use client";

import React, { useEffect, useState } from "react";
import {
  createImportRequest,
  CreateImportRequestDto
} from "@/api/services/importRequestService";

import { getProductImageUrl, Product as InventoryProduct } from "@/api/services/inventoryService";
import { productApi } from "@/api/modules/products";
import { Product as ApiProduct } from "@/types/product";
import { getUserDetail } from "@/api/services/userService";

import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import CheckboxList from "@/components/common/CheckBoxList";

import ImportRequestList from "@/components/adminStore/ImportRequestList";
import { getStoreById } from "@/api/services/storeService";
import { Category, getCategories } from "@/api/services/categoryService";

// Function to map ApiProduct to InventoryProduct
const mapApiProductToInventory = (apiProduct: ApiProduct): InventoryProduct => {
  return {
    id: Number(apiProduct.id),
    name: apiProduct.name,
    price: apiProduct.price,
    quantity: apiProduct.stock,
    total_quantity_divided: apiProduct.stock,
    images: apiProduct.images.map(img => ({ image_data: img })),
    main_image: apiProduct.images[0] || undefined,
    relationships: apiProduct.relationships?.map(rel => ({
      id: rel.id || 0,
      product_attribute_id_1: rel.product_attribute_id_1,
      product_attribute_id_2: rel.product_attribute_id_2,
      price: rel.price || 0,
      quantity: rel.quantity || 0,
      attribute1_name: rel.attribute1_name || '',
      attribute2_name: rel.attribute2_name || '',
    })) || [],
    classifications: apiProduct.classifications || [],
  };
};

interface SelectedProduct {
  product_id: number;
  quantity: number;
  classification_id?: number;
}

export default function CreateImportRequestPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [note, setNote] = useState("");
  const [storeId, setStoreId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState("...");
  const [isLoading, setIsLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  // 👇 NEW: ẨN/HIỆN FORM
  const [showCreateForm, setShowCreateForm] = useState(false);

  const findProduct = (id: number, list: InventoryProduct[]) => list.find(p => p.id === id);

  const findProductImage = (id: number, list: InventoryProduct[]) => {
    const product = findProduct(id, list);
    return product ? getProductImageUrl(product) : "/no-image.jpg";
  };
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      try {
        // 1️⃣ Lấy adminID
        const adminId = Number(localStorage.getItem("adminID"));
        if (!adminId) throw new Error("Không tìm thấy adminID trong localStorage");

        // 2️⃣ Lấy thông tin user → storeId
        const user = await getUserDetail(adminId);
        const currentStoreId = user.store_id ?? 2; // fallback 2 nếu không có
        if (!user.store_id) toast.error("User không có store, dùng store mặc định ID = 2");
        setStoreId(currentStoreId);

        // 3️⃣ Lấy thông tin store → storeName
        try {
          const store = await getStoreById(currentStoreId); // nhớ sửa getStoreById trả về res.data[0]
          setStoreName(store.store_name);
        } catch (err) {
          console.error(err);
          setStoreName(`Cửa hàng ID ${currentStoreId} (Không tải được tên)`);
          toast.error(`Không tải được tên cửa hàng ID ${currentStoreId}`);
        }

        // 4️⃣ Lấy danh sách sản phẩm theo cửa hàng
        try {
          const res = await productApi.getProductsByStore(currentStoreId);
          const mappedProducts = res.products.map(mapApiProductToInventory);
          setProducts(mappedProducts);
        } catch {
          toast.error("Không tải được danh sách sản phẩm theo cửa hàng");
        }
        try {
          const catRes = await getCategories(); // GỌI API LẤY DANH MỤC
          setCategories(catRes);
        } catch {
          toast.error("Không tải được danh sách danh mục");
        }

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Lỗi khi khởi tạo dữ liệu";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Handle chọn sản phẩm
  const handleProductChange = (name: "product_id", value: string | string[] | undefined) => {
    if (!value) return setSelectedProducts([]);

    const ids = Array.isArray(value) ? value.map(Number) : [Number(value)];

    setSelectedProducts(prev => {
      const newSelected: SelectedProduct[] = [];

      ids.forEach(id => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        if (Array.isArray(product.relationships) && product.relationships.length > 0) {
          product.relationships.forEach(r => {
            const existing = prev.find(
              sp => sp.product_id === id && sp.classification_id === r.id
            );
            newSelected.push(existing ?? { product_id: id, classification_id: r.id, quantity: 0 });
          });
        } else {
          const existing = prev.find(sp => sp.product_id === id && !sp.classification_id);
          newSelected.push(existing ?? { product_id: id, quantity: 0 });
        }
      });

      return newSelected;
    });
  };

  // Handle đổi quantity
  const handleQuantityChange = (
    productId: number,
    classificationId: number | undefined,
    quantity: number
  ) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.product_id === productId && p.classification_id === classificationId
          ? { ...p, quantity: Math.max(quantity, 0) }
          : p
      )
    );
  };

  const handleSubmit = async () => {
    const valid = selectedProducts.filter(p => p.quantity > 0);

    if (!storeId || valid.length === 0)
      return toast.error("Chọn sản phẩm và nhập số lượng hợp lệ");

    const payload: CreateImportRequestDto = {
      store_id: storeId,
      note,
      importRequestDetails: valid.map(p => ({
        product_id: p.product_id,
        classification_attribute_relationship_id: p.classification_id,
        requested_quantity: p.quantity
      }))
    }; try {
      await createImportRequest(payload);
      toast.success("Tạo yêu cầu thành công!");

      // Reset form
      setSelectedProducts([]);
      setNote("");
      setDataVersion(prev => prev + 1);
      // 👇 Tự đóng form sau khi tạo
      setShowCreateForm(false);

    } catch (error) {
      console.error("Error creating import request:", error);
      toast.error("Lỗi khi tạo yêu cầu");
    }
  };

  // Group selections
  const groupedSelections = selectedProducts.reduce((acc, sp) => {
    const product = products.find(p => p.id === sp.product_id);
    if (!product) return acc;

    if (!acc[sp.product_id]) acc[sp.product_id] = { product, selections: [] };

    acc[sp.product_id].selections.push(sp);
    return acc;
  }, {} as Record<number, { product: InventoryProduct; selections: SelectedProduct[] }>);

  if (isLoading) return <p className="text-center p-6">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 max-w-full bg-white rounded-xl shadow-md mt-1">
      <Toaster position="top-right" />
      {/* BUTTON SHOW FORM */}
      {!showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-orange-600 text-white rounded-xl shadow hover:bg-orange-700 transition font-semibold mb-6"
        >
          + Thêm yêu cầu nhập hàng cửa hàng
        </button>
      )}

      {/* FORM TẠO YÊU CẦU */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-10">

          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Tạo yêu cầu nhập hàng
          </h1>
          <p className="text-xl font-semibold text-orange-600 mb-6 border-b pb-3">
            Chi nhánh cửa hàng:
            <span className="font-bold ml-1">
              {storeName}
            </span>
          </p>
          {/* GHI CHÚ + CHỌN SP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <CheckboxList
                name="product_id"
                label="Chọn sản phẩm cần nhập"
                options={products.map(p => ({ id: p.id, name: p.name }))}
                selectedValues={Object.keys(groupedSelections).map(String)}
                allProducts={products}
                categories={categories}
                onChange={handleProductChange}
              />
            </div>

            {/* NOTE */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <label className="font-semibold text-gray-700 block mb-2 text-lg">Ghi chú</label>
              <textarea
                title="note"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>

          {/* Chi tiết số lượng */}
          {selectedProducts.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4">Nhập số lượng</h3>

              {Object.values(groupedSelections).map(({ product, selections }) => (
                <div key={product.id} className="mb-8 p-5 border border-gray-200 rounded-xl bg-white shadow-sm">

                  {/* Product header */}
                  <div className="flex items-center gap-4 border-b border-gray-200 pb-4 mb-4">
                    <Image
                      src={findProductImage(product.id, products)}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-lg font-bold">{product.name}</h4>
                      <p className="text-sm text-gray-500">
                        Tổng tồn kho: {product.total_quantity_divided ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {selections.map(sp => {
                      const rel = product.relationships?.find(r => r.id === sp.classification_id);

                      const variantName = rel
                        ? `${rel.attribute1_name}${rel.attribute2_name ? " | " + rel.attribute2_name : ""}`
                        : "Không phân loại";

                      const stock = rel?.quantity ?? product.quantity;
                      const price = rel?.price ?? product.price;

                      return (
                        <div
                          key={`${sp.product_id}-${sp.classification_id ?? "none"}`}
                          className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm"
                        >
                          <p className="font-semibold mb-1">{variantName}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            Giá: {Number(price).toLocaleString("vi-VN")}₫
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-red-600">
                              Còn lại: {stock}
                            </span>
                            <input
                              title="quantity"
                              type="number"
                              min={0}
                              value={sp.quantity}
                              onChange={e =>
                                handleQuantityChange(sp.product_id, sp.classification_id, Number(e.target.value))
                              }
                              className="border border-gray-300 rounded-lg px-3 py-1.5 w-24 text-right"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={selectedProducts.filter(p => p.quantity > 0).length === 0}
              className="px-8 py-3 bg-orange-600 text-white rounded-xl shadow hover:bg-orange-700 disabled:bg-gray-400"
            >
              Tạo yêu cầu
            </button>

            <button
              onClick={() => setShowCreateForm(false)}
              className="px-8 py-3 bg-gray-400 text-white rounded-xl shadow hover:bg-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* LIST IMPORT REQUEST */}
      {storeId && <ImportRequestList storeId={storeId} key={dataVersion} />}
    </div>
  );
}
