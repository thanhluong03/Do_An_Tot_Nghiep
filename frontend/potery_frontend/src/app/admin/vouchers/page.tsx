// src/app/vouchers/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    listVouchersAdmin, 
    createVoucher, 
    updateVoucher, 
    deleteVoucher, 
    getVoucherDetail,
    VoucherResponseDto, 
    CreateVoucherDto, 
    UpdateVoucherDto, 
    ListVoucherRequestDto 
} from '@/api/services/voucherService';
import { VoucherForm } from '@/components/adminVoucher/VoucherForm'; 

const AdminVoucherPage: React.FC = () => {
    // 1. STATE QUẢN LÝ
    const [vouchers, setVouchers] = useState<VoucherResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<VoucherResponseDto | undefined>(undefined);
    const [queryParams, setQueryParams] = useState<ListVoucherRequestDto>({ page: 1, size: 10, key: '' });
    
    // 2. LOGIC TẢI DỮ LIỆU
    const fetchVouchers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await listVouchersAdmin(queryParams);
            setVouchers(data);
        } catch (err) {
            setError('Lỗi khi tải danh sách voucher. Vui lòng kiểm tra kết nối API.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    // 3. XỬ LÝ SỰ KIỆN FORM (CREATE/UPDATE)
    const handleCreateOrUpdate = async (data: CreateVoucherDto | UpdateVoucherDto) => {
        setIsLoading(true);
        setError(null);
        try {
            if (editingVoucher) {
                // Sửa
                await updateVoucher(editingVoucher.id, data as UpdateVoucherDto);
                alert('Cập nhật voucher thành công!');
            } else {
                // Thêm mới (Backend yêu cầu mảng [DTO])
                await createVoucher([data as CreateVoucherDto]);
                alert('Tạo voucher thành công!');
            }
            handleCancel(); // Đóng form
            await fetchVouchers(); // Tải lại danh sách
        } catch (err) {
            setError(`Thao tác thất bại: ${err instanceof Error ? err.message : 'Lỗi không xác định.'}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. CHỨC NĂNG SỬA
    const handleEditClick = async (id: number) => {
        setIsLoading(true);
        try {
            const detail = await getVoucherDetail(id);
            setEditingVoucher(detail);
            setIsFormOpen(true);
        } catch (err) {
            setError('Không tìm thấy chi tiết voucher để sửa.');
        } finally {
            setIsLoading(false);
        }
    };

    // 5. CHỨC NĂNG XÓA (SOFT DELETE)
    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa mềm (soft delete) voucher này?')) return;
        setIsLoading(true);
        try {
            await deleteVoucher(id);
            alert('Xóa mềm voucher thành công.');
            await fetchVouchers(); // Tải lại danh sách
        } catch (err) {
            setError('Xóa mềm thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    // 6. ĐÓNG FORM
    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingVoucher(undefined); // Reset voucher đang sửa
    };

    // 7. TÌM KIẾM
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Giữ nguyên page, chỉ cập nhật key và fetch lại
        fetchVouchers();
    }

    // 8. HÀM HỖ TRỢ HIỂN THỊ
    const formatTime = (date?: Date) => {
        if (!date) return 'Vô thời hạn';
        return new Date(date).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    // 9. GIAO DIỆN HIỂN THỊ
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-3">Quản Lý Voucher</h1>

            {/* Hiển thị lỗi */}
            {error && <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium">{error}</div>}
            
            <div className="flex justify-between items-center mb-6">
                {/* Form Tìm kiếm */}
                <form onSubmit={handleSearch} className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
                        value={queryParams.key || ''}
                        onChange={(e) => setQueryParams(prev => ({ ...prev, key: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-80"
                    />
                    <button type="submit" className="px-5 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-150">Tìm Kiếm</button>
                </form>
                
                {/* Nút Tạo Mới */}
                <button
                    onClick={() => { setIsFormOpen(true); setEditingVoucher(undefined); }}
                    className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-150"
                >
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Tạo Voucher Mới
                </button>
            </div>

            {/* Modal/Overlay cho Form Thêm/Sửa */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-none flex items-center justify-center z-50 p-4">
                    <VoucherForm 
                        initialData={editingVoucher}
                        onSubmit={handleCreateOrUpdate}
                        onCancel={handleCancel}
                    />
                </div>
            )}
            
            {/* Loading */}
            {isLoading && (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-lg text-blue-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            )}

            {/* Bảng Danh Sách Voucher */}
            {!isLoading && vouchers.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-xl shadow-2xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">ID</th>
                                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">Tên Voucher</th>
                                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">Giảm Giá (%)</th>
                                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">Số Lượng</th>
                                <th className="py-4 px-6 text-right text-xs font-extrabold text-gray-600 uppercase tracking-wider">Min Order (₫)</th>
                                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">Hết Hạn</th>
                                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vouchers.map((voucher) => (
                                <tr key={voucher.id} className="hover:bg-yellow-50 transition duration-100">
                                    <td className="py-3 px-6 whitespace-nowrap text-sm font-semibold text-gray-900">{voucher.id}</td>
                                    <td className="py-3 px-6 whitespace-nowrap text-sm font-medium text-gray-800">{voucher.name}</td>
                                    <td className="py-3 px-6 whitespace-nowrap text-sm text-center text-gray-700">{voucher.voucher_percentage}%</td>
                                    <td className="py-3 px-6 whitespace-nowrap text-sm text-center text-gray-700">{voucher.quantity}</td>
                                    <td className="py-3 px-6 whitespace-nowrap text-sm text-right text-gray-700">
                                        {voucher.order_conditions?.toLocaleString() || 0}
                                    </td>
                                    <td className="py-3 px-6 whitespace-nowrap text-sm text-gray-700">
                                        {formatTime(voucher.effective_period_ends)}
                                    </td>
                                    <td className="py-3 px-6 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${voucher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {voucher.is_active ? 'Hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                        <button 
                                            onClick={() => handleEditClick(voucher.id)}
                                            className="text-blue-600 hover:text-blue-800 font-semibold transition duration-150"
                                        >
                                            Sửa
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(voucher.id)}
                                            className="text-red-600 hover:text-red-800 font-semibold transition duration-150"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {!isLoading && vouchers.length === 0 && (
                <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl bg-white shadow-inner">
                    <p className="text-xl text-gray-600">Không tìm thấy Voucher nào. Hãy tạo Voucher mới!</p>
                </div>
            )}

            {/* Pagination có thể được thêm vào đây */}
        </div>
    );
};

export default AdminVoucherPage;