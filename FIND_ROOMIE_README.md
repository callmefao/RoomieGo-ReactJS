# Find Roomie Feature - Tìm Bạn Ở Ghép

## 📋 Tổng quan

Tính năng "Find Roomie" (Tìm bạn ở ghép) cho phép người dùng tìm kiếm và kết nối với những người có nhu cầu thuê phòng chung để tiết kiệm chi phí và có thêm bạn cùng phòng.

## 🗂️ Cấu trúc File

### Types & Models
- **`types/roomie.ts`** - Type definitions cho Roomie và RoomieFilters
  - Interface `Roomie`: Thông tin người tìm bạn ở ghép
  - Interface `RoomieFilters`: Các tham số filter
  - Type unions: `Gender`, `OccupationType`, `LifestyleType`

### Mock Data
- **`lib/mock-data/find-roomie.ts`** - Mock data và helper functions
  - `FIND_ROOMIE_LIST`: 10 hồ sơ mẫu với thông tin đa dạng
  - `filterRoomies()`: Hàm lọc roomies theo filters
  - `sortRoomies()`: Hàm sắp xếp roomies

### Components
- **`components/RoomieCard.tsx`** - Card hiển thị hồ sơ trong danh sách
  - Hiển thị avatar, thông tin cơ bản
  - Badge cho giới tính, nghề nghiệp
  - Khu vực mong muốn, tiêu chí, ngân sách
  - Memoized để tối ưu performance

- **`components/RoomieFilterSidebar.tsx`** - Sidebar filter
  - Filter theo: Giới tính, Nghề nghiệp, Tuổi
  - Trường học (nếu là sinh viên)
  - Thời gian sinh hoạt, Khu vực, Giá, Loại phòng
  - Tích hợp MapLocationPicker

### Pages
- **`app/find-roomie/page.tsx`** - Trang danh sách
  - Layout 2 cột: Filter sidebar + Grid cards
  - Hiển thị filter highlights
  - Loading state với skeleton
  - Empty state khi không có kết quả

- **`app/find-roomie/[id]/page.tsx`** - Trang chi tiết
  - Thông tin chi tiết người tìm bạn ở ghép
  - Card liên hệ với CTA button
  - Section "Các hồ sơ tương tự"
  - Responsive layout

## 🎨 UI/UX Features

### Design System
- **Màu sắc**: Kế thừa từ theme hiện tại (OKLCH color system)
- **Components**: Sử dụng shadcn/ui components
- **Typography**: Vietnamese text, semantic sizing
- **Spacing**: Tailwind conventions với responsive classes

### Interactive Elements
- **Hover effects**: Scale, shadow transitions
- **Loading states**: Skeleton loaders và spinners
- **Filter highlights**: Visual feedback cho filters đang áp dụng
- **Badge colors**: Semantic colors cho gender, occupation

### Responsive Design
- Mobile-first approach
- Grid layout: 1 col mobile, 2 cols tablet, 4 cols desktop
- Sticky sidebar on desktop
- Touch-friendly buttons

## 🔧 Technical Implementation

### Filter System
```typescript
interface RoomieFilters {
  // Kế thừa từ rental-listings
  search?: string
  min_price?: number
  max_price?: number
  latitude?: number
  longitude?: number
  radius?: number
  
  // Bổ sung cho Find Roomie
  occupation?: OccupationType
  school?: string
  min_age?: number
  max_age?: number
  gender?: Gender
  lifestyle?: LifestyleType
  room_type?: string
  preferred_area?: string
}
```

### URL Query Parameters
Filters được encode trong URL params để:
- Share-able links
- Browser back/forward support
- Persistent filters on page reload

Example: `/find-roomie?gender=Nữ&min_age=20&max_age=25&occupation=Sinh%20viên`

### Data Flow
1. User selects filters → Update local state
2. Click "Áp dụng bộ lọc" → Navigate with query params
3. Page reads URL params → Apply filters to mock data
4. Render filtered & sorted results

## 📊 Mock Data Structure

```typescript
{
  id: number
  name: string
  age: number
  gender: "Nam" | "Nữ" | "Khác"
  occupation: "Đã đi làm" | "Sinh viên"
  school?: string // Chỉ có khi occupation = "Sinh viên"
  avatar: string
  description: string
  preferred_areas: string[]
  room_type: string
  budget_min: number
  budget_max: number
  preferences: string[]
  lifestyle: "Ban ngày" | "Ban đêm" | "Linh hoạt"
  additional_requirements?: string
  contact_phone?: string
  contact_hours?: string
  created_at: string
  view_count?: number
  is_featured?: boolean
}
```

## 🚀 Usage

### Navigation
Truy cập tính năng qua:
1. Header navigation: "Tìm bạn ở ghép" button
2. Direct URL: `/find-roomie`

### Filter Workflow
1. Mở trang `/find-roomie`
2. Chọn các filter tiêu chí mong muốn
3. Click "Áp dụng bộ lọc"
4. Xem danh sách kết quả
5. Click vào card để xem chi tiết

### Detail Page Workflow
1. Click vào card roomie
2. Xem thông tin chi tiết
3. Click "Liên hệ ngay" để contact
4. Browse "Các hồ sơ tương tự"

## 🎯 Key Features

### Filtering
- ✅ Giới tính (Nam/Nữ/Khác)
- ✅ Nghề nghiệp (Sinh viên/Đã đi làm)
- ✅ Trường học (dropdown universities)
- ✅ Độ tuổi (range slider)
- ✅ Thời gian sinh hoạt (Ban ngày/Ban đêm/Linh hoạt)
- ✅ Khu vực mong muốn (dropdown areas)
- ✅ Ngân sách (range slider)
- ✅ Loại phòng (dropdown)
- ✅ Vị trí trên bản đồ (with radius)

### Display
- ✅ Grid layout với responsive columns
- ✅ Featured roomies với special styling
- ✅ Avatar với border colors
- ✅ Badge cho các thuộc tính
- ✅ Truncated text với line-clamp
- ✅ Empty state messaging

### Detail Page
- ✅ Profile header với avatar lớn
- ✅ Mô tả bản thân
- ✅ Tiêu chí chi tiết (areas, room type, preferences, budget, lifestyle)
- ✅ Contact sidebar với phone & hours
- ✅ Quick info card
- ✅ Similar profiles section

## 🔄 Integration với Backend (Future)

Khi tích hợp API thực:

### Endpoints cần thiết
```
GET /api/roomies/ - List roomies với pagination & filters
GET /api/roomies/:id/ - Chi tiết roomie
POST /api/roomies/ - Tạo profile mới
PUT /api/roomies/:id/ - Cập nhật profile
DELETE /api/roomies/:id/ - Xóa profile
```

### Service Layer
Tạo file `lib/roomies-service.ts` tương tự `rooms-service.ts`:
```typescript
export const roomiesService = {
  fetchRoomies: async (filters: RoomieFilters) => { ... },
  fetchRoomieById: async (id: number) => { ... },
  createRoomie: async (data: CreateRoomiePayload) => { ... },
}
```

## 📝 Coding Standards

- ✅ TypeScript strict mode
- ✅ Component memoization
- ✅ Clean imports với `@/` alias
- ✅ Vietnamese UI text
- ✅ Semantic HTML
- ✅ Accessibility (ARIA labels)
- ✅ Error boundaries
- ✅ Loading states
- ✅ Empty states

## 🐛 Known Issues & Limitations

### Current Limitations
- Mock data only (10 profiles)
- No authentication check
- No favorite/bookmark feature
- No messaging system
- No profile creation UI
- Avatar là placeholder image

### Future Enhancements
- [ ] User authentication required
- [ ] Profile creation/edit form
- [ ] In-app messaging system
- [ ] Favorite/bookmark profiles
- [ ] Advanced search (keywords)
- [ ] Sort options (newest, popular, etc.)
- [ ] Pagination for large datasets
- [ ] Profile verification badge
- [ ] Report inappropriate profiles
- [ ] Notifications for matches

## 🎨 Customization

### Adding New Filter
1. Add field to `RoomieFilters` type
2. Add filter UI in `RoomieFilterSidebar.tsx`
3. Update `filterRoomies()` logic
4. Add URL param handling in page

### Styling Adjustments
- Colors: Edit `app/globals.css` CSS variables
- Components: Modify shadcn/ui components in `components/ui/`
- Layout: Adjust grid columns in page components

## 📚 References

- **Rental Listings**: Pattern reference cho layout & filtering
- **Room Details**: Pattern reference cho detail page
- **Universities Data**: `data/universities.ts` cho school dropdown
- **Theme**: `app/globals.css` cho OKLCH colors

## ✅ Testing Checklist

- [x] Trang danh sách load đúng
- [x] Filters hoạt động đúng
- [x] URL params sync với filters
- [x] Card hiển thị đầy đủ thông tin
- [x] Detail page load đúng
- [x] Similar profiles hiển thị
- [x] Responsive trên mobile/tablet/desktop
- [x] Navigation links trong Header
- [x] Back button hoạt động
- [x] Empty state hiển thị
- [x] Loading state hiển thị

---

**Created**: 2025-11-01  
**Version**: 1.0.0  
**Author**: Tro4S Development Team
