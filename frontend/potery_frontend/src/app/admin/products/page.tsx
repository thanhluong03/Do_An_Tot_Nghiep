"use client";
import { useEffect, useState } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct, Product } from "@/api/services/productApi";
import { getSuppliers, Supplier } from "@/api/services/supplierService";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: "",
    price: 0,
    quantity: 0,
    description: "",
    main_image: "",
    supplier_id: undefined,
  } as Product);

  // Load products + suppliers
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi load sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Lỗi khi load nhà cung cấp:", error);
    }
  };

  // Xử lý mở modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: 0,
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      main_image: "",
      images: [],
      supplier_id: 0,
      created_at: "",
    } as Product);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  // Lưu (thêm/sửa)
  const handleSave = async () => {
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id!, formData);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const added = await addProduct(formData);
        setProducts((prev) => [...prev, added]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      alert("❌ Lưu sản phẩm thất bại!");
    }
  };

  // Xóa
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Lỗi khi xoá sản phẩm:", error);
      }
    }
  };

return (
  <div className="p-6 flex justify-center">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-full">
      {/* Header */}
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
            Quản lý sản phẩm
        </h1>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">#</th>
                <th className="p-3 border-b">Ảnh</th>
                <th className="p-3 border-b">Tên</th>
                <th className="p-3 border-b">Giá</th>
                <th className="p-3 border-b">Số lượng</th>
                <th className="p-3 border-b">Nhà cung cấp</th>
                <th className="p-3 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    Không có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((p, index) => {
                  const mainImage =
                    typeof p.main_image === "string" && p.main_image.trim() !== ""
                      ? p.main_image
                      : p.images && p.images.length > 0 && typeof p.images[0].url === "string"
                        ? p.images[0].url
                        : "https://via.placeholder.com/100";

                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{index + 1}</td>
                      <td className="p-3 border-b">
                        <img
                          src={mainImage}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </td>
                      <td className="p-3 border-b font-medium">{p.name}</td>
                      <td className="p-3 border-b text-blue-600 font-semibold">
                        {p.price.toLocaleString()} ₫
                      </td>
                      <td className="p-3 border-b">{p.quantity}</td>
                      <td className="p-3 border-b">
                        {suppliers.find((s) => s.id === p.supplier_id)?.name || "-"}
                      </td>
                      <td className="p-3 border-b text-center space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(p.id!)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>

      {/* Modal Form (giữ nguyên modal của bạn, overlay mờ nhẹ) */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* overlay mờ (click ngoài đóng) */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10">
            <h2 className="text-xl font-semibold mb-4">{editingProduct ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}</h2>

            <div className="space-y-3">
              <label className="block text-sm">Tên sản phẩm</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded p-2" />

              <label className="block text-sm">Giá</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border rounded p-2" />

              <label className="block text-sm">Số lượng</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full border rounded p-2" />

              <label className="block text-sm">Mô tả</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded p-2" />

              <label className="block text-sm">Ảnh chính (URL)</label>
              <input type="text" value={formData.main_image ?? ""} onChange={(e) => setFormData({ ...formData, main_image: e.target.value })} className="w-full border rounded p-2" />

              <label className="block text-sm">Nhà cung cấp</label>
              <select value={formData.supplier_id ?? ""} onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })} className="w-full border rounded p-2">
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
