import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';

interface ReturnOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, images: File[]) => Promise<void>;
    loading?: boolean;
}

export const ReturnOrderModal: React.FC<ReturnOrderModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false
}) => {
    const [reason, setReason] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limit to 5 images
        const newFiles = [...images, ...files].slice(0, 5);
        setImages(newFiles);

        // Create previews
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        // Cleanup URL
        URL.revokeObjectURL(previews[index]);

        setImages(newImages);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        try {
            await onSubmit(reason, images);
            // Modal sẽ được đóng bởi parent component
        } catch (error) {
            console.error('Error submitting return request:', error);
            // Modal vẫn mở nếu có lỗi
        }
    };

    const handleClose = () => {
        setReason('');
        setImages([]);
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-[#e5e7eb]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Lý do đổi trả</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        aria-label="Đóng"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6">
                    <div>
                        <label htmlFor="reason" className="block text-base font-medium text-gray-700 mb-2">
                            Lý do <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Vui lòng mô tả chi tiết lý do đổi trả..."
                            className="w-full px-4 py-3 border-2 rounded-xl resize-none text-gray-800 placeholder-gray-400 text-base shadow-sm transition"
                            style={{ borderColor: '#C4975A', boxShadow: 'none', outline: 'none' }}
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex flex-row items-center gap-6 mb-4">
                            <label className="text-base font-medium text-gray-700 whitespace-nowrap">
                                Minh chứng <span className="text-xs text-gray-400">(tối đa 5 ảnh)</span>
                            </label>
                            {images.length < 5 && (
                                <div className="flex items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="border-2 border-dashed border-[#C4975A] rounded-xl px-3 py-2 text-center cursor-pointer hover:border-[#a97e4a] transition-colors flex flex-col items-center gap-1 bg-gray-50"
                                        style={{ minWidth: '120px', maxWidth: '130px', height: '50px' }}
                                    >
                                        <Upload className="w-5 h-5 text-[#C4975A] mb-1" />
                                        <span className="text-xs text-gray-600">Chọn ảnh</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square relative overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                            <Image
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow group-hover:scale-110 transition"
                                            aria-label="Xóa ảnh"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition disabled:opacity-50"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-5 py-3 bg-[#C4975A] text-white rounded-xl hover:bg-[#a97e4a] font-semibold shadow transition disabled:opacity-50"
                            disabled={!reason.trim() || loading}
                        >
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};