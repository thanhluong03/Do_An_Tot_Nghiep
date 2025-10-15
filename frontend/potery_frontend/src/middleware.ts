import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const adminToken = request.cookies.get("adminToken") || null;
  const { pathname } = request.nextUrl;

  // Nếu URL có //login-success -> sửa lại đúng path
  if (url.pathname.startsWith('//login-success')) {
    url.pathname = '/login-success';
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" && // 🔥 Loại trừ trang login
    !adminToken
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Nếu đã đăng nhập mà vẫn cố vào /admin/login thì chuyển sang /admin
  if (pathname === "/admin/login" && adminToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  
}

// Áp dụng cho tất cả request
export const config = {
  matcher: '/:path*',
};


