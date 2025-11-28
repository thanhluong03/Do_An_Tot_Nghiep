import React from "react";
import { Product, getProductImageUrl, SelectOption } from "@/api/services/inventoryService";
import { Category } from "@/api/services/categoryService";
import { Search } from "lucide-react";
import Image from 'next/image';
interface CheckboxListProps {
  name: "product_id";
  label: string;
  options: SelectOption[];
  selectedValues: string | string[] | undefined;
  onChange: (name: "product_id" , value: string | string[] | undefined) => void;
  error?: string;
  allProducts: Product[];
  categories?: Category[];
}

const findProduct = (id: number, allProducts: Product[]): Product | undefined =>
  allProducts.find((p) => p.id === id);

const findProductImage = (id: number, allProducts: Product[]): string => {
  const product = findProduct(id, allProducts);
  return product ? getProductImageUrl(product) : "/no-image.jpg";
};

const CheckboxList: React.FC<CheckboxListProps> = ({
  name,
  label,
  options,
  selectedValues,
  onChange,
  error,
  allProducts,
  categories,
}) => {
  const selectedIds: string[] = React.useMemo(() => {
    if (Array.isArray(selectedValues)) return selectedValues.filter((v) => v !== "all");
    if (typeof selectedValues === "string" && selectedValues !== "all") return [selectedValues];
    return [];
  }, [selectedValues]);

  const isAllSelected = selectedValues === "all";
  const isProductList = name === "product_id";

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // --- Lọc theo từ khóa & category ---
  const filteredOptions = React.useMemo(() => {
    let result = [...options];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((opt) => opt.name.toLowerCase().includes(lower));
    }
    
    if (isProductList && selectedCategory !== "all") {
      result = result.filter((opt) => {
        const product = findProduct(opt.id, allProducts);
        return product && product.category_id?.toString() === selectedCategory;
      });
    }

    return result;
  }, [options, searchTerm, selectedCategory, allProducts, isProductList]);

  // --- Nhóm theo category ---
  const groupedOptions = React.useMemo(() => {
    if (!isProductList) return { "Danh sách cửa hàng": filteredOptions };
    if (selectedCategory !== "all") return { "Kết quả lọc": filteredOptions };

    const grouped: Record<string, SelectOption[]> = {};
    filteredOptions.forEach((opt) => {
      const product = findProduct(opt.id, allProducts);
      if (!product) return;

      const cat = categories?.find((c) => c.id === product.category_id);
      const categoryName = cat?.name || "Khác";

      if (!grouped[categoryName]) grouped[categoryName] = [];
      grouped[categoryName].push(opt);
    });

    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(sortedEntries);
  }, [filteredOptions, allProducts, categories, isProductList, selectedCategory]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let newValue: string | string[] | undefined;

    if (value === "all") {
      newValue = checked ? "all" : undefined;
    } else {
      let newSelectedIds = [...selectedIds];
      if (checked && !newSelectedIds.includes(value)) newSelectedIds.push(value);
      if (!checked) newSelectedIds = newSelectedIds.filter((id) => id !== value);
      newValue = newSelectedIds.length > 0 ? newSelectedIds : undefined;
    }

    onChange(name, newValue);
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-base font-semibold text-gray-800 mb-3">{label}</label>

      <div
        className="p-0 border border-gray-100 rounded-2xl bg-white shadow-inner overflow-y-auto"
        style={{ maxHeight: "600px" }}
      >
        {/* Header cố định */}
        <div className="sticky top-0 z-20 bg-orange-100/90 backdrop-blur-sm border-b border-orange-200 px-4 py-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wide">
            {isProductList ? "Danh sách sản phẩm" : "Danh sách cửa hàng"}
          </h4>
          {isProductList && <span className="text-xs font-semibold text-orange-700">SL trong Kho Tổng</span>}
        </div>

        {/* Lọc category */}
        {isProductList && categories && (
          <div className="sticky top-[48px] z-20 bg-white px-4 py-2 border-b border-gray-200">
            <select
              title="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">-- Tất cả danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search */}
        {isProductList && (
          <div className="sticky top-[90px] z-10 bg-white px-4 py-2 border-b border-gray-200">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* Chọn tất cả */}
        <div className="flex items-center mb-3 pb-2 border-b border-dashed border-gray-200 px-4 pt-3">
          <input
            type="checkbox"
            id={`${name}-all`}
            name={name}
            value="all"
            checked={isAllSelected}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-orange-600 border-gray-300 rounded"
          />
          <label htmlFor={`${name}-all`} className="ml-3 text-base font-bold text-orange-600 select-none">
            --- Tất cả {isProductList ? "sản phẩm" : "cửa hàng"} ---
          </label>
        </div>

        {/* Render grouped options */}
        <div className="grid grid-cols-1 gap-3 px-4 pb-4">
          {Object.entries(groupedOptions).map(([category, items]) => (
            <div key={category} className="mb-4">
              {isProductList && selectedCategory === "all" && (
                <h5 className="text-sm font-bold text-orange-600 mb-2 sticky top-[135px] bg-white py-1 border-b border-orange-200">
                  {category}
                </h5>
              )}

              {items.length === 0 ? (
                <p className="text-sm text-gray-500 italic ml-3">Không có sản phẩm</p>
              ) : (
                items.map((opt) => {
                  const product = isProductList ? findProduct(opt.id, allProducts) : null;
                  const total_quantity_divided = product?.total_quantity_divided ?? null;

                  return (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between bg-gray-50/60 hover:bg-orange-50 transition-all duration-200 p-3 rounded-xl border border-transparent hover:border-orange-200"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {isProductList && (
                          <Image
                            src={findProductImage(opt.id, allProducts)}
                            alt={opt.name || "Product image"} 
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded-full border border-gray-200 shadow-sm mr-3"
                          />
                        )}

                        <input
                          type="checkbox"
                          id={`${name}-${opt.id}`}
                          name={name}
                          value={String(opt.id)}
                          disabled={isAllSelected}
                          checked={isAllSelected || selectedIds.includes(String(opt.id))}
                          onChange={handleCheckboxChange}
                          className="h-5 w-5 text-orange-600 border-gray-300 rounded"
                        />

                        <label
                          htmlFor={`${name}-${opt.id}`}
                          className={`ml-3 text-base font-medium truncate ${
                            isAllSelected ? "text-gray-400 cursor-not-allowed" : "text-gray-700 cursor-pointer"
                          }`}
                          title={opt.name}
                        >
                          {opt.name}
                        </label>
                      </div>

                      {isProductList && total_quantity_divided !== null && (
                        <span
                          className={`ml-4 px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                            total_quantity_divided > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                          }`}
                          title={`Tồn kho tổng: ${total_quantity_divided}`}
                        >
                          {total_quantity_divided.toLocaleString("vi-VN")}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
    </div>
  );
};

export default CheckboxList;
