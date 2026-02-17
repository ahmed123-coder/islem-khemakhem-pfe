# CMS Quick Reference

## 🚀 Quick Start

### 1. Access Admin Panel
```
http://localhost:3000/admin/content
```
Login: admin@consultpro.com / admin123

### 2. Fetch Content (Public)
```typescript
// Server Component
import { getSiteContent, HeroContent } from '@/lib/content'
const hero = await getSiteContent<HeroContent>('hero')

// Client Component
const res = await fetch('/api/content/hero')
const data = await res.json()
const hero = data.value
```

### 3. Update Content (Admin Only)
```typescript
await fetch('/api/content/hero', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    value: { title: 'New Title', subtitle: 'New Subtitle' }
  })
})
```

## 📋 Available Content Keys

| Key | Description | Type |
|-----|-------------|------|
| `navbar` | Navigation menu | NavbarContent |
| `hero` | Hero section | HeroContent |
| `footer` | Footer information | FooterContent |

## 🔐 Security

- ✅ GET = Public (anyone can read)
- 🔒 PUT = Admin only (requires ADMIN role)

## 📁 Key Files

```
prisma/schema.prisma          # Database model
src/app/api/content/[key]/    # API routes
src/lib/content.ts            # Helper functions
src/app/admin/content/        # Admin UI
```

## 🛠️ Common Tasks

### Add New Content Type
1. Create in database or via API
2. Add TypeScript interface in `src/lib/content.ts`
3. Update `SiteContentKey` type

### Reset to Defaults
```bash
npx tsx prisma/seed.ts
```

### View Database
```bash
npx prisma studio
```

## 🐛 Troubleshooting

**401 Unauthorized on PUT**
- Ensure you're logged in as ADMIN
- Check auth_token cookie exists

**404 Content Not Found**
- Content key doesn't exist
- Run seed script or create via PUT

**500 Server Error**
- Check database connection
- Verify Prisma client is generated
