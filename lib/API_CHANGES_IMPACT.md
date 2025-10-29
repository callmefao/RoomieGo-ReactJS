# API Changes Impact Analysis - Amenity Refactoring

## 📊 Overview
Việc chuyển từ `JSONField` sang `ManyToMany` với `RoomAmenity` sẽ ảnh hưởng đến **TẤT CẢ các API endpoint liên quan đến Room**.

---

## 🔄 BREAKING CHANGES (Frontend cần update)

### 1. **Room Detail API** - `GET /api/rooms/{id}/`

#### **BEFORE (JSONField):**
```json
{
  "id": 1,
  "title": "Phòng trọ cao cấp",
  "price": 3000000,
  "amenities": ["Wifi", "Điều hòa", "Nóng lạnh"],  // ← Array of strings
  ...
}
```

#### **AFTER (ManyToMany):**
```json
{
  "id": 1,
  "title": "Phòng trọ cao cấp",
  "price": 3000000,
  "amenities_detail": [                              // ← Đổi tên field
    {"name": "Wifi", "icon_url": "https://..."},
    {"name": "Điều hòa", "icon_url": "https://..."},
    {"name": "Nóng lạnh", "icon_url": "https://..."}
  ],
  ...
}
```

**Impact:** 🔴 **BREAKING CHANGE**
- ❌ Field `amenities` (array of strings) → BỎ
- ✅ Field `amenities_detail` (array of objects) → THÊM MỚI
- Frontend cần đổi từ `room.amenities` → `room.amenities_detail`

---

### 2. **Room List API** - `GET /api/rooms/`

#### **BEFORE:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Phòng trọ...",
      "price": 3000000,
      "amenities": ["Wifi", "Điều hòa"],  // ← Strings
      ...
    }
  ]
}
```

#### **AFTER:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Phòng trọ...",
      "price": 3000000,
      "amenities_detail": [                // ← Objects với icon
        {"name": "Wifi", "icon_url": "https://..."},
        {"name": "Điều hòa", "icon_url": "https://..."}
      ],
      ...
    }
  ]
}
```

**Impact:** 🔴 **BREAKING CHANGE**
- Frontend room list cards cần update UI
- Có thể render icons thay vì chỉ text

---

### 3. **Create Room API** - `POST /api/rooms/`

#### **BEFORE:**
```json
POST /api/rooms/
{
  "title": "Phòng trọ...",
  "price": 3000000,
  "amenities": ["Wifi", "Điều hòa", "Giường"],  // ← Array of strings
  ...
}
```

#### **AFTER (Option 1 - Recommended):**
```json
POST /api/rooms/
{
  "title": "Phòng trọ...",
  "price": 3000000,
  "amenities": ["Wifi", "Điều hòa", "Giường"],  // ← Vẫn dùng names
  ...
}
```

**Impact:** ✅ **BACKWARD COMPATIBLE** (nếu dùng `SlugRelatedField`)
- Frontend **KHÔNG CẦN** thay đổi code
- Backend tự lookup RoomAmenity by name

#### **AFTER (Option 2 - Alternative):**
```json
POST /api/rooms/
{
  "title": "Phòng trọ...",
  "price": 3000000,
  "amenity_ids": [1, 2, 5],  // ← Array of IDs
  ...
}
```

**Impact:** 🔴 **BREAKING CHANGE**
- Frontend cần map names → IDs trước khi submit
- Phức tạp hơn, **KHÔNG KHUYẾN KHÍCH**

---

### 4. **Update Room API** - `PUT/PATCH /api/rooms/{id}/`

#### **BEFORE:**
```json
PATCH /api/rooms/1/
{
  "amenities": ["Wifi", "Tủ lạnh", "Máy giặt"]  // ← Replace toàn bộ
}
```

#### **AFTER:**
```json
PATCH /api/rooms/1/
{
  "amenities": ["Wifi", "Tủ lạnh", "Máy giặt"]  // ← Giữ nguyên format
}
```

**Impact:** ✅ **BACKWARD COMPATIBLE**
- Frontend không cần thay đổi
- Backend xử lý: clear old → add new amenities

---

### 5. **My Rooms API** - `GET /api/rooms/my_rooms/`

#### **BEFORE:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Phòng của tôi",
      "amenities": ["Wifi"],
      ...
    }
  ]
}
```

#### **AFTER:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Phòng của tôi",
      "amenities_detail": [
        {"name": "Wifi", "icon_url": "https://..."}
      ],
      ...
    }
  ]
}
```

**Impact:** 🔴 **BREAKING CHANGE**
- Owner dashboard cần update để hiển thị amenities với icons

---

### 6. **Admin Pending Rooms** - `GET /api/rooms/admin/pending/`

#### **BEFORE:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Phòng chờ duyệt",
      "amenities": ["Wifi", "Điều hòa"],
      "owner_email": "owner@example.com",
      ...
    }
  ]
}
```

#### **AFTER:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Phòng chờ duyệt",
      "amenities_detail": [
        {"name": "Wifi", "icon_url": "https://..."},
        {"name": "Điều hòa", "icon_url": "https://..."}
      ],
      "owner_email": "owner@example.com",
      ...
    }
  ]
}
```

**Impact:** 🔴 **BREAKING CHANGE**
- Admin dashboard cần update UI

---

## 🔍 FILTER CHANGES

### 7. **Filter by Amenities** - `GET /api/rooms/?amenities=...`

#### **BEFORE (JSONField - Limited):**
```bash
# Không có filter amenities (hoặc dùng JSON query - chậm)
GET /api/rooms/?search=Wifi  # ← Phải dùng search text
```

#### **AFTER (ManyToMany - Powerful):**
```bash
# Option 1: Filter by amenity names (OR logic)
GET /api/rooms/?amenities=Wifi,Điều hòa
# → Phòng có Wifi HOẶC Điều hòa

# Option 2: Filter by multiple amenities (AND logic)
GET /api/rooms/?has_all_amenities=Wifi,Điều hòa,Giường
# → Phòng có ĐẦY ĐỦ: Wifi VÀ Điều hòa VÀ Giường
```

**Impact:** ✅ **NEW FEATURE**
- Frontend có thể làm advanced filter UI
- Better UX cho user tìm phòng

---

## 🆕 NEW ENDPOINTS

### 8. **List All Amenities** - `GET /api/rooms/amenities/`

```bash
# Public endpoint - Không cần auth
GET /api/rooms/amenities/
```

**Response:**
```json
[
  {"name": "Wifi", "icon_url": "https://..."},
  {"name": "Điều hòa", "icon_url": "https://..."},
  ...
]
```

**Use Cases:**
1. Owner tạo phòng → Load amenities để render checkboxes
2. User search phòng → Load amenities cho filter UI
3. Hiển thị legend/tooltip

---

### 9. **Manage Amenities (Staff Only)**

```bash
# Create
POST /api/rooms/amenities/
Body: FormData {name, icon_file, display_order}

# Update
PATCH /api/rooms/amenities/{id}/
Body: FormData {name?, icon_file?, display_order?}

# Delete
DELETE /api/rooms/amenities/{id}/
```

**Use Cases:**
- Admin dashboard để CRUD amenities
- Upload/update icons

---

## 📝 SERIALIZER CHANGES

### Current Code (cần update):

```python
# rooms/serializers.py
class RoomSerializer(serializers.ModelSerializer):
    # BEFORE:
    amenities = serializers.JSONField(default=list)  # ❌ BỎ
    
    # AFTER:
    amenities = serializers.SlugRelatedField(  # For INPUT
        many=True,
        slug_field='name',
        queryset=RoomAmenity.objects.all(),
        required=False,
        write_only=True  # Chỉ dùng cho input
    )
    
    amenities_detail = RoomAmenityPublicSerializer(  # For OUTPUT
        source='amenities',
        many=True,
        read_only=True
    )
    
    class Meta:
        model = Room
        fields = [
            'id', 'title', 'price', ...,
            'amenities',         # Write-only: ["Wifi", "Điều hòa"]
            'amenities_detail',  # Read-only: [{name, icon_url}, ...]
        ]
```

---

## 🔄 MIGRATION STRATEGY (Zero Downtime)

### Phase 1: Dual Write (Support cả 2 formats)
```python
# Backend supports BOTH:
# - amenities (JSONField) - old
# - amenities_new (ManyToMany) - new

# Response includes BOTH:
{
  "amenities": ["Wifi"],              # Old format (deprecated)
  "amenities_detail": [{...}]         # New format
}
```

### Phase 2: Frontend Migration
```javascript
// Step 1: Update frontend to use amenities_detail
// Old code:
room.amenities.map(name => <span>{name}</span>)

// New code:
room.amenities_detail.map(amenity => 
  <img src={amenity.icon_url} alt={amenity.name} />
)
```

### Phase 3: Remove Old Field
```python
# After frontend fully migrated (1-2 weeks)
# Run migration to remove JSONField
```

---

## 📋 FRONTEND CHECKLIST

### Pages/Components cần update:

#### **1. Room Detail Page** 🔴 CRITICAL
```javascript
// Before:
<div>Tiện ích: {room.amenities.join(', ')}</div>

// After:
<div>
  Tiện ích:
  {room.amenities_detail.map(a => (
    <Chip 
      icon={<img src={a.icon_url} />}
      label={a.name}
    />
  ))}
</div>
```

#### **2. Room List/Cards** 🔴 CRITICAL
```javascript
// Before:
<p>Tiện ích: {room.amenities.slice(0, 3).join(', ')}</p>

// After:
<div className="amenities-preview">
  {room.amenities_detail.slice(0, 5).map(a => (
    <Tooltip title={a.name}>
      <img src={a.icon_url} className="amenity-icon" />
    </Tooltip>
  ))}
</div>
```

#### **3. Create/Edit Room Form** 🟡 MODERATE
```javascript
// Before:
const [selectedAmenities, setSelectedAmenities] = useState([]);
// Submit: {amenities: ["Wifi", "Điều hòa"]}

// After: KHÔNG CẦN THAY ĐỔI (backward compatible)
// Hoặc nếu muốn hiển thị icon:
useEffect(() => {
  fetch('/api/rooms/amenities/')
    .then(res => res.json())
    .then(data => setAvailableAmenities(data));
}, []);

// Render checkboxes với icon
{availableAmenities.map(amenity => (
  <Checkbox
    label={
      <>
        <img src={amenity.icon_url} />
        {amenity.name}
      </>
    }
  />
))}
```

#### **4. Search/Filter Page** 🟢 ENHANCEMENT (NEW)
```javascript
// NEW FEATURE: Advanced amenity filter
const [selectedFilters, setSelectedFilters] = useState([]);

<FilterSection>
  <h3>Tiện ích</h3>
  {amenities.map(a => (
    <Checkbox
      icon={<img src={a.icon_url} />}
      label={a.name}
      onChange={(checked) => {
        if (checked) {
          setSelectedFilters([...selectedFilters, a.name]);
        }
      }}
    />
  ))}
</FilterSection>

// API call:
GET /api/rooms/?amenities=${selectedFilters.join(',')}
```

#### **5. Owner Dashboard (My Rooms)** 🔴 CRITICAL
```javascript
// Tương tự Room List
```

#### **6. Admin Dashboard (Pending Rooms)** 🔴 CRITICAL
```javascript
// Tương tự Room List + Admin actions
```

#### **7. Admin Amenity Management** 🆕 NEW PAGE
```javascript
// NEW: Admin page to CRUD amenities
<AmenityManager>
  <Table>
    <Column header="Icon">
      <img src={amenity.icon_url} />
    </Column>
    <Column header="Name">{amenity.name}</Column>
    <Column header="Display Order">{amenity.display_order}</Column>
    <Column header="Actions">
      <Button onClick={() => editAmenity(amenity.id)}>Edit</Button>
      <Button onClick={() => deleteAmenity(amenity.id)}>Delete</Button>
    </Column>
  </Table>
  
  <UploadForm>
    <Input name="name" />
    <FileInput name="icon_file" accept=".ico" />
    <Input name="display_order" type="number" />
    <Button type="submit">Create</Button>
  </UploadForm>
</AmenityManager>
```

---

## 🧪 TESTING MATRIX

### Backend API Tests

| Endpoint | Test Case | Expected Result |
|----------|-----------|-----------------|
| `GET /rooms/` | List rooms | `amenities_detail` field exists |
| `GET /rooms/{id}/` | Room detail | `amenities_detail` with icons |
| `POST /rooms/` | Create with amenities | Accept `["Wifi", "Điều hòa"]` |
| `PATCH /rooms/{id}/` | Update amenities | Old removed, new added |
| `GET /rooms/?amenities=Wifi` | Filter by amenity | Returns matching rooms |
| `GET /amenities/` | List amenities (public) | Returns all with icons |
| `POST /amenities/` | Create amenity (staff) | Upload icon to GCS |
| `DELETE /amenities/{id}/` | Delete (staff) | Fail if rooms using it |

### Frontend UI Tests

| Page | Test Case | Expected Result |
|------|-----------|-----------------|
| Room Detail | Display amenities | Icons + names displayed |
| Room List | Display amenity preview | First 5 icons shown |
| Create Room | Select amenities | Checkboxes with icons |
| Search | Filter by amenities | Filter UI works |
| Owner Dashboard | My rooms list | Amenities displayed correctly |
| Admin Dashboard | Manage amenities | CRUD operations work |

---

## ⚠️ MIGRATION RISKS & MITIGATION

### Risk 1: Data Loss During Migration
**Mitigation:**
- Migration có 3 bước: Add new field → Migrate data → Remove old field
- Giữ JSONField trong 1-2 weeks để rollback nếu cần
- Backup database trước khi migrate

### Risk 2: Frontend Break Immediately
**Mitigation:**
- Deploy backend trước, support CẢ 2 formats
- Frontend migrate từng trang một
- Monitor error logs

### Risk 3: Amenity Name Typos
**Problem:** Old data có thể có `"wifi"`, `"Wifi"`, `"WiFi"` → 3 records khác nhau
**Mitigation:**
```python
# Migration script chuẩn hóa data:
amenity_map = {
    'wifi': 'Wifi',
    'dieu hoa': 'Điều hòa',
    'nong lanh': 'Nóng lạnh',
    # ...
}

for room in Room.objects.all():
    for old_name in room.amenities:  # JSONField
        canonical_name = amenity_map.get(old_name.lower(), old_name)
        amenity, _ = RoomAmenity.objects.get_or_create(name=canonical_name)
        room.amenities_new.add(amenity)
```

---

## 📊 DEPLOYMENT TIMELINE

### Week 1: Backend Changes
- [ ] Update models
- [ ] Create migrations (3 steps)
- [ ] Update serializers (support both formats)
- [ ] Extend GCS service
- [ ] Update ViewSet
- [ ] Write tests
- [ ] Deploy to staging

### Week 2: Frontend Migration (Phase 1)
- [ ] Update Room Detail page
- [ ] Update Room List page
- [ ] Test on staging

### Week 3: Frontend Migration (Phase 2)
- [ ] Update Create/Edit Room forms
- [ ] Update Search/Filter
- [ ] Update Owner Dashboard
- [ ] Update Admin Dashboard
- [ ] Build Admin Amenity Manager
- [ ] Deploy to production

### Week 4: Cleanup
- [ ] Monitor errors
- [ ] Remove old `amenities` JSONField
- [ ] Remove backward compatibility code

---

## 🎯 PRIORITY MATRIX

| Task | Priority | Impact | Effort |
|------|----------|--------|--------|
| Update Room Detail API | 🔴 P0 | HIGH | LOW |
| Update Room List API | 🔴 P0 | HIGH | LOW |
| Update Create Room API | 🔴 P0 | HIGH | MEDIUM |
| Add Amenity List API | 🟡 P1 | MEDIUM | LOW |
| Add Amenity Filter | 🟡 P1 | MEDIUM | MEDIUM |
| Admin Amenity CRUD | 🟢 P2 | LOW | MEDIUM |
| Frontend Migration | 🔴 P0 | HIGH | HIGH |
| Icon Upload Feature | 🟢 P2 | LOW | MEDIUM |

---

## 📞 COMMUNICATION PLAN

### For Frontend Team:
```markdown
## Breaking Changes - Amenity Refactoring

**Timeline:** Deploy Nov 1, 2025

**What's changing:**
- Field `amenities` (array of strings) → `amenities_detail` (array of objects)
- New format includes `icon_url` for each amenity
- Input format remains backward compatible

**Action Required:**
1. Update all pages using `room.amenities` to `room.amenities_detail`
2. Use new amenity icons in UI
3. Test on staging by Oct 25

**Migration Guide:** [Link to detailed guide]
**Questions?** Ask in #backend-api channel
```

---

## ✅ ROLLBACK PLAN

If things go wrong:

```bash
# Step 1: Revert migrations
python manage.py migrate rooms 0003  # Before amenity changes

# Step 2: Deploy old backend code
git revert <commit_hash>
git push

# Step 3: Frontend rollback (if deployed)
# Revert to previous deployment

# Step 4: Restore database from backup (last resort)
pg_restore -d tro4s_db backup_before_migration.sql
```

---

## 📈 SUCCESS METRICS

After full migration:
- [ ] Zero `amenities` field references in code
- [ ] All room APIs return `amenities_detail`
- [ ] Filter by amenities works on production
- [ ] No increase in error rate (< 0.1%)
- [ ] Page load time unchanged (± 50ms)
- [ ] Admin can manage amenities via UI
- [ ] Icons display correctly on all pages

---

**Total Estimated Impact:** 🔴 **MAJOR**
- **API Changes:** 6 endpoints affected
- **Frontend Pages:** 7 pages need updates
- **New Features:** 2 (filter + admin)
- **Total Effort:** ~40-60 hours (Backend: 20h, Frontend: 30h, Testing: 10h)
