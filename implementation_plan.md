# CampusPulse — Full-Stack College Community Engagement Platform

A production-ready, highly interactive full-stack web application for college community issue resolution, featuring a Spring Boot 3.x backend with JWT-based RBAC and a Next.js 14+ frontend with rich animations.

## Project Structure

```
c:\campusconnectcep\
├── backend/                          # Spring Boot 3.x (Java 17)
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd              # Maven Wrapper (no global Maven needed)
│   └── src/main/java/com/campuspulse/
│       ├── CampusPulseApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── JwtAuthenticationFilter.java
│       │   ├── JwtTokenProvider.java
│       │   └── CorsConfig.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Category.java
│       │   ├── Complaint.java
│       │   ├── Upvote.java
│       │   ├── LostFoundItem.java
│       │   ├── Claim.java
│       │   └── enums/ (Role, ComplaintStatus, ItemStatus, ClaimStatus)
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── CategoryRepository.java
│       │   ├── ComplaintRepository.java
│       │   ├── UpvoteRepository.java
│       │   ├── LostFoundItemRepository.java
│       │   └── ClaimRepository.java
│       ├── dto/
│       │   ├── auth/ (LoginRequest, RegisterRequest, AuthResponse)
│       │   ├── complaint/ (ComplaintRequest, ComplaintResponse, DuplicateCheckRequest)
│       │   ├── lostfound/ (LostFoundRequest, ClaimRequest, ClaimResponse)
│       │   └── report/ (ReportFilter)
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── ComplaintService.java
│       │   ├── UpvoteService.java
│       │   ├── LostFoundService.java
│       │   ├── ClaimService.java
│       │   ├── ExcelReportService.java
│       │   └── CategoryService.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── ComplaintController.java
│       │   ├── LostFoundController.java
│       │   ├── AdminController.java
│       │   └── ReportController.java
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   └── custom exceptions
│       └── seeder/
│           └── DatabaseSeeder.java
│
├── frontend/                         # Next.js 14+ (App Router, TypeScript)
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout with providers
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── dashboard/page.tsx    # Student dashboard
│   │   │   ├── complaints/
│   │   │   │   └── new/page.tsx      # File complaint
│   │   │   ├── lost-found/page.tsx   # Lost & Found portal
│   │   │   └── admin/page.tsx        # Admin analytics hub
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn-style primitives
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── complaints/
│   │   │   │   ├── CascadingCategorySelector.tsx
│   │   │   │   ├── UpvoteButton.tsx
│   │   │   │   ├── ComplaintCard.tsx
│   │   │   │   ├── ComplaintStatusTracker.tsx
│   │   │   │   ├── DuplicateBanner.tsx
│   │   │   │   └── ComplaintPriorityQueue.tsx
│   │   │   ├── lostfound/
│   │   │   │   ├── LostFoundGallery.tsx
│   │   │   │   ├── ItemCard.tsx
│   │   │   │   ├── ClaimWizardModal.tsx
│   │   │   │   └── QRCodeDisplay.tsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCards.tsx
│   │   │       └── AnalyticsCharts.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios instance with JWT interceptor
│   │   │   ├── auth.ts               # Auth context & hooks
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useComplaints.ts
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   └── public/
```

---

## User Review Required

> [!IMPORTANT]
> **Database Choice**: The plan uses **H2 in-memory database** for immediate local development (zero setup). PostgreSQL can be swapped in by changing `application.properties`. Are you okay starting with H2, or do you have a PostgreSQL instance ready?

> [!IMPORTANT]
> **File Uploads**: For Lost & Found images, should I implement:
> - **Option A**: Local multipart file upload (files stored on disk — simpler, no API keys needed)
> - **Option B**: Cloudinary integration (requires API key/secret)
> I'll default to **Option A** (local upload) and structure the code so Cloudinary can be plugged in later.

> [!WARNING]
> **Maven not installed globally** on your system. I'll include the **Maven Wrapper** (`mvnw.cmd`) so you can build and run the backend without installing Maven separately. It will auto-download Maven on first run.

---

## Open Questions

> [!NOTE]
> **Email/Notification System**: Do you want email notifications when complaint status changes, or are in-app toast notifications sufficient for the MVP?

> [!NOTE]
> **QR Code Scanning**: The plan generates QR codes on the frontend. For admin scanning, should the admin dashboard have a built-in QR scanner using the webcam, or is manual code entry sufficient?

---

## Proposed Changes

### Phase 1: Spring Boot Backend (Foundation)

#### [NEW] [pom.xml](file:///c:/campusconnectcep/backend/pom.xml)
- Spring Boot 3.3.x parent POM
- Dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`
- Database: `h2` (dev profile), `postgresql` (prod profile)
- JWT: `io.jsonwebtoken:jjwt-api/impl/jackson` v0.12.x
- Excel: `org.apache.poi:poi-ooxml` v5.2.x
- Maven Wrapper included

#### [NEW] [application.properties](file:///c:/campusconnectcep/backend/src/main/resources/application.properties)
- H2 in-memory config with web console enabled at `/h2-console`
- JWT secret key, token expiry (24h)
- File upload max size config
- CORS allowed origins for Next.js dev server

---

### Phase 2: JPA Entities & Enums

#### [NEW] Enum Types
- `Role`: `STUDENT`, `ADMIN_WIFI`, `ADMIN_MAINTENANCE`, `ADMIN_MESS`, `ADMIN_ACADEMIC`, `SUPER_ADMIN`
- `ComplaintStatus`: `PENDING`, `APPROVED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`
- `ItemStatus`: `LISTED`, `CLAIM_PENDING`, `RETURNED`
- `ClaimStatus`: `PENDING`, `APPROVED`, `REJECTED`

#### [NEW] [User.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/model/User.java)
- UUID primary key, `@Column(unique=true)` on email and rollNo
- BCrypt password hashing
- Role enum field

#### [NEW] [Category.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/model/Category.java)
- Self-referencing `@ManyToOne` for parent-child hierarchy
- `@OneToMany(mappedBy="parent")` for children
- `adminRole` field mapping category to responsible admin

#### [NEW] [Complaint.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/model/Complaint.java)
- UUID PK, ManyToOne to Category and User
- `locationPath` (String, e.g., "Block A > Floor 2 > Room 201")
- `issueTag` for deduplication matching
- `upvoteCount` (Integer, default 0), `priorityScore` (Double)
- `adminNote` for admin responses
- `@CreatedDate`, `@LastModifiedDate` audit fields

#### [NEW] [Upvote.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/model/Upvote.java)
- UUID PK, ManyToOne to Complaint and User
- `@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"complaint_id", "student_id"}))`

#### [NEW] [LostFoundItem.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/model/LostFoundItem.java)
- UUID PK, title, category, foundLocation, foundDate
- `imageUrl` (stored path/URL), `hiddenDetails` (admin-only redacted info)
- `claimCode` (unique 6-char alphanumeric), status enum
- ManyToOne to User (finder)

#### [NEW] [Claim.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/model/Claim.java)
- UUID PK, ManyToOne to LostFoundItem and User (claimant)
- `proofDescription` text field, status enum

---

### Phase 3: Repositories & Services

#### [NEW] Repository Interfaces
- `UserRepository`: findByEmail, findByRollNo, existsByEmail
- `CategoryRepository`: findByParentIsNull (root categories), findByParentId (children)
- `ComplaintRepository`: findByStudentId, findByCategoryAdminRole, custom deduplication query with `@Query`
- `UpvoteRepository`: existsByComplaintIdAndStudentId, countByComplaintId
- `LostFoundItemRepository`: findByStatus, findByClaimCode
- `ClaimRepository`: findByItemId, findByClaimantId

#### [NEW] Service Classes
- **AuthService**: Register (BCrypt hash), Login (JWT generation), token validation
- **ComplaintService**: Create, dedup check, status update, priority recalculation
- **UpvoteService**: Single-upvote enforcement, count update, priority score formula: `upvotes × 1.5 + baseUrgency`
- **LostFoundService**: CRUD, image upload handling, status management
- **ClaimService**: Submit claim, approve/reject, generate 6-digit alphanumeric code
- **ExcelReportService**: Apache POI workbook generation with styled headers, colored status cells, auto-sized columns
- **CategoryService**: Hierarchical category tree retrieval

---

### Phase 4: Security & JWT

#### [NEW] [SecurityConfig.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/config/SecurityConfig.java)
- Stateless session management
- Public endpoints: `/api/auth/**`, `/h2-console/**`
- Role-based endpoint restrictions:
  - `/api/admin/**` → `ADMIN_*` and `SUPER_ADMIN` roles
  - `/api/complaints/**` → Authenticated users
- CORS configuration for Next.js (localhost:3000)

#### [NEW] [JwtTokenProvider.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/config/JwtTokenProvider.java)
- HMAC-SHA256 signing with configurable secret
- 24-hour token expiry
- Claims: userId, email, role

#### [NEW] [JwtAuthenticationFilter.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/config/JwtAuthenticationFilter.java)
- `OncePerRequestFilter` extracting Bearer token from Authorization header
- Sets `SecurityContextHolder` authentication on valid token

---

### Phase 5: REST Controllers

#### [NEW] [AuthController.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/controller/AuthController.java)
- `POST /api/auth/register` — Register with name, email, rollNo, password, role
- `POST /api/auth/login` — Returns JWT + user info
- `GET /api/auth/me` — Get current user profile

#### [NEW] [ComplaintController.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/controller/ComplaintController.java)
- `POST /api/complaints` — Create complaint
- `GET /api/complaints` — List (filterable by status, category)
- `GET /api/complaints/my` — Student's own complaints
- `POST /api/complaints/check-duplicate` — Dedup check
- `POST /api/complaints/{id}/upvote` — Upvote
- `PATCH /api/complaints/{id}/status` — Admin status update

#### [NEW] [LostFoundController.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/controller/LostFoundController.java)
- `POST /api/lost-found` — Report found item (with image upload)
- `GET /api/lost-found` — List items (filterable by status)
- `POST /api/lost-found/{id}/claim` — Submit claim
- `POST /api/admin/lost-found/{claimId}/approve` — Approve claim (generates code)
- `POST /api/admin/lost-found/{claimId}/reject` — Reject claim
- `POST /api/lost-found/verify/{claimCode}` — Verify code at handover

#### [NEW] [ReportController.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/controller/ReportController.java)
- `GET /api/admin/reports/export-lost-found` — Download `.xlsx` Excel report
- `GET /api/admin/reports/export-complaints` — Download complaints report
- `GET /api/admin/reports/stats` — JSON analytics stats (counts, trends)

#### [NEW] [DatabaseSeeder.java](file:///c:/campusconnectcep/backend/src/main/java/com/campuspulse/seeder/DatabaseSeeder.java)
- Runs on startup via `CommandLineRunner`
- Seeds category hierarchy:
  ```
  WiFi Issues → [Hostel WiFi → [Block A, Block B, ...], Academic WiFi → [...]]
  Maintenance → [Electrical → [...], Plumbing → [...], Furniture → [...]]
  Mess/Food → [Hygiene, Quality, Menu, Timing]
  Academic → [Classroom → [...], Lab → [...], Library]
  ```
- Seeds demo users: 1 student, 1 per admin domain, 1 super admin
- Seeds sample complaints and lost items

---

### Phase 6: Next.js Frontend (Foundation)

#### [NEW] Next.js 14 Project
- Scaffolded with `npx create-next-app@latest` (App Router, TypeScript, Tailwind CSS)
- Additional dependencies:
  - `framer-motion` (animations)
  - `lucide-react` (icons)
  - `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs` (primitives)
  - `sonner` (toast notifications)
  - `canvas-confetti` (celebration effects)
  - `recharts` (analytics charts)
  - `axios` (API client)
  - `qrcode.react` (QR code generation)
  - `class-variance-authority`, `clsx`, `tailwind-merge` (styling utilities)

#### [NEW] Design System & Theme
- Tailwind config with custom color palette (indigo/violet primary, status colors)
- CSS variables for dark/light mode
- Glassmorphic card utilities
- Custom font: Inter from Google Fonts

---

### Phase 7: Frontend Core Components

#### [NEW] [CascadingCategorySelector.tsx](file:///c:/campusconnectcep/frontend/src/components/complaints/CascadingCategorySelector.tsx)
- Fetches root categories on mount, children on parent selection
- Framer Motion `AnimatePresence` for smooth dropdown expand/collapse
- Skeleton loading placeholders while fetching
- Stores full `locationPath` string (e.g., "WiFi > Hostel > Block A")

#### [NEW] [UpvoteButton.tsx](file:///c:/campusconnectcep/frontend/src/components/complaints/UpvoteButton.tsx)
- Spring-physics scale bounce: `whileTap={{ scale: 0.92 }}`
- Animated counter with flip effect (number rolls up/down)
- Floating "+1" particle that fades upward
- Canvas Confetti burst when upvote pushes count ≥ 15
- Optimistic UI update with rollback on error

#### [NEW] [ComplaintStatusTracker.tsx](file:///c:/campusconnectcep/frontend/src/components/complaints/ComplaintStatusTracker.tsx)
- Horizontal multi-step timeline: Pending → Approved → In Progress → Resolved
- Glowing active node with pulse wave animation
- Connecting line that fills with gradient as status progresses

#### [NEW] [DuplicateBanner.tsx](file:///c:/campusconnectcep/frontend/src/components/complaints/DuplicateBanner.tsx)
- Smooth slide-in from top with `animate-pulse` warning glow
- Collapsible preview of existing complaint
- Inline upvote button for the duplicate

#### [NEW] [ComplaintPriorityQueue.tsx](file:///c:/campusconnectcep/frontend/src/components/complaints/ComplaintPriorityQueue.tsx)
- Sortable table with priority-colored rows
- Status badges with dot indicators
- Quick status update dropdown for admins
- Animated row transitions on status change

#### [NEW] [LostFoundGallery.tsx](file:///c:/campusconnectcep/frontend/src/components/lostfound/LostFoundGallery.tsx)
- Masonry grid with `layoutId` for smooth filter transitions
- Category filter pills with active state animation
- Hover zoom effect on cards
- Admin: redact/unblur toggle slider for hidden details

#### [NEW] [ClaimWizardModal.tsx](file:///c:/campusconnectcep/frontend/src/components/lostfound/ClaimWizardModal.tsx)
- 3-step horizontal slide wizard:
  1. **Verification Quiz**: Answer questions about the item
  2. **Confirmation**: Review answers
  3. **Result**: Show QR code with claim code (or "Pending admin review")
- Smooth Framer Motion slide transitions between steps

---

### Phase 8: Full Page Views

#### [NEW] Landing Page (`/`)
- Hero section with gradient text and floating illustration
- Feature cards with hover effects
- CTA buttons to login/register

#### [NEW] Auth Pages (`/login`, `/register`)
- Split-screen layout with form and decorative side
- Form validation with inline error animations
- Role selection on register (dropdown)

#### [NEW] Student Dashboard (`/dashboard`)
- Stats cards (total complaints, resolved, pending, upvotes given)
- Recent complaints list with status trackers
- Quick action buttons

#### [NEW] File Complaint (`/complaints/new`)
- Cascading category selector
- Text inputs for title, description
- Dedup check on category+location selection
- Submit with loading state and success toast

#### [NEW] Lost & Found Portal (`/lost-found`)
- Filterable gallery with report form modal
- Claim wizard for claiming items

#### [NEW] Admin Dashboard (`/admin`)
- Analytics charts (Recharts): complaints by category, resolution time, status distribution
- Priority queue table
- Domain filter (admin sees only their category)
- Report export buttons

---

## Verification Plan

### Automated Tests
- Backend builds without errors: `.\mvnw.cmd clean compile`
- Spring Boot starts successfully: `.\mvnw.cmd spring-boot:run`
- H2 console accessible at `http://localhost:8080/h2-console`
- Frontend builds without errors: `npm run build`
- Frontend dev server runs: `npm run dev`

### Manual Verification
- Register a student account → Login → Get JWT
- Create a complaint → Verify dedup check
- Upvote a complaint → See priority recalculation
- Report a found item → Submit claim → Admin approve → QR code generated
- Export Excel report → Verify `.xlsx` downloads
- Verify dark/light mode toggle
- Verify all animations render correctly in browser

---

## Implementation Order

| Phase | Component | Estimated Files |
|-------|-----------|----------------|
| 1 | Spring Boot scaffold + Maven Wrapper + config | ~5 files |
| 2 | JPA Entities + Enums | ~10 files |
| 3 | Repositories + Services | ~14 files |
| 4 | Security + JWT | ~4 files |
| 5 | REST Controllers + Seeder + Exception handling | ~8 files |
| 6 | Next.js scaffold + design system | ~8 files |
| 7 | Frontend components | ~12 files |
| 8 | Page views + routing | ~8 files |
| **Total** | | **~69 files** |

I will implement all phases sequentially, starting with the backend foundation.
