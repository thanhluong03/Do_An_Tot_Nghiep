import axios from "axios";
import { ProductCategory } from "../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const categoryApi = {
  // ✅ Lấy danh sách category
  getCategories: async (): Promise<ProductCategory[]> => {
    try {
      const response = await api.get("/categories/listcategory");
      const rawData = response.data;

      const categoriesArray = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawData?.categories)
        ? rawData.categories
        : [];

      return categoriesArray.map((c: any) => ({
        id: String(c.id ?? c._id ?? ""),
        name: c.name ?? "Danh mục không tên",
        slug: c.slug ?? c.name,
      }));
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      return [];
    }
  },

  // ✅ Lấy chi tiết category (dùng trong trang product)
  getCategoryDetail: async (id: string) => {
    try {
      const response = await api.get(`/categories/categorydetail/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch category detail ${id}:`, error);
      return null;
    }
  },
};
