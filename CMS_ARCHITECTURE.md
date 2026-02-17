# CMS System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │  Public Pages    │         │  Admin Panel     │              │
│  │  (Read Only)     │         │  /admin/content  │              │
│  │                  │         │  (ADMIN Only)    │              │
│  │  - Homepage      │         │                  │              │
│  │  - Services      │         │  ┌────────────┐  │              │
│  │  - Blog          │         │  │  Navbar    │  │              │
│  │  - Contact       │         │  │  Hero      │  │              │
│  └────────┬─────────┘         │  │  Footer    │  │              │
│           │                   │  └────────────┘  │              │
│           │                   └────────┬─────────┘              │
│           │                            │                         │
└───────────┼────────────────────────────┼─────────────────────────┘
            │                            │
            │ GET                        │ PUT (Auth Required)
            │                            │
┌───────────┼────────────────────────────┼─────────────────────────┐
│           │      API LAYER             │                         │
├───────────┼────────────────────────────┼─────────────────────────┤
│           │                            │                         │
│           ▼                            ▼                         │
│  ┌─────────────────────────────────────────────────┐            │
│  │   /api/content/[key]/route.ts                   │            │
│  │                                                  │            │
│  │   GET  → Public Access                          │            │
│  │          - Fetch content by key                 │            │
│  │          - Return 404 if not found              │            │
│  │                                                  │            │
│  │   PUT  → Admin Only                             │            │
│  │          - Check auth (getCurrentUser)          │            │
│  │          - Verify ADMIN role                    │            │
│  │          - Upsert content                       │            │
│  │          - Return 401 if unauthorized           │            │
│  └──────────────────────┬──────────────────────────┘            │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ Prisma ORM
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│        DATABASE LAYER   │                                        │
├─────────────────────────┼────────────────────────────────────────┤
│                         ▼                                        │
│  ┌──────────────────────────────────────────────┐               │
│  │  PostgreSQL - SiteContent Table              │               │
│  │                                               │               │
│  │  ┌────────────────────────────────────────┐  │               │
│  │  │ id        │ String (UUID)              │  │               │
│  │  │ key       │ String (UNIQUE)            │  │               │
│  │  │ value     │ JSON                       │  │               │
│  │  │ createdAt │ DateTime                   │  │               │
│  │  │ updatedAt │ DateTime                   │  │               │
│  │  └────────────────────────────────────────┘  │               │
│  │                                               │               │
│  │  Sample Data:                                │               │
│  │  ┌─────────┬──────────┬──────────────────┐  │               │
│  │  │ key     │ value                       │  │               │
│  │  ├─────────┼──────────────────────────────┤  │               │
│  │  │ navbar  │ {logo, links[]}             │  │               │
│  │  │ hero    │ {title, subtitle, cta...}   │  │               │
│  │  │ footer  │ {company, email, social...} │  │               │
│  │  └─────────┴──────────────────────────────┘  │               │
│  └──────────────────────────────────────────────┘               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      HELPER LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  src/lib/content.ts                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • getSiteContent<T>(key)                                  │ │
│  │  • updateSiteContent(key, value)                           │ │
│  │  • TypeScript Interfaces:                                  │ │
│  │    - NavbarContent                                         │ │
│  │    - HeroContent                                           │ │
│  │    - FooterContent                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  src/lib/auth.ts                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • getCurrentUser()                                        │ │
│  │  • verifyToken()                                           │ │
│  │  • JWT Authentication                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Public Request (GET)                                            │
│  ─────────────────────                                           │
│  User → API → Database → Response                                │
│  ✅ No authentication required                                   │
│                                                                   │
│  Admin Request (PUT)                                             │
│  ────────────────────                                            │
│  Admin → API → Check Auth → Verify ADMIN Role → Database        │
│                    │              │                              │
│                    │              └─ ❌ Not ADMIN → 401          │
│                    └─ ❌ No Token → 401                          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW EXAMPLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Admin Updates Hero Content                                  │
│     ↓                                                            │
│  2. PUT /api/content/hero                                        │
│     Body: { value: { title: "New Title", ... } }                │
│     ↓                                                            │
│  3. Verify JWT Token & ADMIN Role                               │
│     ↓                                                            │
│  4. Prisma Upsert                                                │
│     UPDATE if exists, CREATE if not                              │
│     ↓                                                            │
│  5. Database Updated                                             │
│     ↓                                                            │
│  6. Public Page Fetches New Content                              │
│     GET /api/content/hero                                        │
│     ↓                                                            │
│  7. Display Updated Content                                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. API Routes (`/api/content/[key]`)
- Dynamic route handling
- GET: Public access
- PUT: Admin-only access
- Automatic upsert functionality

### 2. Database Model (`SiteContent`)
- Flexible JSON storage
- Unique key constraint
- Automatic timestamps

### 3. Helper Functions (`src/lib/content.ts`)
- Type-safe content fetching
- Reusable utility functions
- TypeScript interfaces

### 4. Admin UI (`/admin/content`)
- Tab-based interface
- Real-time updates
- Form validation

### 5. Security Layer
- JWT authentication
- Role-based access control
- Middleware protection

## Content Types

```typescript
// Navbar
{
  logo: "ConsultPro",
  links: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" }
  ]
}

// Hero
{
  title: "Transform Your Business",
  subtitle: "Expert consulting services",
  ctaText: "Get Started",
  ctaLink: "/contact"
}

// Footer
{
  company: "ConsultPro",
  email: "contact@consultpro.com",
  phone: "+1 (555) 123-4567",
  social: {
    linkedin: "https://linkedin.com/...",
    twitter: "https://twitter.com/..."
  }
}
```
