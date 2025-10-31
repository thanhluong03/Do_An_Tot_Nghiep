import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pottery Store - Gốm sứ nghệ thuật",
  description: "Khám phá thế giới gốm sứ nghệ thuật với những tác phẩm độc đáo được chế tác thủ công bởi các nghệ nhân tài hoa",
  keywords: "gốm sứ, nghệ thuật, thủ công, đồ gốm, bình hoa, chén dĩa",
  authors: [{ name: "Pottery Store Team" }],
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Thêm các thuộc tính khác (nếu cần)
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="mdl-js">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
             <main>
               {children}
             </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
