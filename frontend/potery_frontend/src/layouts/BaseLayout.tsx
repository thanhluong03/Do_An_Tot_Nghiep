'use client';

import React from 'react';
import { Header } from '../components/feature/Header';
import { Footer } from '../components/feature/Footer';
import { Toaster } from 'react-hot-toast'; 
interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {/* ✅ Thêm Toaster để hiển thị popup */}
      <Toaster
        position="top-right"  // hiện ở góc phải màn hình
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      />
    </div>
  );
};
