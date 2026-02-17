# CMS System Documentation

## Overview

Dynamic Website Content Management System for ConsultPro. Allows admins to control website content without code changes.

## Features

- ✅ Dynamic content management (Navbar, Hero, Footer)
- ✅ Role-based access control (ADMIN only can update)
- ✅ Public read access
- ✅ JSON-based flexible content storage
- ✅ Auto-create content on first update
- ✅ Clean error handling

## Database Schema

### SiteContent Model

```prisma
model SiteContent {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Routes

### GET /api/content/[key]
**Access:** Public  
**Description:** Fetch content by key

**Example:**
```bash
curl http://localhost:3000/api/content/navbar
```

**Response:**
```json
{
  "id": "uuid",
  "key": "navbar",
  "value": {
    "logo": "ConsultPro",
    "links": [
      { "label": "Home", "href": "/" },
      { "label": "Services", "href": "/services" }
    ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/content/[key]
**Access:** ADMIN only  
**Description:** Update or create content

**Example:**
```bash
curl -X PUT http://localhost:3000/api/content/hero \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "value": {
      "title": "New Title",
      "subtitle": "New Subtitle"
    }
  }'
```

**Response:**
```json
{
  "id": "uuid",
  "key": "hero",
  "value": {
    "title": "New Title",
    "subtitle": "New Subtitle"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Content Types

### Navbar Content
```typescript
{
  logo: string
  links: Array<{ label: string; href: string }>
}
```

### Hero Content
```typescript
{
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}
```

### Footer Content
```typescript
{
  company: string
  tagline: string
  email: string
  phone: string
  address: string
  social: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}
```

## Usage in Code

### Server Component
```typescript
import { getSiteContent, NavbarContent } from '@/lib/content'

export default async function Page() {
  const navbar = await getSiteContent<NavbarContent>('navbar')
  
  return <div>{navbar?.logo}</div>
}
```

### Client Component
```typescript
'use client'

export default function Component() {
  const [content, setContent] = useState(null)
  
  useEffect(() => {
    fetch('/api/content/hero')
      .then(res => res.json())
      .then(data => setContent(data.value))
  }, [])
  
  return <div>{content?.title}</div>
}
```

## Admin UI

Access the content management interface at:
```
http://localhost:3000/admin/content
```

**Requirements:**
- Must be logged in as ADMIN
- Default admin credentials:
  - Email: admin@consultpro.com
  - Password: admin123

## Security

- ✅ PUT requests require ADMIN role
- ✅ JWT token validation
- ✅ HTTP-only cookies
- ✅ Middleware protection on /admin routes
- ✅ GET requests are public (read-only)

## Error Handling

All API routes return proper HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing value)
- `401` - Unauthorized (not admin)
- `404` - Content not found
- `500` - Server error

## Adding New Content Keys

1. Add content via API or seed file:
```typescript
await prisma.siteContent.create({
  data: {
    key: 'homepage',
    value: { sections: [...] }
  }
})
```

2. Create TypeScript type in `src/lib/content.ts`:
```typescript
export interface HomepageContent {
  sections: Array<{ title: string; content: string }>
}
```

3. Update `SiteContentKey` type:
```typescript
export type SiteContentKey = 'navbar' | 'hero' | 'footer' | 'homepage'
```

## Migration

The migration file is located at:
```
prisma/migrations/20260216205054_add_site_content/migration.sql
```

To apply:
```bash
npx prisma migrate deploy
```

## Seeding

Initial content is seeded via:
```bash
npx tsx prisma/seed.ts
```

This creates default navbar, hero, and footer content.
