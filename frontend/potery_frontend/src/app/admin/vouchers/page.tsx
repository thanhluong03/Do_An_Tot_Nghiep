'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
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
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Pencil, Trash2 } from 'lucide-react';
import PaginationControls from '@/components/common/PaginationControls'; // <-- THÊM DÒNG NÀY
const AdminVoucherPage: React.FC = () => {
  const [allVouchers, setAllVouchers] = useState<VoucherResponseDto[]>([]);
  const [vouchers, setVouchers] = useState<VoucherResponseDto[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<VoucherResponseDto[]>([]); // <--- ĐỔI 'vouchers' thành 'filteredVouchers'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherResponseDto | undefined>(undefined);
  const [queryParams, setQueryParams] = useState<ListVoucherRequestDto>({ page: 1, size: 10, key: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const pageSize = queryParams.size ?? 10;
  const [currentPage, setCurrentPage] = useState(1);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVouchers.slice(startIndex, startIndex + pageSize);
  }, [filteredVouchers, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // --- FETCH DATA ---
  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Lấy toàn bộ dữ liệu (hoặc số lượng lớn) để phân trang FE
      const data = await listVouchersAdmin({ page: 1, size: 1000, key: '' });
      setAllVouchers(data);

      // Cập nhật filteredVouchers ngay sau khi fetch (trường hợp key rỗng)
      setFilteredVouchers(data);
      setCurrentPage(1); // Reset về trang 1
    } catch (err) {
      setError('Lỗi khi tải danh sách voucher.');
      toast.error('Không thể tải danh sách voucher!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // --- CREATE / UPDATE ---
  const handleCreateOrUpdate = async (data: CreateVoucherDto | UpdateVoucherDto) => {
    setIsLoading(true);
    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, data as UpdateVoucherDto);
        toast.success('Cập nhật voucher thành công!');
      } else {
        await createVoucher([data as CreateVoucherDto]);
        toast.success('Tạo voucher mới thành công!');
      }
      handleCancel();
      await fetchVouchers();
    } catch (err) {
      toast.error('❌ Thao tác thất bại! Kiểm tra console log.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EDIT ---
  const handleEditClick = async (id: number) => {
    setIsLoading(true);
    try {
      const detail = await getVoucherDetail(id);
      setEditingVoucher(detail);
      setIsFormOpen(true);
    } catch (err) {
      toast.error('Không thể tải chi tiết voucher.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE ---
  const handleDeleteClick = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return;
    const idToDelete = confirmDeleteId;
    setConfirmDeleteId(null);
    setIsLoading(true);
    try {
      await deleteVoucher(idToDelete);
      toast.success('Đã xóa voucher thành công!');
      await fetchVouchers();
    } catch (err) {
      toast.error('Xóa voucher thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => setConfirmDeleteId(null);
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingVoucher(undefined);
  };

  // --- SEARCH FRONTEND ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = queryParams.key?.trim().toLowerCase() || '';

    // Lọc trên toàn bộ dữ liệu (allVouchers)
    const filtered = allVouchers.filter(voucher =>
      voucher.name?.toLowerCase().includes(keyword)
    );

    setFilteredVouchers(filtered); // <-- Cập nhật state đã đổi tên
    setCurrentPage(1); // <-- THÊM: Reset về trang 1 sau khi tìm kiếm
  };
  const formatTime = (date?: Date) => {
    if (!date) return 'Vô thời hạn';
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- RENDER ---
  return (
    <div className="p-8 bg-white min-h-screen shadow-smd border border-gray-200">
      <Toaster position="top-right" reverseOrder={false} />

      <h1 className="text-3xl font-extrabold mb-8 text-[#B95D26] border-b pb-3">
        Quản lý Voucher
      </h1>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex space-x-3">
          <input
            title="Nhập tên voucher để tìm kiếm"
            type="text"
            placeholder="Tìm voucher..."
            value={queryParams.key || ''}
            onChange={(e) => setQueryParams(prev => ({ ...prev, key: e.target.value }))}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-80"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-150"
          >
            Tìm Kiếm
          </button>
        </form>

        <button
          onClick={() => { setIsFormOpen(true); setEditingVoucher(undefined); }}
          className="px-5 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-700 transition duration-150"
        >
          + Tạo Voucher Mới
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <VoucherForm
            initialData={editingVoucher}
            onSubmit={handleCreateOrUpdate}
            onCancel={handleCancel}
          />
        </div>
      )}

      {confirmDeleteId !== null && (
        <ConfirmDialog
          title="Xác nhận Xóa Voucher"
          message={`Bạn có chắc chắn muốn xóa Voucher có ID: ${confirmDeleteId} không? Hành động này không thể hoàn tác.`}
          confirmText="Xác nhận Xóa"
          cancelText="Hủy bỏ"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-lg text-blue-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}

      {!isLoading && filteredVouchers.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-2xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase">STT</th>
                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase">Tên Voucher</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase">Giảm Giá (%)</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase">Số Lượng</th>
                <th className="py-4 px-6 text-right text-xs font-extrabold text-gray-600 uppercase">Min Order (₫)</th>
                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase">Bắt Đầu PH</th>
                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase">Kết Thúc PH</th>
                <th className="py-4 px-6 text-left text-xs font-extrabold text-gray-600 uppercase">Hết Hạn Hiệu Lực</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase">Trạng Thái</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 uppercase">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((voucher, index) => (
                <tr key={voucher.id} className="hover:bg-yellow-50 transition duration-100">
                  <td className="py-3 px-6 text-sm font-semibold text-gray-900">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{voucher.name}</td>
                  <td className="py-3 px-6 text-sm text-center text-gray-700">{Math.round(voucher.voucher_percentage ?? 0)}%</td>
                  <td className="py-3 px-6 text-sm text-center text-gray-700">{voucher.quantity}</td>
                  <td className="py-3 px-6 text-sm text-right text-gray-700">
                    {/* Ép kiểu sang Number và sử dụng tùy chọn định dạng */}
                    {Number(voucher.order_conditions).toLocaleString('vi-VN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      // Dùng useGrouping: false nếu giá trị nhỏ hơn 10000 
                      useGrouping: Number(voucher.order_conditions) >= 10000,
                    }) || '0'}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{formatTime(voucher.start_time)}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{formatTime(voucher.end_time)}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{formatTime(voucher.effective_period_ends)}</td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${voucher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {voucher.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center space-x-3">
                    <button
                      title="sửa"
                      onClick={() => handleEditClick(voucher.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="xóa"
                      onClick={() => handleDeleteClick(voucher.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PaginationControls
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredVouchers.length} // Tổng số mục ĐÃ LỌC
        onPageChange={handlePageChange}
      />

      {!isLoading && filteredVouchers.length === 0 && (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl bg-white shadow-inner">
          <p className="text-xl text-gray-600">Không tìm thấy Voucher nào. Hãy tạo Voucher mới!</p>
        </div>
      )}
    </div>
  );
};

export default AdminVoucherPage;
