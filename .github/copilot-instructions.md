# Tro4S - Room Rental Platform

## Architecture Overview

This is a **Vietnamese room rental platform** built with Next.js 14, TypeScript, and Tailwind CSS. The app uses a component-based architecture with shadcn/ui components and follows Vietnamese naming conventions for UI text.

**Key Technologies:**
- Next.js 14 with App Router (`app/` directory)
- TypeScript with strict configuration
- Tailwind CSS v4 with custom OKLCH color system
- Radix UI primitives via shadcn/ui
- Leaflet for map functionality
- Vietnamese locale support (vi-VN)

## Component Patterns

### UI Component Architecture
- **Base UI Components**: Located in `components/ui/` - these are shadcn/ui components with custom styling
- **Feature Components**: Root-level components like `Header.tsx`, `RoomCard.tsx`, `SearchSection.tsx`
- **Client Components**: Use `"use client"` directive for interactive components with hooks/state

### Component Style Conventions
```tsx
// Always use TypeScript interfaces for props
interface RoomCardProps {
  room: Room
}

// Use default exports for main components
export default function RoomCard({ room }: RoomCardProps) {
  // Component logic
}

// Use semantic class organization
<div className="container mx-auto px-4 py-8">
```

### Styling System
- **Colors**: Use semantic color variables (`text-foreground`, `bg-background`, `border-border`)
- **Spacing**: Follow Tailwind conventions with responsive classes
- **CSS Variables**: Defined in `app/globals.css` using OKLCH color space
- **cn() Utility**: Always use `cn()` from `@/lib/utils` for className merging

## Data Flow Patterns

### Type Definitions
- All types defined in `types/` directory (e.g., `types/room.ts`)
- Use simple interfaces for data models:
```typescript
export interface Room {
  id: number
  title: string
  price: number
  location: string
  area: number
  image: string
  amenities: string[]
}
```

### Mock Data Pattern
Components use mock data arrays with `useEffect` simulation:
```tsx
// Simulate API loading with setTimeout
useEffect(() => {
  const fetchRooms = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRooms(mockRooms)
  }
  fetchRooms()
}, [])
```

## Vietnamese Localization

### Text Conventions
- **All UI text in Vietnamese**: "Tìm kiếm", "Đề xuất", "Xem thêm"
- **Currency formatting**: Use `Intl.NumberFormat("vi-VN", { currency: "VND" })`
- **Location naming**: Vietnamese districts/areas (Quận 1, TP.HCM)
- **Form placeholders**: Vietnamese instructions

### Vietnamese-specific Features
- **Filter options**: Local area names (Ninh Kiều, Bình Thuỷ, etc.)
- **Price ranges**: VND formatting with millions ("2-3 triệu")
- **Target demographics**: Vietnamese rental market terms

## File Organization

### Import Patterns
```tsx
// UI components from relative path
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Feature components
import Header from "@/components/Header"

// Types
import type { Room } from "@/types/room"

// Next.js imports
import Image from "next/image"
```

### Path Aliases
- `@/*` maps to project root
- Always use absolute imports with `@/` prefix
- UI components: `@/components/ui/`
- Utils: `@/lib/utils`

## Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server  
pnpm start

# Linting
pnpm lint
```

## Key Patterns to Follow

1. **Vietnamese-first UI**: All user-facing text should be in Vietnamese
2. **Responsive Design**: Use Tailwind responsive prefixes (`md:`, `lg:`)
3. **Loading States**: Implement skeleton loading with `animate-pulse`
4. **Error Boundaries**: Use try-catch with fallbacks to mock data
5. **Accessibility**: Include proper ARIA labels and semantic HTML
6. **Performance**: Use Next.js Image component with `unoptimized: true`

## Common Component Structures

**Filter Components**: Use DropdownMenu with state management for selections
**Card Components**: Follow Card/CardContent pattern with hover effects
**Form Components**: Use shadcn/ui form components with Vietnamese labels
**Layout Components**: Container pattern with `container mx-auto px-4`

When adding new features, maintain consistency with Vietnamese naming, use existing UI component patterns, and follow the established mock data simulation approach.