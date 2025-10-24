'use client';

import React, { useState, useRef } from 'react';
import { BaseLayout } from '@/layouts';

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";

const AdminAIPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      setUploadStatus({ type: 'error', message: 'Vui lòng chọn một file để tải lên.' });
      return;
    }
    setIsLoading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch(`${API_URL}/upload-document`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Lỗi tải file');
      
      let successMessage = `Tải file thành công: ${result.message}.`;
      if (result.chunks) {
        successMessage += ` Đã xử lý thành ${result.chunks} chunks.`;
      }
      setUploadStatus({ type: 'success', message: successMessage });

    } catch (error: any) {
      console.error('Lỗi tải file:', error);
      setUploadStatus({ type: 'error', message: `Lỗi: ${error.message}` });
    } finally {
      setIsLoading(false);
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
      <div className="flex h-[calc(100vh-80px)] bg-gray-50 justify-center items-center">
        <main className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">📄 Quản lý dữ liệu AI</h1>
            <p className="text-gray-600 mt-2">Tải lên tài liệu để huấn luyện cho chatbot.</p>
          </div>

          <div className="border rounded-lg p-6 mb-6 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 text-gray-700">Tải lên tài liệu mới</h3>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setUploadedFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
              accept=".pdf,.txt,.xlsx,.xls,.csv"
            />
            <button
              onClick={handleFileUpload}
              disabled={!uploadedFile || isLoading}
              className="mt-4 w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-300"
            >
              {isLoading ? 'Đang tải...' : 'Tải lên và Huấn luyện'}
            </button>
            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${uploadStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {uploadStatus.message}
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
            <h4 className="font-bold mb-2">Thông tin hệ thống</h4>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Model:</strong></p><p>Google Gemini Pro</p>
              <p><strong>Embedding:</strong></p><p>Google Embedding-001</p>
              <p><strong>Vector DB:</strong></p><p>ChromaDB</p>
            </div>
          </div>
        </main>
      </div>
    
  );
};

export default AdminAIPage;
