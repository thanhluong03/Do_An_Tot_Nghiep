'use client';

import React, { useState, useEffect } from 'react';
import { CreateVoucherDto, UpdateVoucherDto, VoucherResponseDto } from '@/api/services/voucherService';

interface VoucherFormProps {
    initialData?: VoucherResponseDto; 
    onSubmit: (data: CreateVoucherDto | UpdateVoucherDto) => void;
    onCancel: () => void;
}

const initialFormState: CreateVoucherDto = {
    name: '',
    voucher_percentage: 0,
    quantity: 1,
    order_conditions: 0,
    is_active: true,
    
};
const formatForInput = (date?: Date) => 
    date ? new Date(date).toISOString().slice(0, 16) : '';

export const VoucherForm: React.FC<VoucherFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CreateVoucherDto | UpdateVoucherDto>(initialFormState);
    const isEditMode = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                start_time: initialData.start_time ? new Date(initialData.start_time) : undefined, 
                end_time: initialData.end_time ? new Date(initialData.end_time) : undefined,
                effective_period_begins: initialData.effective_period_begins ? new Date(initialData.effective_period_begins) : undefined,
                effective_period_ends: initialData.effective_period_ends ? new Date(initialData.effective_period_ends) : undefined,
                voucher_percentage: initialData.voucher_percentage,
                quantity: initialData.quantity,
                order_conditions: initialData.order_conditions,
                is_active: initialData.is_active,
            });
        } else {
            setFormData(initialFormState);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: any = value;

        if (type === 'number') {
            processedValue = value === '' ? undefined : Number(value);
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'datetime-local') {
            // Convert chuỗi datetime-local sang Date object
            processedValue = value ? new Date(value) : undefined;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border rounded-xl shadow-2xl max-w-lg mx-auto bg-white transition-all duration-300">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-800 border-b pb-2">
                {isEditMode ? 'Cập Nhật Voucher' : 'Thêm Mới Voucher'}
            </h2>
            <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Tên Voucher</label>
                <input
                    title='Nhập tên voucher'
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Phần Trăm Giảm Giá (%)</label>
                    <input
                    title='Nhập phần trăm giảm giá (0-100%)'
                        type="number"
                        name="voucher_percentage"
                        value={formData.voucher_percentage || ''}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Số Lượng</label>
                    <input
                    title='Nhập số lượng voucher có thể phát hành'
                        type="number"
                        name="quantity"
                        value={formData.quantity || ''}
                        onChange={handleChange}
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Đơn hàng tối thiểu (₫)</label>
                <input
                title='Nhập điều kiện đơn hàng tối thiểu để áp dụng voucher'
                    type="number"
                    name="order_conditions"
                    value={formData.order_conditions || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
            </div>
            <h3 className="text-lg font-bold mb-3 mt-4 text-gray-800 border-b pb-1">Thời Gian Phát Hành (Tùy chọn)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Thời Gian Bắt Đầu PH</label>
                    <input
                        title='Chọn thời gian bắt đầu phát hành voucher'
                        type="datetime-local"
                        name="start_time"
                        value={formatForInput(formData.start_time)}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Thời Gian Kết Thúc PH</label>
                    <input
                        title='Chọn thời gian kết thúc phát hành voucher'
                        type="datetime-local"
                        name="end_time"
                        value={formatForInput(formData.end_time)}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
            <h3 className="text-lg font-bold mb-3 mt-4 text-gray-800 border-b pb-1">Thời Gian Hiệu Lực (Tùy chọn)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Hiệu lực Bắt đầu</label>
                    <input
                        title='Chọn thời gian bắt đầu hiệu lực voucher'
                        type="datetime-local"
                        name="effective_period_begins"
                        value={formatForInput(formData.effective_period_begins)}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Hiệu lực Kết thúc</label>
                    <input
                        title='Chọn thời gian kết thúc hiệu lực voucher'
                        type="datetime-local"
                        name="effective_period_ends"
                        value={formatForInput(formData.effective_period_ends)}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
            <div className="mb-6 flex items-center">
                <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active || false}
                    onChange={handleChange}
                    id="is_active"
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Kích hoạt Voucher?</label>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                >
                    {isEditMode ? 'Lưu Cập Nhật' : 'Tạo Voucher'}
                </button>
            </div>
        </form>
    );
};