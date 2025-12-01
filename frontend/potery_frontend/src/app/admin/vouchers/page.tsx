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
  const [filteredVouchers, setFilteredVouchers] = useState<VoucherResponseDto[]>([]); // <--- ĐỔI 'vouchers' thành 'filteredVouchers'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherResponseDto | undefined>(undefined);
  const [queryParams, setQueryParams] = useState<ListVoucherRequestDto>({ page: 1, size: 10, key: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<CreateVoucherDto | UpdateVoucherDto>({
    name: '',
    voucher_percentage: 0,
    quantity: 1,
    order_conditions: 0,
    is_active: true,
  });

  const pageSize = queryParams.size ?? 10;
  const [currentPage, setCurrentPage] = useState(1);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVouchers.slice(startIndex, startIndex + pageSize);
  }, [filteredVouchers, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // --- REAL-TIME VALIDATION ---
  const validateField = (name: string, value: string | number | boolean | Date | undefined): string => {
    switch (name) {
      case 'name':
        if (!value || !value.toString().trim()) {
          return 'Tên voucher không được bỏ trống';
        }
        return '';
      case 'voucher_percentage':
        const percentage = Number(value);
        if (!percentage || percentage <= 0 || percentage > 100) {
          return 'Phần trăm giảm giá phải từ 1 đến 100';
        }
        return '';
      case 'quantity':
        const quantity = Number(value);
        if (!quantity || quantity < 1) {
          return 'Số lượng phải lớn hơn 0';
        }
        return '';
      case 'order_conditions':
        const conditions = Number(value);
        if (conditions < 0) {
          return 'Điều kiện đơn hàng không được âm';
        }
        return '';
      case 'end_time':
        if (value && formData.start_time) {
          const startDate = new Date(formData.start_time);
          const endDate = new Date(value as Date);
          if (endDate <= startDate) {
            return 'Thời gian kết thúc phát hành phải sau thời gian bắt đầu';
          }
        }
        return '';
      case 'effective_period_ends':
        if (value && formData.effective_period_begins) {
          const startDate = new Date(formData.effective_period_begins);
          const endDate = new Date(value as Date);
          if (endDate <= startDate) {
            return 'Thời gian kết thúc hiệu lực phải sau thời gian bắt đầu';
          }
        }
        return '';
      default:
        return '';
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | Date | undefined = value;

    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'datetime-local') {
      processedValue = value ? new Date(value) : undefined;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Real-time validation
    const error = validateField(name, processedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));

    // Additional validation for date dependencies
    if (name === 'start_time' && formData.end_time) {
      const endError = validateField('end_time', formData.end_time);
      setErrors(prev => ({
        ...prev,
        end_time: endError,
      }));
    }
    if (name === 'effective_period_begins' && formData.effective_period_ends) {
      const endError = validateField('effective_period_ends', formData.effective_period_ends);
      setErrors(prev => ({
        ...prev,
        effective_period_ends: endError,
      }));
    }
  };

  const isFormValid = (): boolean => {
    return Boolean(
      formData.name?.toString().trim() &&
      formData.voucher_percentage &&
      formData.voucher_percentage > 0 &&
      formData.voucher_percentage <= 100 &&
      formData.quantity &&
      formData.quantity > 0 &&
      (formData.order_conditions === undefined || formData.order_conditions >= 0)
    );
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
    } catch (error) {
      setError('Lỗi khi tải danh sách voucher.');
      toast.error('Không thể tải danh sách voucher!');
      console.error('Fetch vouchers error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // --- VALIDATION ---
  const validateVoucherForm = (data: CreateVoucherDto | UpdateVoucherDto): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Tên voucher không được bỏ trống';
    }

    if (!data.voucher_percentage || data.voucher_percentage <= 0 || data.voucher_percentage > 100) {
      newErrors.voucher_percentage = 'Phần trăm giảm giá phải từ 1 đến 100';
    }

    if (!data.quantity || data.quantity < 1) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    }

    if (data.order_conditions !== undefined && data.order_conditions < 0) {
      newErrors.order_conditions = 'Điều kiện đơn hàng không được âm';
    }

    // Validate time periods if provided
    if (data.start_time && data.end_time && new Date(data.start_time) >= new Date(data.end_time)) {
      newErrors.end_time = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }

    if (data.effective_period_begins && data.effective_period_ends &&
      new Date(data.effective_period_begins) >= new Date(data.effective_period_ends)) {
      newErrors.effective_period_ends = 'Thời gian kết thúc hiệu lực phải sau thời gian bắt đầu';
    }

    return newErrors;
  };

  // --- CREATE / UPDATE ---
  const handleCreateOrUpdate = async (data: CreateVoucherDto | UpdateVoucherDto) => {
    const validationErrors = validateVoucherForm(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Vui lòng kiểm tra lại thông tin nhập vào!');
      return;
    }

    setErrors({});
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
    } catch (error) {
      toast.error('❌ Thao tác thất bại! Kiểm tra console log.');
      console.error('Create/Update error:', error);
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
      setFormData({
        name: detail.name,
        voucher_percentage: detail.voucher_percentage,
        quantity: detail.quantity,
        order_conditions: detail.order_conditions,
        is_active: detail.is_active,
        start_time: detail.start_time ? new Date(detail.start_time) : undefined,
        end_time: detail.end_time ? new Date(detail.end_time) : undefined,
        effective_period_begins: detail.effective_period_begins ? new Date(detail.effective_period_begins) : undefined,
        effective_period_ends: detail.effective_period_ends ? new Date(detail.effective_period_ends) : undefined,
      });
      setIsFormVisible(true);
      setErrors({});
    } catch (error) {
      toast.error('Không thể tải chi tiết voucher.');
      console.error('Edit voucher error:', error);
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
    } catch (error) {
      toast.error('Xóa voucher thất bại!');
      console.error('Delete voucher error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => setConfirmDeleteId(null);
  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingVoucher(undefined);
    setErrors({});
    setFormData({
      name: '',
      voucher_percentage: 0,
      quantity: 1,
      order_conditions: 0,
      is_active: true,
    });
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
  const formatTime = (date?: Date | string, oneLine?: boolean) => {
    if (!date) return 'Vô thời hạn';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (oneLine) {
      return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    }
    return d.toLocaleString('vi-VN', {
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

      <h1 className="text-2xl font-extrabold mb-8 text-[#B95D26] pb-3">
        Quản lý Voucher
      </h1>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            title="Nhập tên voucher để tìm kiếm"
            type="text"
            placeholder="Tìm voucher..."
            value={queryParams.key || ''}
            onChange={(e) => setQueryParams(prev => ({ ...prev, key: e.target.value }))}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-[340px] text-sm h-9"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-150 text-sm h-9"
            style={{ minWidth: '80px' }}
          >
            Tìm Kiếm
          </button>
        </form>

        <button
          onClick={() => {
            if (isFormVisible) {
              handleCancel();
            }
            setEditingVoucher(undefined);
            setErrors({});
            setFormData({
              name: '',
              voucher_percentage: 0,
              quantity: 1,
              order_conditions: 0,
              is_active: true,
            });
            setIsFormVisible(true);
          }}
          className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-700 transition duration-150"
        >
          + Tạo Voucher Mới
        </button>
      </div>

      {/* FORM SECTION - Show below like promotion page */}
      {isFormVisible && (
        <>
          <div className="relative border border-[#B95D26] p-6 rounded-xl shadow-md bg-white mb-8">
            {/* <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-light transition"
              title="Đóng Form"
            >
              &times;
            </button> */}

            <h3 className="text-xl text-[#B95D26] font-semibold mb-6 pr-10">
              {editingVoucher
                ? `Cập nhật voucher: ${editingVoucher.name || editingVoucher.id}`
                : "Thêm voucher mới"}
            </h3>

            <VoucherForm
              formData={formData}
              onFormChange={handleFormChange}
              onSubmit={() => handleCreateOrUpdate(formData)}
              onCancel={handleCancel}
              errors={errors}
              isEditMode={!!editingVoucher}
              isValid={isFormValid()}
            />
          </div>
          <hr className="my-8 border-gray-200" />
        </>
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
                <th className="py-4 px-2 w-[40px] text-center text-xs font-extrabold text-gray-600 ">STT</th>
                <th className="py-4 px-6 w-[220px] text-center text-xs font-extrabold text-gray-600 ">Tên voucher</th>
                <th className="py-4 px-2 w-[70px] text-center text-xs font-extrabold text-gray-600 ">Giảm giá (%)</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 ">Số lượng</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 ">Đơn tối thiểu (₫)</th>
                <th className="py-4 px-6 w-[170px] text-center text-xs font-extrabold text-gray-600 ">Phát hành</th>
                <th className="py-4 px-6 w-[170px] text-center text-xs font-extrabold text-gray-600 ">Hiệu lực</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 ">Trạng thái</th>
                <th className="py-4 px-6 text-center text-xs font-extrabold text-gray-600 ">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((voucher, index) => (
                <tr key={voucher.id} className="hover:bg-yellow-50 transition duration-100">
                  <td className="py-3 px-2 text-sm text-gray-900 align-middle whitespace-nowrap text-center">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="py-3 px-6 w-[220px] text-sm text-gray-800 align-middle whitespace-normal">{voucher.name}</td>
                  <td className="py-3 px-2 w-[70px] text-sm text-center text-gray-700 align-middle whitespace-nowrap">{Math.round(voucher.voucher_percentage ?? 0)}%</td>
                  <td className="py-3 px-6 text-sm text-center text-gray-700 align-middle whitespace-nowrap">{voucher.quantity}</td>
                  <td className="py-3 px-6 text-sm text-right text-gray-700 align-middle whitespace-nowrap">
                    {Number(voucher.order_conditions).toLocaleString('vi-VN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      useGrouping: Number(voucher.order_conditions) >= 10000,
                    }) || '0'}
                  </td>
                  <td className="py-3 px-6 w-[170px] text-xs text-gray-700 align-middle whitespace-nowrap">
                    <span><span>BĐ:</span> {formatTime(voucher.start_time, true)}</span><br />
                    <span><span>KT:</span> {formatTime(voucher.end_time, true)}</span>
                  </td>
                  <td className="py-3 px-6 w-[170px] text-xs text-gray-700 align-middle whitespace-nowrap">
                    <span><span>BĐ:</span> {formatTime(voucher.effective_period_begins, true)}</span><br />
                    <span><span>KT:</span> {formatTime(voucher.effective_period_ends, true)}</span>
                  </td>
                  <td className="py-3 px-6 text-center align-middle whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${voucher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {voucher.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center space-x-3 align-middle whitespace-nowrap">
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
