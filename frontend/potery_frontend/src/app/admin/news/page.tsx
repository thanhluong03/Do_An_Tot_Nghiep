// src/app/admin/news/NewsPage.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    getNews,
    addNews,
    updateNews,
    deleteNews,
    News,
    CreateNewsDto,
    UpdateNewsDto,
    ListNewsDto,
} from "@/api/services/newService";

// Trạng thái Form mặc định cho việc tạo mới
const initialFormState: CreateNewsDto = {
    title: "",
    content: "",
    is_published: false,
    // user_id có thể cần được thiết lập từ Auth context
    user_id: 1, // GIẢ ĐỊNH: ID người dùng là 1
};

// Hàm chuyển đổi Date sang string (YYYY-MM-DD)
const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch {
        return '';
    }
};

export default function NewsPage() {
    const [newsList, setNewsList] = useState<News[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [form, setForm] = useState<CreateNewsDto>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    // Logic Phân trang & Tìm kiếm
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchKey, setSearchKey] = useState('');


    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const query: ListNewsDto = { 
                page: currentPage, 
                size: pageSize, 
                key: searchKey.trim() || undefined 
            };
            
            const result = await getNews(query);
            setNewsList(result.news);
            // Ghi chú: totalItems sẽ không chính xác nếu API không trả về tổng số lượng
            setTotalItems(result.total); 
        } catch (error) {
            console.error("Lỗi tải Tin tức:", error);
            setNewsList([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchKey]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let newValue: string | number | boolean = value;

        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
            newValue = e.target.checked;
        } else if (name === 'user_id') {
            newValue = Number(value);
        }

        setForm(prev => ({ ...prev, [name]: newValue }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = (): { [key: string]: string } => {
        const newErrors: { [key: string]: string } = {};
        if (!form.title?.trim()) newErrors.title = "Tiêu đề không được bỏ trống";
        if (!form.content?.trim()) newErrors.content = "Nội dung không được bỏ trống";
        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Chuẩn hóa published_at thành Date object nếu có
            const dataToSend: CreateNewsDto | UpdateNewsDto = { ...form };
            if (dataToSend.published_at && typeof dataToSend.published_at === 'string') {
                dataToSend.published_at = new Date(dataToSend.published_at);
            }

            if (editingId) {
                // Sửa: Dùng updateNews
                await updateNews(editingId, dataToSend as UpdateNewsDto);
                setEditingId(null);
                alert(`Cập nhật bài viết ID ${editingId} thành công!`);
            } else {
                // Thêm mới: Dùng addNews (gửi 1 item trong array)
                await addNews(dataToSend as CreateNewsDto);
                alert("Thêm bài viết mới thành công!");
            }
            
            // Reset form và load lại data
            setForm(initialFormState);
            setErrors({});
            fetchNews();

        } catch (error) {
            console.error("Lỗi CRUD:", error);
            alert("Có lỗi xảy ra khi thực hiện thao tác!");
        }
    };

    const handleEdit = (news: News) => {
        // Chuyển đổi News (dùng string) sang CreateNewsDto (dùng Date/string) để fill form
        const editableNews: CreateNewsDto = {
            ...news,
            published_at: news.published_at ? formatDate(news.published_at) as unknown as Date : undefined,
        };
        setForm(editableNews);
        setEditingId(news.id);
        setErrors({});
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(initialFormState);
        setErrors({});
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc muốn xoá (soft delete) bài viết ID ${id} không?`)) return;
        try {
            const result = await deleteNews(id);
            alert(`Xoá bài viết ID ${id} thành công! (${result.message})`);
            fetchNews();
        } catch (error) {
            console.error("Lỗi xoá:", error);
            alert("Có lỗi xảy ra khi xoá bài viết.");
        }
    };
    
    // Tính toán phân trang
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    // Vì fetchNews đã load data theo trang, newsList chính là currentItems

    // Pagination Handlers
    const handlePageChange = (page: number) => {
        if(page >= 1 && page <= totalPages) setCurrentPage(page);
    };
    
    const handleSearch = (key: string) => {
        setSearchKey(key);
        setCurrentPage(1);
    }
    
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Bài đăng Tin tức
                </h2>

                {/* Form Thêm/Sửa */}
                <div className={`border p-6 rounded-lg mb-8 ${editingId ? 'border-yellow-400' : 'border-blue-400'}`}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                           {editingId ? `Sửa Bài viết ID: ${editingId}` : "Thêm Bài viết mới"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Tiêu đề */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                            <input
                                name="title"
                                placeholder="Nhập tiêu đề bài viết"
                                value={form.title || ""}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Ngày xuất bản */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày xuất bản</label>
                            <input
                                name="published_at"
                                type="date"
                                // Cần format Date object sang string YYYY-MM-DD
                                value={form.published_at ? formatDate(form.published_at.toString()) : ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.published_at && <p className="text-red-500 text-xs mt-1">{errors.published_at}</p>}
                        </div>

                        {/* Nội dung */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                            <textarea
                                name="content"
                                placeholder="Nhập nội dung bài viết"
                                value={form.content || ""}
                                onChange={handleChange}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                        </div>
                        
                         {/* Trạng thái Xuất bản */}
                        <div className="flex items-center gap-2 md:col-span-3">
                            <input
                                id="is_published"
                                name="is_published"
                                type="checkbox"
                                checked={!!form.is_published}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                                Đã xuất bản
                            </label>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3">
                        {editingId && (
                               <button
                                    onClick={handleCancelEdit}
                                    className="px-5 py-2 rounded-lg font-semibold shadow-md transition bg-gray-400 hover:bg-gray-500 text-white"
                                 >
                                    Hủy Sửa
                                 </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
                                editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        >
                            {editingId ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề..."
                        value={searchKey}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Bảng liệt kê */}
                {loading ? (
                    <div className="text-center py-8 text-blue-500 font-medium">Đang tải dữ liệu...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                    <th className="px-4 py-3 text-left w-16">ID</th>
                                    <th className="px-4 py-3 text-left w-1/4">Tiêu đề</th>
                                    <th className="px-4 py-3 text-left">Trạng thái</th>
                                    <th className="px-4 py-3 text-left">Ngày xuất bản</th>
                                    <th className="px-4 py-3 text-left">Người đăng (ID)</th>
                                    <th className="px-4 py-3 text-center w-32">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newsList.map((news, idx) => (
                                    <tr
                                        key={news.id}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
                                    >
                                        <td className="px-4 py-3">{news.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 line-clamp-2">{news.title}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                news.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {news.is_published ? 'Đã XB' : 'Nháp'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(news.published_at)}</td>
                                        <td className="px-4 py-3">{news.user_id}</td>
                                        <td className="px-4 py-3 flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleEdit(news)}
                                                className="px-3 py-1 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium shadow"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(news.id)}
                                                className="px-3 py-1 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
                                            >
                                                Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {newsList.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-gray-500">
                                            Không có bài viết nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                        Hiển thị {Math.min(startIndex + 1, totalItems)} - {Math.min(startIndex + pageSize, totalItems)} trên {totalItems} bài viết
                    </p>
                    <div className="flex gap-2 items-center">
                         <span className="text-sm text-gray-700">Kích thước:</span>
                         <select
                             value={pageSize}
                             onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                             className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         >
                            {[5, 10, 20].map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                         
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1 font-medium text-gray-700">
                            Trang {currentPage}/{totalPages || 1}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}