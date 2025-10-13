"use client";
import React, { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
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
import { Pencil, Trash2 } from "lucide-react";

const initialFormState: CreateNewsDto = {
    title: "",
    content: "",
    is_published: false,
    user_id: 1,
};

const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
        return new Date(dateString).toISOString().split("T")[0];
    } catch {
        return "";
    }
};

export default function NewsPage() {
    const [newsList, setNewsList] = useState<News[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [form, setForm] = useState<CreateNewsDto>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchKey, setSearchKey] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const query: ListNewsDto = {
                page: currentPage,
                size: pageSize,
                key: searchKey.trim() || undefined,
            };
            const result = await getNews(query);
            setNewsList(result.news);
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
        if (type === "checkbox" && e.target instanceof HTMLInputElement) {
            newValue = e.target.checked;
        } else if (name === "user_id") {
            newValue = Number(value);
        }
        setForm((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
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
            const dataToSend: CreateNewsDto | UpdateNewsDto = { ...form };
            if (dataToSend.published_at && typeof dataToSend.published_at === "string") {
                dataToSend.published_at = new Date(dataToSend.published_at);
            }

            if (editingId) {
                await updateNews(editingId, dataToSend as UpdateNewsDto);
                toast.success(`Cập nhật bài viết #${editingId} thành công!`);
                setEditingId(null);
            } else {
                await addNews(dataToSend as CreateNewsDto);
                toast.success("Thêm bài viết mới thành công!");
            }

            setForm(initialFormState);
            setErrors({});
            setShowForm(false);
            fetchNews();
        } catch (error) {
            console.error("Lỗi CRUD:", error);
            toast.error("Có lỗi xảy ra khi thực hiện thao tác!");
        }
    };

    const handleEdit = (news: News) => {
        const editableNews: CreateNewsDto = {
            ...news,
            published_at: news.published_at
                ? (formatDate(news.published_at) as unknown as Date)
                : undefined,
        };
        setForm(editableNews);
        setEditingId(news.id);
        setErrors({});
        setShowForm(true);
    };

    const handleAdd = () => {
        setForm(initialFormState);
        setEditingId(null);
        setErrors({});
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm(initialFormState);
        setErrors({});
        setShowForm(false);
    };

    const handleDelete = async (id: number) => {
        toast(
            (t) => (
                <div className="text-center">
                    <p className="text-gray-800 font-medium mb-2">
                        Bạn có chắc muốn xoá bài viết này?
                    </p>
                    <div className="flex justify-center gap-3 mt-3">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await deleteNews(id);
                                    toast.success("Đã xoá bài viết!");
                                    fetchNews();
                                } catch {
                                    toast.error("Không thể xoá bài viết!");
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                        >
                            Xoá
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-1 rounded"
                        >
                            Huỷ
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                position: "top-center",
                style: {
                    borderRadius: "12px",
                    background: "#fff",
                    padding: "20px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                },
            }
        );
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Toaster />
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Bài đăng Tin tức
                </h2>

                {/* Nút Thêm mới */}
                {!showForm && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleAdd}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                        >
                            + Thêm bài viết
                        </button>
                    </div>
                )}

                {/* --- Form Thêm/Sửa --- */}
                {showForm && (
                    <div
                        className={`border p-6 rounded-lg mb-8 ${editingId ? "border-yellow-400" : "border-blue-400"
                            }`}
                    >
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">
                            {editingId
                                ? `Sửa Bài viết ID: ${editingId}`
                                : "Thêm Bài viết mới"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề
                                </label>
                                <input
                                    name="title"
                                    placeholder="Nhập tiêu đề"
                                    value={form.title || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày xuất bản
                                </label>
                                <input
                                    title="s"
                                    name="published_at"
                                    type="date"
                                    value={
                                        form.published_at
                                            ? formatDate(form.published_at.toString())
                                            : ""
                                    }
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nội dung
                                </label>
                                <textarea
                                    name="content"
                                    placeholder="Nhập nội dung"
                                    value={form.content || ""}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                                {errors.content && (
                                    <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 md:col-span-3">
                                <input
                                    id="is_published"
                                    name="is_published"
                                    type="checkbox"
                                    checked={!!form.is_published}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="is_published"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Đã xuất bản
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2 rounded-lg font-semibold shadow-md transition bg-gray-400 hover:bg-gray-500 text-white"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${editingId
                                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                            >
                                {editingId ? "Cập nhật" : "Thêm mới"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Bảng danh sách tin tức */}
                {!showForm && (
                    <>
                        {loading ? (
                            <div className="text-center py-8 text-blue-500 font-medium">
                                Đang tải dữ liệu...
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">Tiêu đề</th>
                                            <th className="px-4 py-3 text-left">Trạng thái</th>
                                            <th className="px-4 py-3 text-left">Ngày XB</th>
                                            <th className="px-4 py-3 text-center">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newsList.map((news, idx) => (
                                            <tr
                                                key={news.id}
                                                className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                    } hover:bg-blue-50 transition`}
                                            >
                                                <td className="px-4 py-3">{news.id}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800 line-clamp-2">
                                                    {news.title}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${news.is_published
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {news.is_published ? "Đã xuất bản" : "Nháp"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {formatDate(news.published_at)}
                                                </td>
                                                <td className="px-4 py-3 flex gap-2 justify-center">
                                                    <button
                                                        title="sua"
                                                        onClick={() => handleEdit(news)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition duration-150 shadow-sm"
                                                    >
                                                        <Pencil size={15} />

                                                    </button>
                                                    <button
                                                        title="xoa"
                                                        onClick={() => handleDelete(news.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition duration-150 shadow-sm"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {newsList.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="text-center py-4 text-gray-500"
                                                >
                                                    Không có bài viết nào
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
