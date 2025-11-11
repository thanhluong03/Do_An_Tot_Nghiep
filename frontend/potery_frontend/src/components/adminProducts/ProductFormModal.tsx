import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/api/services/productApi";
import { Supplier } from "@/api/services/supplierService";
import { Category } from "@/api/services/categoryService";
import {
  ProductClassification,
  ClassificationAttributeRelationship
} from "@/types/product";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";



const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Định nghĩa interface cho lỗi validation (được truyền từ ProductsPage)
export interface ProductFormErrors {
  name?: string;
  price?: string;
  description?: string;
  main_image?: string;
  category_id?: string;
  supplier_id?: string;
}

// Định nghĩa các trường có thể có lỗi (để type-safe indexing)
type ValidatableFields = keyof ProductFormErrors;

interface ProductFormModalProps {
  isModalOpen: boolean;
  editingProduct: Product | null;
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  handleSave: (formData: FormData) => Promise<void>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  suppliers: Supplier[];
  validationErrors: ProductFormErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<ProductFormErrors>>;
}

export default function ProductFormModal({
  isModalOpen,
  editingProduct,
  formData,
  setFormData,
  handleSave,
  setIsModalOpen,
  categories,
  suppliers,
  validationErrors,
  setValidationErrors,
}: ProductFormModalProps) {

  // --- Component hiển thị từng ảnh có thể kéo ---
  function SortableImage({ id, src, onRemove, label }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition group"
      >
        <Image
          src={src}
          alt="img"
          width={112}
          height={112}
          className="object-cover w-full h-full"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-white/80 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition-all opacity-80 group-hover:opacity-100"
          title="Xóa ảnh"
        >
          ×
        </button>
        <div
          className={`absolute bottom-1 left-1 text-white text-xs px-2 py-1 rounded ${label === "Cũ" ? "bg-blue-500" : "bg-green-500"
            }`}
        >
          {label}
        </div>
      </div>
    );
  }

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // State cho quản lý ảnh thông minh
  const [imageOperations, setImageOperations] = useState<{
    existing: Array<{ id: number, url: string, action: 'keep' | 'remove' | 'update', newFile?: File }>,
    newImages: File[]
    order: string[];
  }>({
    existing: [],
    newImages: [],
    order: [],
  });

  // States cho phân loại sản phẩm
  const [classifications, setClassifications] = useState<ProductClassification[]>([]);
  // Always show classification inputs (at least the first one)
  const [showClassifications, setShowClassifications] = useState(false);
  const [priceMatrix, setPriceMatrix] = useState<{ [key: string]: number }>({});
  const [classificationErrors, setClassificationErrors] = useState<{ [key: string]: string }>({});
  const [attributeErrors, setAttributeErrors] = useState<{ [key: string]: string }>({});

  // Check if there are any errors
  const hasErrors = Object.keys(classificationErrors).length > 0 || Object.keys(attributeErrors).length > 0;

  const handleRemoveImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Xóa ảnh hiện có - đánh dấu để xóa
      setImageOperations(prev => ({
        ...prev,
        existing: prev.existing.map((img, i) =>
          i === index ? { ...img, action: 'remove' } : img
        )
      }));
    } else {
      // Xóa ảnh mới được chọn
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
      setPreviewImages((prevImages) => prevImages.filter((_, i) => i !== index));
      setImageOperations(prev => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== index)
      }));
    }
  };

  React.useEffect(() => {
    if (isModalOpen) {
      setFiles([]);
      setPreviewImages([]);
      setImageOperations({
        existing: [],
        newImages: []
      });
      setClassificationErrors({});
      setAttributeErrors({});

      // Reset classifications khi mở modal
      if (!editingProduct) {
        // For a new product, ensure we display at least one empty classification
        setClassifications([{ name: "", attributes: [{ name: "" }] }]);
        setShowClassifications(false);
        setPriceMatrix({});
      } else {
        // Load existing images từ product đang edit
        if (editingProduct.images && editingProduct.images.length > 0) {
          console.log('Loading existing images:', editingProduct.images);
          const existingImageData = editingProduct.images.map((img, index) => {
            let url = '';
            if (img.url) {
              url = img.url;
            } else if (img.image_data) {
              // Kiểm tra xem image_data là string base64 hay object có data array
              if (typeof img.image_data === 'string') {
                url = `data:image/jpeg;base64,${img.image_data}`;
              } else if (img.image_data?.data) {
                const buffer = new Uint8Array(img.image_data.data);
                const base64 = btoa(String.fromCharCode(...buffer));
                url = `data:image/jpeg;base64,${base64}`;
              }
            }
            return {
              id: (img as any).id || index, // Giả sử có id
              url: url,
              action: 'keep' as const
            };
          }).filter(img => img.url !== '');

          console.log('Processed existing images:', existingImageData);
          setImageOperations(prev => ({
            ...prev,
            existing: existingImageData
          }));
        }

        // Load classifications từ product đang edit
        console.log('Loading product for edit:', editingProduct);
        const productClassifications = editingProduct.classifications || [];
        console.log('Product classifications:', productClassifications);
        // If editing but there are no classifications, still show one empty classification
        if (!productClassifications || productClassifications.length === 0) {
          setClassifications([{ name: "", attributes: [{ name: "" }] }]);
        } else {
          setClassifications(productClassifications);
        }
        // Always show classification inputs
        setShowClassifications(true);

        // Load price matrix từ relationships
        if (editingProduct.relationships && productClassifications.length > 0) {
          console.log('Product relationships:', editingProduct.relationships);
          const newPriceMatrix: { [key: string]: number } = {};

          editingProduct.relationships.forEach(rel => {
            console.log('Processing relationship:', rel);
            // Tìm attribute names từ IDs
            let attr1Name = '';
            let attr2Name = '';

            productClassifications.forEach(classification => {
              classification.attributes.forEach(attr => {
                if (attr.id === rel.product_attribute_id_1) {
                  attr1Name = attr.name;
                  console.log('Found attr1:', attr1Name, 'for ID:', rel.product_attribute_id_1);
                }
                if (attr.id === rel.product_attribute_id_2) {
                  attr2Name = attr.name;
                  console.log('Found attr2:', attr2Name, 'for ID:', rel.product_attribute_id_2);
                }
              });
            });

            if (attr1Name && attr2Name && rel.price) {
              const key = createMatrixKey(attr1Name, attr2Name);
              const price = typeof rel.price === 'string' ? parseFloat(rel.price) : rel.price;
              newPriceMatrix[key] = price;
              console.log('Added to matrix:', key, '=', price);
            } else {
              console.log('Missing data for relationship:', {
                attr1Name,
                attr2Name,
                price: rel.price,
                attr_id_1: rel.product_attribute_id_1,
                attr_id_2: rel.product_attribute_id_2
              });
            }
          });

          console.log('Final price matrix:', newPriceMatrix);
          setPriceMatrix(newPriceMatrix);
        } else {
          setPriceMatrix({});
        }
      }
    }
  }, [isModalOpen, editingProduct]);

  // Hàm thêm phân loại mới
  const addClassification = () => {
    if (classifications.length >= 2) return; // Tối đa 2 phân loại

    setClassifications(prev => [
      ...prev,
      { name: "", attributes: [{ name: "" }] }
    ]);
  };

  // Hàm xóa phân loại
  const removeClassification = (index: number) => {
    setClassifications(prev => prev.filter((_, i) => i !== index));
    if (classifications.length <= 1) {
      setShowClassifications(false);
    }
  };

  // Hàm cập nhật tên phân loại
  const updateClassificationName = (index: number, name: string) => {
    // Validate tên phân loại không trùng
    const isDuplicate = classifications.some((c, i) => i !== index && c.name.trim().toLowerCase() === name.trim().toLowerCase());

    if (isDuplicate && name.trim()) {
      setClassificationErrors(prev => ({
        ...prev,
        [`classification_${index}`]: "Tên phân loại đã tồn tại"
      }));
      // Focus vào input có lỗi
      setTimeout(() => {
        const errorInput = document.querySelector(`input[data-classification="${index}"]`) as HTMLInputElement;
        if (errorInput) {
          errorInput.focus();
          errorInput.select();
        }
      }, 100);
    } else {
      setClassificationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`classification_${index}`];
        return newErrors;
      });
    }

    setClassifications(prev =>
      prev.map((c, i) => i === index ? { ...c, name } : c)
    );
  };

  // Hàm thêm thuộc tính vào phân loại
  const addAttribute = (classificationIndex: number) => {
    setClassifications(prev =>
      prev.map((c, i) =>
        i === classificationIndex
          ? { ...c, attributes: [...c.attributes, { name: "" }] }
          : c
      )
    );
  };

  // Hàm xóa thuộc tính
  const removeAttribute = (classificationIndex: number, attributeIndex: number) => {
    setClassifications(prev =>
      prev.map((c, i) =>
        i === classificationIndex
          ? { ...c, attributes: c.attributes.filter((_, ai) => ai !== attributeIndex) }
          : c
      )
    );
  };

  // Hàm cập nhật tên thuộc tính
  const updateAttributeName = (classificationIndex: number, attributeIndex: number, name: string) => {
    // Validate tùy chọn không trùng trong cùng phân loại
    const currentClassification = classifications[classificationIndex];
    const isDuplicate = currentClassification.attributes.some((a, i) =>
      i !== attributeIndex && a.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

    const errorKey = `attribute_${classificationIndex}_${attributeIndex}`;

    if (isDuplicate && name.trim()) {
      setAttributeErrors(prev => ({
        ...prev,
        [errorKey]: "Tùy chọn đã tồn tại trong phân loại này"
      }));
      // Focus vào input có lỗi
      setTimeout(() => {
        const errorInput = document.querySelector(`input[data-attribute="${classificationIndex}-${attributeIndex}"]`) as HTMLInputElement;
        if (errorInput) {
          errorInput.focus();
          errorInput.select();
        }
      }, 100);
    } else {
      setAttributeErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

    setClassifications(prev =>
      prev.map((c, i) =>
        i === classificationIndex
          ? {
            ...c,
            attributes: c.attributes.map((a, ai) =>
              ai === attributeIndex ? { ...a, name } : a
            )
          }
          : c
      )
    );
  };                // Hàm tạo price matrix key
  const createMatrixKey = (attr1Name: string, attr2Name: string) => {
    return `${attr1Name}|${attr2Name}`;
  };

  // Hàm cập nhật giá trong matrix
  const updateMatrixPrice = (attr1Name: string, attr2Name: string, price: number) => {
    const key = createMatrixKey(attr1Name, attr2Name);
    setPriceMatrix(prev => ({ ...prev, [key]: price }));
  };
  const dndSensors = useSensors(useSensor(PointerSensor));

  if (!isModalOpen) return null;

  // Hàm xử lý thay đổi input và xóa lỗi tương ứng
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: ValidatableFields
  ) => {
    let value: string | number = e.target.value;

    if (field === 'price' || field === 'category_id' || field === 'supplier_id') {
      value = Number(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    setPreviewImages(newFiles.map((f) => URL.createObjectURL(f)));

    // Cập nhật imageOperations
    setImageOperations(prev => ({
      ...prev,
      newImages: newFiles
    }));

    // Xóa lỗi ảnh nếu người dùng chọn file
    if (validationErrors.main_image) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.main_image;
        return newErrors;
      });
    }
  };

  const onSave = async () => {
    const errors: ProductFormErrors = {};
    // Kiểm tra ảnh: phải có ít nhất 1 ảnh (ảnh cũ được giữ hoặc ảnh mới)
    const keptImages = imageOperations.existing.filter(img => img.action === 'keep').length;
    const newImagesCount = files.length;
    const hasImages = (keptImages > 0) || (newImagesCount > 0);

    if (!editingProduct && !hasImages) {
      errors.main_image = "Vui lòng chọn ít nhất một ảnh cho sản phẩm.";
    }
    if (editingProduct && !hasImages) {
      errors.main_image = "Sản phẩm phải có ít nhất một ảnh.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("price", (formData.price ?? 0).toString());

    form.append("description", formData.description || "");
    form.append("category_id", (formData.category_id || 0).toString());
    form.append("supplier_id", (formData.supplier_id || 0).toString());

    // Gửi tất cả ảnh mới được chọn
    files.forEach((file) => form.append("images", file));

    // Nếu đang edit, gửi thông tin về operations của ảnh
    if (editingProduct) {
      const imageOps = {
        keep: imageOperations.existing
          .filter(img => img.action === 'keep')
          .map(img => img.id),
        remove: imageOperations.existing
          .filter(img => img.action === 'remove')
          .map(img => img.id),
        update: imageOperations.existing
          .filter(img => img.action === 'update')
          .map(img => ({ id: img.id })),
        order: imageOperations.order || [], // ✅ THÊM DÒNG NÀY
      };

      form.append("imageOperations", JSON.stringify(imageOps));
    }

    // Thêm dữ liệu phân loại sản phẩm
    if (showClassifications && classifications.length > 0) {
      form.append("classifications", JSON.stringify(classifications));

      // Tạo relationships từ price matrix
      if (classifications.length === 2) {
        const relationships: ClassificationAttributeRelationship[] = [];

        classifications[0].attributes.forEach((attr1, index1) => {
          classifications[1].attributes.forEach((attr2, index2) => {
            const key = createMatrixKey(attr1.name, attr2.name);
            const price = priceMatrix[key];

            if (price && price > 0) {
              // Nếu đang edit và có ID thực tế, sử dụng ID đó
              if (editingProduct && attr1.id && attr2.id) {
                relationships.push({
                  product_attribute_id_1: attr1.id,
                  product_attribute_id_2: attr2.id,
                  price: price,
                  quantity: 0
                });
              } else {
                // Nếu tạo mới, backend sẽ map index với attribute vừa tạo
                relationships.push({
                  product_attribute_id_1: index1, // Index của attr1 trong classification[0]
                  product_attribute_id_2: index2, // Index của attr2 trong classification[1]
                  price: price,
                  quantity: 0
                });
              }
            }
          });
        });

        if (relationships.length > 0) {
          form.append("relationships", JSON.stringify(relationships));
        }
      }
    }

    await handleSave(form);
  };

  const getInputClassName = (field: ValidatableFields): string => {
    const baseClass = "w-full border rounded-xl px-2 py-2 text-sm focus:outline-none mb-2 transition";
    const errorClass = "border-red-500 focus:ring-red-500";
    const normalClass = "border-gray-300 focus:ring-orange-500";
    return `${baseClass} ${validationErrors[field] ? errorClass : normalClass}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        className="absolute inset-0"
        onClick={() => setIsModalOpen(false)}
      />

      {/* --- MAIN MODAL --- */}
      <div
        className="relative z-10 w-full max-w-[1350px] bg-white rounded-3xl shadow-2xl border border-gray-200 
        p-10 animate-[fadeIn_0.2s_ease-in-out] overflow-y-auto max-h-[98vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10 pb-5">
          <h2 className="text-3xl font-extrabold text-[#B95D26] tracking-tight">
            {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <button
            title="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={30} />
          </button>
        </div>

        {/* Form nội dung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
          {/* Tên sản phẩm */}
          <div className="">
            <label className="block text-base font-semibold text-gray-800 mb-1">
              Tên sản phẩm
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange(e, 'name')}
              className={getInputClassName('name')}
              placeholder="Nhập tên sản phẩm..."
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-1">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              value={formData.price ?? ''} 
              onChange={(e) => handleChange(e, 'price')}
              className={getInputClassName('price')}
              placeholder="Nhập giá..."
              
            />
            {validationErrors.price && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
            )}
          </div> 

          {/* Danh mục */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-1">
              Danh mục
            </label>
            <select
              title="Danh mục"
              value={formData.category_id ?? 0}
              onChange={(e) => handleChange(e, 'category_id')}
              className={getInputClassName('category_id')}
            >
              <option value={0}>-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {validationErrors.category_id && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.category_id}</p>
            )}
          </div>

          {/* Nhà cung cấp */}
          <div className="">
            <label className="block text-base font-semibold text-gray-800 mb-1">
              Nhà cung cấp
            </label>
            <select
              title="Nhà cung cấp"
              value={formData.supplier_id ?? 0}
              onChange={(e) => handleChange(e, 'supplier_id')}
              className={getInputClassName('supplier_id')}
            >
              <option value={0}>-- Chọn nhà cung cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {validationErrors.supplier_id && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.supplier_id}</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-1"
              htmlFor="product-description">Mô tả</label>
            <div className={`transition ${validationErrors.description ? 'border-red-500 focus-within:ring-red-500' : ''} rounded-xl`}>
              <ReactQuill
                value={formData.description || ""} // Sử dụng giá trị từ formData
                onChange={(content) => {
                  // Cập nhật formData.description và xóa lỗi
                  setFormData((prev) => ({ ...prev, description: content }));
                  if (validationErrors.description) {
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.description;
                      return newErrors;
                    });
                  }
                }}
                theme="snow"
                placeholder="Nhập mô tả chi tiết sản phẩm..."
                className="w-full"
                // Set height cho editor
                style={{ height: '300px' }}
              />
            </div>
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Upload hình ảnh */}
          <div className="col-span-2 mt-12">
            <label className="block text-base font-semibold text-gray-800 mb-1">
              Ảnh sản phẩm
            </label>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer hover:bg-orange-50 transition ${validationErrors.main_image ? 'border-red-500' : 'border-orange-300'
                }`}
            >
              <Upload className="text-orange-500 mb-3" size={30} />
              <span className="text-base text-gray-600 font-medium">
                Chọn hoặc kéo ảnh vào đây
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {validationErrors.main_image && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.main_image}</p>
            )}
          </div>

          {/* --- Preview ảnh với kéo thả --- */}
          {(imageOperations.existing.filter(img => img.action !== "remove").length > 0 ||
            previewImages.length > 0) && (
              <div className="col-span-2">
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Sắp xếp ảnh sản phẩm (kéo để đổi vị trí)
                </label>

                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;

                    // Lấy danh sách ảnh cũ (keep) và ảnh mới
                    const existingImages = imageOperations.existing.filter(img => img.action !== "remove");
                    const newImages = previewImages.map((src, i) => ({ id: `new-${i}`, url: src }));

                    // Gộp tất cả ảnh để tính vị trí mới
                    const allImages = [...existingImages, ...newImages];

                    const oldIndex = allImages.findIndex(img => img.id.toString() === active.id.toString());
                    const newIndex = allImages.findIndex(img => img.id.toString() === over.id.toString());
                    if (oldIndex === -1 || newIndex === -1) return;

                    const reordered = arrayMove(allImages, oldIndex, newIndex);

                    // Chia lại 2 mảng sau reorder
                    const reorderedExisting = reordered.filter(img => !img.id.toString().startsWith("new-"));
                    const reorderedNew = reordered.filter(img => img.id.toString().startsWith("new-"));

                    // ✅ Cập nhật lại state: ảnh cũ giữ đúng id và action
                    setImageOperations(prev => ({
                      ...prev,
                      existing: reorderedExisting.map((img, index) => {
                        const original = prev.existing.find(x => x.id === Number(img.id));
                        return original
                          ? { ...original, url: img.url, order: index } // ✅ thêm order
                          : { id: Number(img.id), url: img.url, action: "keep" as const, order: index };
                      }),
                      newImages: reorderedNew.map((_, i) => prev.newImages[i]).filter(Boolean),
                      order: reordered.map(img => img.id.toString()), // ✅ lưu mảng thứ tự ID
                    }));


                    // ✅ Cập nhật lại preview images theo thứ tự mới
                    setPreviewImages(reorderedNew.map(img => img.url));

                    // ✅ Đồng bộ lại files (đảm bảo formData gửi đúng thứ tự)
                    const reorderedFileIndexes = reorderedNew.map(img =>
                      Number(String(img.id).split("-")[1])
                    );
                    setFiles(prevFiles => reorderedFileIndexes.map(i => prevFiles[i]));
                  }}

                >
                  <SortableContext
                    items={[
                      ...imageOperations.existing
                        .filter((img) => img.action !== "remove")
                        .map((img) => img.id.toString()),
                      ...previewImages.map((_, i) => `new-${i}`),
                    ]}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex flex-wrap gap-4 mt-2">
                      {/* Ảnh cũ */}
                      {imageOperations.existing
                        .filter((img) => img.action !== "remove")
                        .map((img) => (
                          <SortableImage
                            key={img.id}
                            id={img.id.toString()}
                            src={img.url}
                            onRemove={() => {
                              // tìm index đúng của ảnh trong imageOperations.existing
                              const index = imageOperations.existing.findIndex(x => x.id === img.id);
                              handleRemoveImage(index, true);
                            }}
                            label="Cũ"
                          />
                        ))}


                      {/* Ảnh mới */}
                      {previewImages.map((src, i) => (
                        <SortableImage
                          key={`new-${i}`}
                          id={`new-${i}`}
                          src={src}
                          onRemove={() => handleRemoveImage(i, false)}
                          label="Mới"
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

        </div>

        {/* Phân loại sản phẩm */}
        <div className="mt-8 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xl font-bold text-gray-800 mb-4">
              Thêm thông tin bán hàng nếu có phân loại sản phẩm
            </label>
            <label className="inline-flex items-center gap-2 text-gray-600 font-medium">
              <input
                type="checkbox"
                checked={showClassifications}
                onChange={(e) => setShowClassifications(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 focus:ring-orange-500"
              />
              Chọn nếu có phân loại sản phẩm
            </label>
          </div>

          {showClassifications && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">Giá của sản phẩm sẽ theo phân loại</p>
              {classifications.map((classification, classIndex) => (
                <div key={classIndex} className="border border-gray-200 rounded-xl p-4">
                  {/* Header + name on one row to match screenshot */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 w-full">
                      <span className="text-base font-semibold text-gray-700">Phân loại {classIndex + 1}</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={classification.name}
                          onChange={(e) => updateClassificationName(classIndex, e.target.value)}
                          data-classification={classIndex}
                          disabled={hasErrors && !classificationErrors[`classification_${classIndex}`]}
                          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${classificationErrors[`classification_${classIndex}`]
                            ? 'border-red-500 focus:ring-red-500'
                            : hasErrors && !classificationErrors[`classification_${classIndex}`]
                              ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                              : 'border-gray-300 focus:ring-orange-500'
                            }`}
                          placeholder="Ví dụ: Màu sắc, Kích thước..."
                        />
                        {classificationErrors[`classification_${classIndex}`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {classificationErrors[`classification_${classIndex}`]}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeClassification(classIndex)}
                      className="ml-4 text-red-500 hover:text-red-700 transition"
                      title="Xóa phân loại"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Các tùy chọn của phân loại: label at left, inputs + button at right */}
                  <div className="grid grid-cols-[110px_1fr] gap-x-4 items-start">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 pt-0">Tùy chọn</label>
                    </div>

                    <div>
                      <div className="space-y-2">
                        {classification.attributes.map((attribute, attrIndex) => (
                          <div key={attrIndex} className="flex items-center gap-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={attribute.name}
                                onChange={(e) => updateAttributeName(classIndex, attrIndex, e.target.value)}
                                data-attribute={`${classIndex}-${attrIndex}`}
                                disabled={hasErrors && !attributeErrors[`attribute_${classIndex}_${attrIndex}`]}
                                className={`w-full border rounded-xl px-4 py-3 text-sm  focus:outline-none ${attributeErrors[`attribute_${classIndex}_${attrIndex}`]
                                  ? 'border-red-500 focus:ring-red-500'
                                  : hasErrors && !attributeErrors[`attribute_${classIndex}_${attrIndex}`]
                                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                    : 'border-gray-300 focus:ring-orange-500'
                                  }`}
                                placeholder="Ví dụ: Đỏ, Xanh, S, M, L..."
                              />
                              {attributeErrors[`attribute_${classIndex}_${attrIndex}`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {attributeErrors[`attribute_${classIndex}_${attrIndex}`]}
                                </p>
                              )}
                            </div>

                            {/* Horizontal red dash marker outside the input */}
                            {classification.attributes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAttribute(classIndex, attrIndex)}
                                className="flex items-center justify-center ml-3"
                                aria-label="Xóa tùy chọn"
                              >
                                <span className="block h-[4px] w-4 bg-red-500 rounded" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => addAttribute(classIndex)}
                          disabled={hasErrors}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border-2 border-dashed transition text-sm font-medium ${hasErrors
                            ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50'
                            : 'text-gray-600 border-gray-200 hover:text-gray-800 hover:border-gray-300 bg-white'
                            }`}
                        >
                          <Plus size={16} className={hasErrors ? 'text-gray-400' : 'text-gray-600'} /> Thêm tùy chọn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {classifications.length < 2 && (
                <button
                  type="button"
                  onClick={addClassification}
                  disabled={hasErrors}
                  className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-dashed transition text-base font-medium self-start ${hasErrors
                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'text-orange-600 border-orange-300 hover:text-orange-700 hover:border-orange-400'
                    }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${hasErrors ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                    <Plus size={14} />
                  </span>
                  <span>Thêm phân loại</span>
                </button>
              )}

              {/* Bảng giá theo phân loại */}
              {classifications.length === 2 &&
                classifications[0].attributes.length > 0 &&
                classifications[1].attributes.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Bảng giá theo phân loại</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200 rounded-lg">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                              {classifications[0].name}
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                              {classifications[1].name}
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                              Giá
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {classifications[0].attributes.map((attr1, index1) => (
                            classifications[1].attributes.map((attr2, index2) => (
                              <tr key={`${index1}-${index2}`} className="hover:bg-gray-50">
                                {index2 === 0 && (
                                  <td
                                    className="border border-gray-200 px-4 py-3 text-gray-700 font-medium align-top"
                                    rowSpan={classifications[1].attributes.length}
                                  >
                                    {attr1.name}
                                  </td>
                                )}
                                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                                  {attr2.name}
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                  <input
                                    type="number"
                                    value={priceMatrix[createMatrixKey(attr1.name, attr2.name)] || ''}
                                    onChange={(e) => updateMatrixPrice(attr1.name, attr2.name, Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Nhập giá..."
                                  />
                                </td>
                              </tr>
                            ))
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-4 mt-10 pt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition shadow-sm"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg transition"
          >
            {editingProduct ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}