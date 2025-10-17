"use client";
import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title = "Xác nhận hành động",
  message,
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/20 animate-[fadeIn_0.2s_ease-in-out]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center border border-gray-100 transform transition-all scale-100 animate-[zoomIn_0.2s_ease-in-out]">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <AlertTriangle className="text-orange-600" size={36} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
