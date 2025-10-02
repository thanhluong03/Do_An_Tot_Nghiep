# Pottery Frontend

Trang web bán hàng gốm sứ nghệ thuật được xây dựng với Next.js 15 và TypeScript.

## 🚀 Tính năng

- **Trang chủ với animation**: Hero section với hiệu ứng blob animation, countdown timer cho flash sale
- **Quản lý sản phẩm**: Hiển thị danh sách sản phẩm, tìm kiếm, lọc theo danh mục
- **Flash Sale**: Hiển thị sản phẩm flash sale với countdown timer real-time
- **Danh mục sản phẩm**: Grid layout responsive cho các danh mục
- **Responsive Design**: Tối ưu cho mọi thiết bị
- **TypeScript**: Type safety và IntelliSense
- **Custom Hooks**: Tái sử dụng logic state management

## 📁 Cấu trúc thư mục

```
src/
├── api/                    # API calls
│   ├── modules/           # Phân chia theo module
│   │   ├── products.ts    # API sản phẩm
│   │   └── users.ts       # API người dùng
│   └── index.ts           # Export tất cả API
├── components/            # UI Components
│   ├── common/           # Components dùng chung
│   │   ├── Button.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   └── feature/          # Components tính năng
│       ├── HeroSection.tsx
│       ├── ProductCard.tsx
│       ├── ProductGrid.tsx
│       ├── FlashSaleSection.tsx
│       ├── CategorySection.tsx
│       └── index.ts
├── hooks/                # Custom React Hooks
│   ├── useProducts.ts    # Hook quản lý sản phẩm
│   ├── useAuth.ts        # Hook xác thực
│   └── index.ts
├── types/                # TypeScript types
│   ├── product.ts        # Types sản phẩm
│   ├── user.ts           # Types người dùng
│   └── index.ts
├── utils/                # Utility functions
│   ├── cn.ts            # Class name utility
│   └── format.ts        # Format functions
└── app/                 # Next.js App Router
    ├── globals.css      # Global styles với animations
    ├── layout.tsx       # Root layout
    └── page.tsx         # Trang chủ
```

## 🛠️ Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Chạy development server:**
```bash
npm run dev
```

3. **Build cho production:**
```bash
npm run build
```

## 🎨 Animations

- **Blob Animation**: Hiệu ứng blob floating trong hero section
- **Hover Effects**: Transform và scale effects khi hover
- **Loading States**: Skeleton loading và spinner animations
- **Countdown Timer**: Real-time countdown cho flash sale
- **Smooth Transitions**: Transition mượt mà giữa các states

## 🔧 Custom Hooks

### useProducts
```typescript
const { products, loading, error } = useProducts({
  page: 1,
  limit: 8,
  category: 'ceramics'
});
```

### useAuth
```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Grid System**: Responsive grid cho products và categories
- **Touch Friendly**: Tối ưu cho touch interactions

## 🎯 API Integration

Tất cả API calls được tổ chức trong `src/api/modules/`:

- **products.ts**: CRUD operations cho sản phẩm
- **users.ts**: Authentication và user management

## 🚀 Performance

- **Image Optimization**: Next.js Image component với lazy loading
- **Code Splitting**: Automatic code splitting với Next.js
- **Bundle Optimization**: Tree shaking và minification
- **Caching**: API response caching với React hooks

## 📝 Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Animations**: CSS keyframes cho blob animation
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Support cho dark mode (có thể mở rộng)

## 🔄 State Management

- **React Hooks**: useState, useEffect cho local state
- **Custom Hooks**: Tái sử dụng logic state management
- **Context API**: Cho global state (auth, theme)
- **Server State**: React Query (có thể thêm sau)

## 📦 Dependencies

- **Next.js 15**: React framework với App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **clsx & tailwind-merge**: Class name utilities