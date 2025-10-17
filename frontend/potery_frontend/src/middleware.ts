import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  const adminToken = request.cookies.get('adminToken')?.value || null;
  const guestId = request.cookies.get('guest_id')?.value || null;

  const response = NextResponse.next();

  // 🧩 1. Fix lỗi //login-success
  if (pathname.startsWith('//login-success')) {
    url.pathname = '/login-success';
    return NextResponse.redirect(url);
  }

  // 🧱 2. Gán guest_id cho khách chưa có session
  if (!guestId) {
    response.cookies.set('guest_id', uuidv4(), {
      maxAge: 60 * 60 * 24 * 30, // 30 ngày
      path: '/',
      sameSite: 'lax',
    });
  }

  // 🔒 3. Chặn admin chưa đăng nhập
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 🚪 4. Chặn admin đã đăng nhập quay lại trang login
  if (pathname === '/admin/login' && adminToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return response;
}

// Áp dụng middleware cho tất cả request
export const config = {
  matcher: '/:path*',
};
