import type { Metadata } from "next";
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
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
