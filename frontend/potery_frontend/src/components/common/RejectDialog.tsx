"use client";
import React, { useState } from "react";
import { XCircle, X } from "lucide-react";

interface RejectDialogProps {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

const RejectDialog: React.FC<RejectDialogProps> = ({
    title = "Từ chối yêu cầu nhập hàng",
    message = "Vui lòng nhập lý do từ chối yêu cầu này:",
    confirmText = "Xác nhận từ chối",
    cancelText = "Hủy bỏ",
    onConfirm,
    onCancel,
}) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Vui lòng nhập lý do từ chối");
            return;
        }
        onConfirm(reason.trim());
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 animate-[fadeIn_0.2s_ease-in-out]">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-lg border border-gray-100 transform transition-all scale-100 animate-[zoomIn_0.2s_ease-in-out]">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-3 rounded-full">
                            <XCircle className="text-red-600" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">{message}</p>

                <div className="mb-6">
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError("");
                        }}
                        placeholder="Nhập lý do từ chối (bắt buộc)..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none ${error ? "border-red-500" : "border-gray-300"
                            }`}
                        rows={4}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectDialog;
