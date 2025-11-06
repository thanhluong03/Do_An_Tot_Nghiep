"use client";
import { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  getProducts,
  getProductDetail,
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
import ConfirmDialog from "@/components/common/ConfirmDialog";

export interface ProductFormErrors {
  name?: string;
  price?: string;
  description?: string;
  main_image?: string;
  category_id?: string;
  supplier_id?: string;
}

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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
  const [validationErrors, setValidationErrors] = useState<ProductFormErrors>(
    {}
  );
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
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = async (product: Product) => {
    try {
      // Lấy chi tiết sản phẩm bao gồm classifications và relationships
      const productDetail = await getProductDetail(Number(product.id));
      setEditingProduct(productDetail);

      // Khi chỉnh sửa, lấy các thông tin cần thiết từ product, bỏ qua quantity
      setFormData({
        ...productDetail,
        category_id: productDetail.category_id || productDetail.category?.id || 0,
        supplier_id: productDetail.supplier_id || productDetail.supplier?.id || 0,
      } as Product);
      setValidationErrors({});
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      toast.error("Không thể tải chi tiết sản phẩm!");
    }
  };
  const validateForm = (data: Product): boolean => {
    const errors: ProductFormErrors = {};

    if (!data.name || data.name.trim() === "") {
      errors.name = "Tên sản phẩm không được để trống.";
    } else if (data.name.length < 3 || data.name.length > 150) {
      errors.name = "Tên sản phẩm phải từ 3 đến 150 ký tự.";
    }

    // if (data.price === undefined || data.price <= 0) {
    //   errors.price = "Giá sản phẩm phải là số dương lớn hơn 0.";
    // } else if (isNaN(data.price)) {
    //   errors.price = "Giá sản phẩm không hợp lệ.";
    // }

    if (!data.description || data.description.trim() === "") {
      errors.description = "Mô tả sản phẩm không được để trống.";
    }

    // Kiểm tra Category/Supplier nếu danh sách có sẵn (chỉ bắt buộc nếu có dữ liệu danh mục)
    if (categories.length > 0 && data.category_id === 0) {
      errors.category_id = "Vui lòng chọn danh mục.";
    }

    if (suppliers.length > 0 && data.supplier_id === 0) {
      errors.supplier_id = "Vui lòng chọn nhà cung cấp.";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập liệu!");
      return false;
    }
    return true;
  };
  const handleSave = async (form: FormData) => {
    const productDataForValidation: Product = {
      name: form.get('name') as string,
      price: Number(form.get('price')),
      description: form.get('description') as string,
      main_image: '',
      category_id: Number(form.get('category_id')),
      supplier_id: Number(form.get('supplier_id')),
      images: [],
    } as Product;

    if (!validateForm(productDataForValidation)) {
      return;
    }
    try {
      if (editingProduct) {
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
  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      await deleteProduct(confirmDeleteId);
      toast.success("Xóa sản phẩm thành công!");
      await fetchProducts();
    } catch {
      toast.error("Không thể xóa sản phẩm!");
    } finally {
      setConfirmDeleteId(null);
    }
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
    <div className=" flex justify-center">
      <Toaster position="top-center" />
      <div className="bg-white rounded-2xl shadow-xl p-4 pt-6 w-full max-w-8xl">
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#B95D26]">
            Quản lý sản phẩm
          </h1>
        </div>

        <div className="flex justify-end mb-4">

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#B95D26] hover:bg-[#A65D26] text-white rounded-lg shadow-md transition"
          >
            + Thêm sản phẩm
          </button>
        </div>
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
                    className={`px-3 py-1 rounded-lg ${currentPage === i + 1
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
      {confirmDeleteId && (
        <ConfirmDialog
          title="Xác nhận xóa sản phẩm"
          message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}


      {/* Modal thêm/sửa */}
      <ProductFormModal
        isModalOpen={isModalOpen}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        setIsModalOpen={setIsModalOpen}
        categories={categories}
        suppliers={suppliers}
        validationErrors={validationErrors}
        setValidationErrors={setValidationErrors}
      />
    </div>

  );
}