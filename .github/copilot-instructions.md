# AI Assistant Instructions for Pottery E-commerce Platform

## Project Architecture

This is a Vietnamese pottery e-commerce platform with:
- **Backend**: NestJS with TypeORM + PostgreSQL (`backend/pottery/`)
- **Frontend**: Next.js 15 with TypeScript + Tailwind CSS (`frontend/potery_frontend/`)

## Key Architecture Patterns

### Backend (NestJS Library Structure)
- **Modular Libraries**: Each domain has its own library in `libs/` (product, user, order, flashsale, etc.)
- **Library Structure**: Each lib has `src/` containing `*.module.ts`, `*.service.ts`, `*.interface.ts`, and `index.ts`
- **Controllers**: Located in `src/` root, import services from `@app/[domain]` path mapping
- **Repositories**: Custom TypeORM repositories in `libs/database/src/repositories/`
- **Entities**: All entities centralized in `libs/database/src/entities/`

### Frontend (Next.js App Router)
- **Module Organization**: API calls in `src/api/modules/` by domain (products.ts, users.ts)
- **Type Safety**: All types defined in `src/types/` with barrel exports
- **Component Structure**: `components/common/` for shared UI, `components/feature/` for business logic
- **Layouts**: Route group patterns `(auth)/`, `(store)/`, `admin/` for layout isolation

### Database & Migration Patterns
- **TypeORM Config**: Centralized in `typeOrm.config.ts` with environment-based settings
- **Migrations**: Located in `libs/database/src/migrations/` 
- **Development**: `synchronize: true` in dev, migrations in production
- **Scripts**: `migrate:create`, `migrate:generate`, `migrate:run` for database changes

## Development Workflows

### Backend Development
```bash
# In backend/pottery/
npm run start:dev        # Development with watch mode
npm run migrate:create   # Create new migration
npm run migrate:run      # Run pending migrations
npm run lint            # ESLint with auto-fix
```

### Frontend Development
```bash
# In frontend/potery_frontend/
npm run dev             # Next.js dev server with Turbopack
npm run build           # Production build with Turbopack
npm run lint            # ESLint validation
```

## Critical Integration Patterns

### API Communication
- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL` (defaults to `localhost:3001`)
- **Image Handling**: Backend stores images as base64 Buffer, frontend converts to `data:image/jpeg;base64,${buffer}`
- **File Upload**: Uses `FilesInterceptor` with `Express.Multer.File[]` for multi-image products
- **Error Handling**: Frontend APIs throw errors for non-200 responses, services catch and re-throw

### Data Transformation Patterns
- **Product Mapping**: Complex transformation in `src/api/modules/products.ts` from backend format to frontend `Product` interface
- **Image Processing**: Priority-based sorting, base64 conversion, fallback handling
- **Date Handling**: String to Date conversion for timestamps and flash sale times

### Authentication & Authorization
- **Route Groups**: `(auth)/` for authenticated routes, `admin/` for admin panel
- **Guards**: Implied but not implemented - expect JWT/session-based auth

## Project-Specific Conventions

### Naming Patterns
- **Backend**: snake_case for database fields, camelCase for TypeScript interfaces
- **Frontend**: camelCase for React props/state, kebab-case for file names
- **Path Mapping**: `@app/[domain]` for backend libs, relative paths for frontend

### File Organization
- **Controllers**: One per domain in `src/[domain]/[domain].controller.ts`
- **DTOs**: Co-located with controllers in `*.dto.ts` files using class-validator
- **Services**: Domain services in libs, imported via path mapping
- **Types**: Frontend types mirror backend entities but with additional UI-specific fields

### Error Handling
- **Validation**: class-validator decorators on DTOs for request validation
- **Logging**: Extensive console.log statements in services for debugging
- **Responses**: Plain objects returned from services, transformed by controllers

## Current State Notes
- No existing `.github/copilot-instructions.md` found
- Backend README is generic NestJS template - actual patterns extracted from code analysis
- Frontend README is comprehensive with detailed architecture documentation
- Migration scripts properly configured for TypeORM CLI integration
- Both projects use modern tooling (Turbopack, TypeScript 5, ESLint 9)