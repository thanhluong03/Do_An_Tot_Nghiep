'use client';

import React from 'react';
import { CreateVoucherDto, UpdateVoucherDto } from '@/api/services/voucherService';

interface VoucherFormProps {
    formData: CreateVoucherDto | UpdateVoucherDto;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onCancel: () => void;
    errors?: { [key: string]: string };
    isEditMode?: boolean;
    isValid: boolean;
}

const formatForInput = (date?: Date) => {
    if (!date) return '';
    const local = new Date(date);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().slice(0, 16);
};

const getMinDateTime = (date?: Date) => {
    if (!date) return '';

    // Create a copy of the date to avoid modifying the original
    const minDate = new Date(date);

    // Add 1 minute to ensure end time is after start time
    minDate.setMinutes(minDate.getMinutes() + 1);

    // Convert to local timezone for datetime-local input
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    const hours = String(minDate.getHours()).padStart(2, '0');
    const minutes = String(minDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const VoucherForm: React.FC<VoucherFormProps> = ({
    formData,
    onFormChange,
    onSubmit,
    onCancel,
    errors = {},
    isEditMode = false,
    isValid
}) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4">
                <div className="mb-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Tên Voucher <span className="text-red-500">*</span></label>
                    <input
                        title='Nhập tên voucher'
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={onFormChange}
                        required
                        className={`w-full p-1 h-9 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${errors?.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        placeholder="Nhập tên voucher"
                    />
                    {errors?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="mb-2">
                        <label className="block text-sm font-semibold mb-2 text-gray-600">Phần Trăm Giảm Giá (%) <span className="text-red-500">*</span></label>
                        <input
                            title='Nhập phần trăm giảm giá (1-100%)'
                            type="number"
                            name="voucher_percentage"
                            value={formData.voucher_percentage || ''}
                            onChange={onFormChange}
                            min="1"
                            max="100"
                            step="1"
                            required
                            className={`w-full p-1 h-9 border rounded-lg text-sm ${errors?.voucher_percentage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                            placeholder="1-100"
                        />
                        {errors?.voucher_percentage && (
                            <p className="mt-1 text-sm text-red-600">{errors.voucher_percentage}</p>
                        )}
                    </div>
                    <div className="mb-2">
                        <label className="block text-sm font-semibold mb-2 text-gray-600">Số Lượng <span className="text-red-500">*</span></label>
                        <input
                            title='Nhập số lượng voucher có thể phát hành'
                            type="number"
                            name="quantity"
                            value={formData.quantity || ''}
                            onChange={onFormChange}
                            min="1"
                            step="1"
                            required
                            className={`w-full p-1 h-9 border rounded-lg text-sm ${errors?.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                            placeholder="Số lượng voucher"
                        />
                        {errors?.quantity && (
                            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                        )}
                    </div>
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Đơn hàng tối thiểu (₫)</label>
                    <input
                        title='Nhập điều kiện đơn hàng tối thiểu để áp dụng voucher'
                        type="number"
                        name="order_conditions"
                        value={formData.order_conditions || ''}
                        onChange={onFormChange}
                        min="0"
                        step="1000"
                        className={`w-full p-1 h-9 border rounded-lg text-sm ${errors?.order_conditions ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        placeholder="0 (không giới hạn)"
                    />
                    {errors?.order_conditions && (
                        <p className="mt-1 text-sm text-red-600">{errors.order_conditions}</p>
                    )}
                </div>
                <h3 className="text-sm font-bold text-gray-600 pb-0">Thời Gian Phát Hành</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm mb-2 text-gray-600">Thời gian bắt đầu</label>
                        <input
                            title='Chọn thời gian bắt đầu phát hành voucher'
                            type="datetime-local"
                            name="start_time"
                            value={formatForInput(formData.start_time)}
                            onChange={onFormChange}
                            className="w-full p-1 h-9 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600">Thời gian kết thúc</label>
                        <input
                            title='Chọn thời gian kết thúc phát hành voucher'
                            type="datetime-local"
                            name="end_time"
                            value={formatForInput(formData.end_time)}
                            onChange={onFormChange}
                            className={`w-full p-1 h-9 border rounded-lg text-sm ${errors.end_time ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                        />
                        {errors?.end_time && (
                            <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                        )}
                    </div>
                </div>
                <h3 className="text-sm font-bold text-gray-600 mt-3 pb-0">Thời Gian Hiệu Lực</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className="block text-sm mb-2 text-gray-600">Hiệu lực bắt đầu</label>
                        <input
                            title='Chọn thời gian bắt đầu hiệu lực voucher'
                            type="datetime-local"
                            name="effective_period_begins"
                            value={formatForInput(formData.effective_period_begins)}
                            onChange={onFormChange}
                            className="w-full p-1 h-9 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600">Hiệu lực kết thúc</label>
                        <input
                            title='Chọn thời gian kết thúc hiệu lực voucher'
                            type="datetime-local"
                            name="effective_period_ends"
                            value={formatForInput(formData.effective_period_ends)}
                            onChange={onFormChange}
                            min={formData.effective_period_begins ? getMinDateTime(formData.effective_period_begins) : ''}
                            className={`w-full p-1 h-9 border rounded-lg text-sm ${errors?.effective_period_ends ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                        />
                        {errors?.effective_period_ends && (
                            <p className="mt-1 text-sm text-red-600">{errors.effective_period_ends}</p>
                        )}
                    </div>
                </div>
                <div className="mb-6 flex items-center">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active || false}
                        onChange={onFormChange}
                        id="is_active"
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-600">Kích hoạt Voucher?</label>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-2 py-1 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={!isValid}
                        className={`px-4 py-2 font-semibold rounded-lg shadow-md transition duration-150 ${isValid
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isEditMode ? 'Lưu Cập Nhật' : 'Tạo Voucher'}
                    </button>
                </div>
            </div>
        </div>
    );
};
