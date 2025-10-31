"use client";
import React, { useEffect, useState, useCallback, ChangeEvent } from "react";
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
import { Pencil, Trash2, ImagePlus, Search } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { listUsers, User } from "@/api/services/userService";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const initialFormState: CreateNewsDto = {
    title: "",
    content: "",
    is_published: false,
    user_id: 1,
    image_data: null,
};

const formatDate = (dateString?: Date | string) =>
    dateString ? new Date(dateString).toISOString().split("T")[0] : "";


export default function NewsPage() {



    const [newsList, setNewsList] = useState<News[]>([]);
    const [form, setForm] = useState<CreateNewsDto>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showForm, setShowForm] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const [liveSearchKey, setLiveSearchKey] = useState("");
    const [searchKey, setSearchKey] = useState("");
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    const [users, setUsers] = useState<User[]>([]);

    // STATES MỚI CHO CONFIRM DIALOG
    const [showConfirm, setShowConfirm] = useState(false);
    const [newsToDeleteId, setNewsToDeleteId] = useState<number | null>(null);

    const [adminID, setAdminID] = useState<number>(0);
    const [adminName, setAdminName] = useState<string>("Admin");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const id = Number(localStorage.getItem("adminID")) || 0;
            const name = localStorage.getItem("adminName") || "Admin";
            setAdminID(id);
            setAdminName(name);
        }
    }, []);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const query: ListNewsDto = {
                key: searchKey.trim() || undefined,
                sort: sortOrder,
            };
            const result = await getNews(query);

            setNewsList(result.news);
            setTotalItems(result.total);
        } catch (error) {
            toast.error("Không thể tải tin tức!");
        } finally {
            setLoading(false);
        }
    }, [searchKey, sortOrder]);
    const fetchUsers = useCallback(async () => {
        try {
            const result = await listUsers();
            setUsers(result);
        } catch {
            toast.error("Không thể tải danh sách người dùng!");
        }
    }, []);

    useEffect(() => {
        fetchNews();
        fetchUsers();
    }, [fetchNews, fetchUsers]);

    const handleSearch = () => {
        setSearchKey(liveSearchKey);
    }
    const getAuthorName = (userId?: number) => {
        const user = users.find(u => u.id === userId);
        return user?.full_name || "Không rõ";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        setForm((prev) => ({ ...prev, image_data: file }));

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else if (editingId) {
            const newsItem = newsList.find(n => n.id === editingId);
            if (newsItem?.image_data) {
                setCurrentImageUrl(`data:image/jpeg;base64,${newsItem.image_data}`);
            } else {
                setCurrentImageUrl(null);
            }
        } else {
            setCurrentImageUrl(null);
        }
    };

    const validate = () => {
        const errs: { [key: string]: string } = {};
        if (!form.title?.trim()) errs.title = "Tiêu đề không được bỏ trống";
        if (!form.content?.trim()) errs.content = "Nội dung không được bỏ trống";
        return errs;
    };

    const handleSubmit = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const payload: CreateNewsDto = {
                title: form.title,
                content: form.content,
                is_published: form.is_published,
                user_id: adminID,
                image_data: form.image_data,
            };

            if (editingId) {
                const updatePayload: UpdateNewsDto = payload as unknown as UpdateNewsDto;
                await updateNews(editingId, updatePayload);
                toast.success("Cập nhật bài viết thành công!");
            } else {
                await addNews(payload);
                toast.success("Thêm bài viết thành công!");
            }

            setForm(initialFormState);
            setShowForm(false);
            setEditingId(null);
            setCurrentImageUrl(null);
            setErrors({});
            fetchNews();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi khi lưu bài viết!");
        }
    };

    const handleEdit = (news: News) => {
        setForm({
            title: news.title,
            content: news.content,
            is_published: news.is_published,
            image_data: null,
        } as CreateNewsDto);
        setCurrentImageUrl(news.image_data ? `data:image/jpeg;base64,${news.image_data}` : null);
        setEditingId(news.id);
        setShowForm(true);
        setErrors({});
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(initialFormState);
        setCurrentImageUrl(null);
        setErrors({});
    };

    // HÀM MỞ CONFIRM DIALOG
    const handleDelete = (id: number) => {
        setNewsToDeleteId(id);
        setShowConfirm(true);
    };

    // HÀM XỬ LÝ XÓA SAU KHI CONFIRM
    const handleConfirmDelete = async () => {
        setShowConfirm(false);
        if (newsToDeleteId === null) return;

        try {
            await deleteNews(newsToDeleteId);
            toast.success("Đã xoá bài viết!");
            fetchNews();
        } catch {
            toast.error("Không thể xoá bài viết!");
        } finally {
            setNewsToDeleteId(null);
        }
    };

    // HÀM HỦY XÓA
    const handleCancelDelete = () => {
        setShowConfirm(false);
        setNewsToDeleteId(null);
    };


    return (
        <div className="min-h-screen bg-white shadow-xl  p-2">
            <Toaster />
            <div className="max-w-8xl mx-auto bg-white rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold text-[#B95D26] mb-8 text-center  pb-3">
                    Quản lý Tin tức
                </h2>

                {showForm ? (
                    <div className={`border p-6 rounded-xl shadow-md mb-8 transition-all duration-300 ${editingId ? "border-yellow-400" : "border-orange-400"}`}>
                        <h3 className="text-xl font-semibold mb-5 text-gray-700">
                            {editingId ? "Sửa bài viết" : "Thêm bài viết mới"}
                        </h3>
                        <div className="grid grid-cols-1 gap-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                <input
                                    name="title"
                                    placeholder="Nhập tiêu đề"
                                    value={form.title || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài viết</label>
                                <ReactQuill
                                    theme="snow"
                                    value={form.content || ""}
                                    onChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            content: value,
                                        }))
                                    }
                                    placeholder="Nhập nội dung chi tiết..."
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, 3, 4, false] }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            [{ 'size': ['small', false, 'large', 'huge'] }],
                                            [{ 'color': [] }, { 'background': [] }],
                                            ["link", "image", "video"],
                                            ["clean"],
                                        ],
                                    }}

                                    className="bg-white border border-gray-300 rounded-lg min-h-[500px]"
                                />
                                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <ImagePlus size={16} /> Ảnh tiêu đề bài viết
                                </label>
                                <input
                                    title="xap"
                                    type="file"
                                    name="image_data"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    key={editingId === null ? 'add' : editingId}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-800 hover:file:bg-orange-100 cursor-pointer"
                                />

                                {(currentImageUrl || form.image_data) && (
                                    <div className="mt-3 p-2 border border-gray-200 rounded-lg inline-block">
                                        <p className="text-xs text-gray-500 mb-1 font-medium">Ảnh {form.image_data instanceof File ? "mới" : "hiện tại"}:</p>
                                        <img
                                            src={currentImageUrl || undefined}
                                            alt="Ảnh tiêu đề"
                                            className="w-40 h-40 object-cover rounded-md"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    title="ís"
                                    type="checkbox"
                                    name="is_published"
                                    checked={!!form.is_published}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label className="text-sm font-medium text-gray-700">Đã xuất bản</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2 rounded-lg font-semibold transition bg-gray-200 hover:bg-gray-300 text-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`px-5 py-2 rounded-lg font-semibold transition text-white ${editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-orange-600 hover:bg-orange-700"}`}
                            >
                                {editingId ? "Cập nhật" : "Thêm mới"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-3">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tiêu đề..."
                                    value={liveSearchKey}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLiveSearchKey(val);
                                        setSearchKey(val);
                                    }}

                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-l-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-gray-200 text-gray-600 p-2 border border-gray-300 rounded-r-lg hover:bg-gray-300 transition"
                                    title="Tìm kiếm"
                                >
                                    <Search size={20} />
                                </button>
                            </div>

                            <select
                                title="xap"
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(e.target.value as 'newest' | 'oldest');
                                }}
                                className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="newest">Sắp xếp: Mới nhất</option>
                                <option value="oldest">Sắp xếp: Cũ nhất</option>
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                setForm(initialFormState);
                                setEditingId(null);
                                setCurrentImageUrl(null);
                                setErrors({});
                                setShowForm(true);
                            }}
                            className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-700 transition shadow-md"
                        >
                            + Thêm bài viết
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10 text-lg text-orange-500">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead className="bg-gray-100 rounded-lg shadow-sm">
                                    <tr className="text-gray-600 uppercase text-xs leading-normal">
                                        <th className="px-6 py-3 text-left font-semibold rounded-tl-lg w-12">STT</th>
                                        <th className="px-6 py-3 text-left font-semibold w-24">Ảnh</th>
                                        <th className="px-6 py-3 text-left font-semibold">Tiêu đề</th>
                                        <th className="px-6 py-3 text-left font-semibold">Người đăng</th>
                                        <th className="px-6 py-3 text-center font-semibold">Ngày đăng</th>
                                        <th className="px-6 py-3 text-center font-semibold">Trạng thái</th>
                                        <th className="px-6 py-3 text-center font-semibold rounded-tr-lg w-28">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm font-light">
                                    {newsList.map((n, index) => (
                                        <tr
                                            key={n.id}
                                            className="bg-white hover:bg-gray-50 transition duration-150 ease-in-out border border-gray-100 rounded-lg shadow-sm"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap rounded-l-lg font-bold text-gray-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {n.image_data ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${n.image_data}`}
                                                        alt={n.title}
                                                        className="w-14 h-14 object-cover rounded-md shadow-md"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Không ảnh</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">
                                                {n.title}
                                            </td>
                                            <td className="px-6 py-4">{getAuthorName(n.user_id)}</td>


                                            <td className="px-6 py-4 text-center text-xs">
                                                {n.published_at ? formatDate(n.published_at) : '---'}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${n.is_published
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {n.is_published ? "Đã xuất bản" : "Nháp"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center rounded-r-lg">
                                                <div className="flex justify-center items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(n)}
                                                        title="Chỉnh sửa"
                                                        className="p-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-full transition duration-150"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(n.id)}
                                                        title="Xóa"
                                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition duration-150"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {newsList.length === 0 && (
                                        <tr className="bg-white">
                                            <td colSpan={6} className="text-center py-6 text-gray-500 rounded-lg">
                                                Không có bài viết nào được tìm thấy.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-start items-center mt-6 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                                Hiển thị {newsList.length} trên {totalItems} kết quả
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* RENDER CONFIRM DIALOG */}
            {showConfirm && (
                <ConfirmDialog
                    message={`Bạn có chắc chắn muốn xóa bài viết có ID: ${newsToDeleteId} này không? Hành động này không thể hoàn tác.`}
                    confirmText="Xác nhận Xóa"
                    cancelText="Hủy bỏ"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}