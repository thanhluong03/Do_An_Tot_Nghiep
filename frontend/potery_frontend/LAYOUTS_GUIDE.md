# Hướng Dẫn Sử Dụng Layouts

## 📁 Cấu trúc Layouts

```
src/
├── layouts/                    # Thư mục chứa các layout components
│   ├── BaseLayout.tsx         # Layout chính có Header + Footer
│   ├── AuthLayout.tsx         # Layout cho đăng nhập/đăng ký
│   ├── AdminLayout.tsx        # Layout cho Admin với sidebar
│   ├── StoreLayout.tsx        # Layout cho Store với sidebar
│   └── index.ts               # Export tất cả layouts
├── app/                       # Next.js App Router
│   ├── (auth)/               # Route group cho authentication
│   │   ├── layout.tsx        # Sử dụng AuthLayout
│   │   ├── login/page.tsx    # Trang đăng nhập
│   │   └── register/page.tsx # Trang đăng ký
│   ├── admin/                # Thư mục admin
│   │   ├── layout.tsx        # Sử dụng AdminLayout
│   │   └── dashboard/page.tsx # Dashboard admin
│   ├── store/                # Thư mục store
│   │   ├── layout.tsx        # Sử dụng StoreLayout
│   │   └── dashboard/page.tsx # Dashboard store
│   └── page.tsx              # Trang chủ sử dụng BaseLayout
```

## 🎯 Các Layout Types

### 1. **BaseLayout** - Layout chính
- **Có**: Header + Footer
- **Dùng cho**: Trang chủ, sản phẩm, tin tức, liên hệ
- **Màu sắc**: Tông màu chính của website

### 2. **AuthLayout** - Layout đăng nhập/đăng ký
- **Không có**: Header + Footer
- **Dùng cho**: Login, Register, Forgot Password
- **Màu sắc**: Nền be, form trắng, tập trung vào form

### 3. **AdminLayout** - Layout quản trị
- **Có**: Sidebar + Top bar (không có Header/Footer)
- **Dùng cho**: Dashboard admin, quản lý sản phẩm, đơn hàng
- **Màu sắc**: Nâu đậm (#65604E) cho sidebar

### 4. **StoreLayout** - Layout cửa hàng
- **Có**: Sidebar + Top bar (không có Header/Footer)
- **Dùng cho**: Dashboard store, quản lý sản phẩm của store
- **Màu sắc**: Xanh ô liu (#7A8471) cho sidebar

## 🚀 Cách Sử Dụng

### Sử dụng trong Layout Files

```tsx
// app/admin/layout.tsx
import { AdminLayout } from '../../layouts';

export default function AdminLayoutWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
```

### Sử dụng trực tiếp trong component

```tsx
// app/page.tsx
import { BaseLayout } from '../layouts';

export default function HomePage() {
  return (
    <BaseLayout>
      <HeroSection />
      <FeaturedProducts />
    </BaseLayout>
  );
}
```

## 🎨 Customization

### Thêm layout mới

1. Tạo file trong `src/layouts/`
2. Export trong `src/layouts/index.ts`
3. Sử dụng trong route group hoặc component

### Thay đổi màu sắc

```tsx
// Trong layout component
<div className="bg-[#YOUR_COLOR]">
  {/* Content */}
</div>
```

### Thêm sidebar items

```tsx
// Trong AdminLayout hoặc StoreLayout
const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Sản Phẩm', href: '/admin/products', icon: '🏺' },
  // Thêm items mới
];
```

## 📱 Responsive Design

Tất cả layouts đều responsive:
- **Mobile**: Sidebar ẩn, có button toggle
- **Tablet**: Sidebar thu gọn
- **Desktop**: Sidebar hiển thị đầy đủ

## 🔐 Authentication Integration

Layouts tự động tích hợp với AuthContext:
- Kiểm tra quyền truy cập
- Redirect nếu chưa đăng nhập
- Hiển thị thông tin user

## 🎯 Best Practices

1. **Sử dụng Route Groups** cho các layout khác nhau
2. **Tái sử dụng components** giữa các layouts
3. **Consistent styling** với design system
4. **Mobile-first approach** cho responsive
5. **Accessibility** với proper ARIA labels

## 📝 Ví Dụ Thực Tế

### Tạo trang mới với BaseLayout

```tsx
// app/products/page.tsx
import { BaseLayout } from '../layouts';

export default function ProductsPage() {
  return (
    <BaseLayout>
      <h1>Sản Phẩm</h1>
      {/* Product content */}
    </BaseLayout>
  );
}
```

### Tạo trang admin mới

```tsx
// app/admin/products/page.tsx
export default function AdminProductsPage() {
  return (
    <div>
      <h1>Quản Lý Sản Phẩm</h1>
      {/* Admin product management */}
    </div>
  );
}
```

Layout sẽ tự động áp dụng AdminLayout thông qua layout.tsx trong thư mục admin.
