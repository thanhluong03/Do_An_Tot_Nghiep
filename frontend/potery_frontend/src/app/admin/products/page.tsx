"use client";
import { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  ProductImage,
} from "@/api/services/productApi";
import { getCategories, Category } from "@/api/services/categoryService";
import ProductFormModal from "@/components/adminProducts/ProductFormModal";
import ProductsTable from "@/components/adminProducts/ProductsTable";
import { getSuppliers, Supplier } from "@/api/services/supplierService";

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Lọc & tìm kiếm
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | "">("");
  const [dateSort, setDateSort] = useState<"newest" | "oldest" | "">("");

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: "",
    price: 0,
    description: "",
    main_image: "",
    category_id: 0,
    supplier_id: 0,
    images: [] as ProductImage[],
  } as Product);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Không thể tải danh mục!");
    }
  };
  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      toast.error("Không thể tải nhà cung cấp!");
    }
  };
  // Lọc & sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = [...products];

    // Lọc theo danh mục
    if (selectedCategoryId !== 0) {
      result = result.filter(
        (p) =>
          p.category_id === selectedCategoryId ||
          p.category?.id === selectedCategoryId
      );
    }

    // Tìm kiếm theo tên/mô tả
    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Sắp xếp theo giá
    if (priceSort) {
      result.sort((a, b) =>
        priceSort === "asc" ? a.price - b.price : b.price - a.price
      );
    }

    // Sắp xếp theo thời gian tạo (nếu có)
    if (dateSort) {
      result.sort((a: Product, b: Product) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return dateSort === "newest" ? timeB - timeA : timeA - timeB;
      });
    }

    return result;
  }, [products, selectedCategoryId, searchQuery, priceSort, dateSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery, priceSort, dateSort]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  // CRUD
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      main_image: "",
      images: [],
      
      category_id: categories[0]?.id || 0,
      supplier_id: suppliers[0]?.id || 0,
      // Không cần quantity
    } as Product);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    // Khi chỉnh sửa, lấy các thông tin cần thiết từ product, bỏ qua quantity
    setFormData({
      ...product,
      category_id: product.category_id || product.category?.id || 0,
      supplier_id: product.supplier_id || product.supplier?.id || 0,
    } as Product);
    setIsModalOpen(true);
  };

  const handleSave = async (form: FormData) => {
    try {
      if (editingProduct) {
        // Cần đảm bảo rằng editingProduct.id có giá trị
        if (!editingProduct.id) {
          throw new Error("Không tìm thấy ID sản phẩm để cập nhật.");
        }
        await updateProduct(editingProduct.id, form);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await addProduct(form);
        toast.success("Thêm sản phẩm mới thành công!");
      }
      await fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Lưu sản phẩm thất bại!");
    }
  };

  const handleDelete = async (id: number) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center mt-96 p-4 bg-white rounded-xl shadow-2xl max-w-sm mx-auto">
          <p className="font-semibold mb-3 text-lg text-gray-800">
            Bạn có chắc chắn muốn xóa sản phẩm này?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-center gap-3 w-full">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteProduct(id);
                  toast.success("Xóa sản phẩm thành công!");
                  await fetchProducts();
                } catch {
                  toast.error("Không thể xóa sản phẩm!");
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md font-medium transition"
            >
              Xóa
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl text-gray-800 font-medium transition"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      { 
        duration: Infinity, // Giữ toast cho đến khi người dùng tương tác
        position: 'top-center', // Giữ nguyên position, logic căn giữa sẽ nằm ở `style`
     
        style: {
          width: '100%',
          maxWidth: '100%', 
          padding: '0', 
          background: 'transparent',
          boxShadow: 'none',
        
        },
      }
    );
  };

  const getCategoryName = (product: Product): string => {
    if (product.category && product.category.name) return product.category.name;
    const categoryId = product.category_id;
    return (
      categories.find((c) => c.id === categoryId)?.name || "Chưa phân loại"
    );
  };
  const getSupplierName = (product: Product): string => {
    if (product.supplier && product.supplier.name) return product.supplier.name;
    const supplierId = product.supplier_id;
    return (
      suppliers.find((s) => s.id === supplierId)?.name || "Chưa phân loại"
    );
  };

  return (
    <div className="p-8 flex justify-center">
      <Toaster position="top-center" />
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-8xl">
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-extrabold text-black">
            Quản lý sản phẩm
          </h1>
        </div>


        {/* Nút thêm */}
        <div className="flex justify-end mb-4">
        
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#F54900] hover:bg-orange-600 text-white rounded-lg shadow-md transition"
          >
            + Thêm sản phẩm
          </button>
        </div>
     {/* Bộ lọc hiện đại */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-xl p-2 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <select
            title="Lọc theo danh mục"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
            className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value={0}>Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              title="Lọc theo giá"
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as "asc" | "desc" | "")}
              className="border border-gray-300 rounded-xl p-2 flex-1 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sắp xếp theo giá</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>

            <select
                title="Lọc theo thời gian"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value as "newest" | "oldest" | "")}
              className="border border-gray-300 rounded-xl p-2 flex-1 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sắp xếp theo thời gian</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-lg">
            Đang tải sản phẩm...
          </div>
        ) : (
          <>
            <ProductsTable
              products={paginatedProducts}
              getCategoryName={getCategoryName}
              getSupplierName={getSupplierName}
              openEditModal={openEditModal}
              handleDelete={handleDelete}
              startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
            />

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}

            <p className="text-center mt-3 text-sm text-gray-500">
              Hiển thị {paginatedProducts.length}/{filteredProducts.length} sản
              phẩm
            </p>
          </>
        )}
      </div>

      {/* Modal thêm/sửa */}
      <ProductFormModal
              isModalOpen={isModalOpen}
              editingProduct={editingProduct}
              formData={formData}
              setFormData={setFormData}
              handleSave={handleSave}
              setIsModalOpen={setIsModalOpen}
              categories={categories} suppliers={suppliers} />
    </div>
  );
}