# Quick Testing Guide

## 🚀 Setup

```bash
# Reset database and seed with test data
npx prisma migrate reset --force
npx prisma db seed

# Start development server
npm run dev
```

## 🔐 Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@consultpro.com | admin123 | All routes |
| Client | client@consultpro.com | client123 | /client/* |
| Consultant 1 | consultant@consultpro.com | consultant123 | /consultant/* |
| Consultant 2 | consultant2@consultpro.com | consultant123 | /consultant/* |

## 📋 Test Scenarios

### 1. Client Login & Dashboard
```
1. Login as: client@consultpro.com / client123
2. Navigate to: /client
3. Should see: 4 missions (1 pending, 2 active, 1 completed)
4. Try accessing: /consultant → Should redirect to /
```

### 2. Consultant Login & Dashboard
```
1. Login as: consultant@consultpro.com / consultant123
2. Navigate to: /consultant
3. Should see: Assigned missions
4. Try accessing: /client → Should redirect to /
```

### 3. Admin Access
```
1. Login as: admin@consultpro.com / admin123
2. Can access: /admin, /client, /consultant
3. Full access to all routes
```

### 4. Middleware Protection
```
Test without login:
- /client → Redirects to /login
- /consultant → Redirects to /login
- /admin → Redirects to /login

Public routes (no login needed):
- /, /services, /blog, /contact, /pricing, /prendre-rdv
```

## 📊 Seeded Data Overview

### Missions (4 total)
1. **Digital Transformation Strategy**
   - Status: ACTIVE (45% progress)
   - Consultant: consultant@consultpro.com
   - Messages: 12

2. **Business Process Optimization**
   - Status: ACTIVE (70% progress)
   - Consultant: consultant2@consultpro.com
   - Messages: 25

3. **Market Expansion Analysis**
   - Status: PENDING (0% progress)
   - Consultant: consultant@consultpro.com
   - Messages: 0

4. **Financial Restructuring**
   - Status: COMPLETED (100% progress)
   - Consultant: consultant2@consultpro.com
   - Messages: 48

### Subscription
- Client has active PRO plan subscription
- Billing: Monthly
- Status: ACTIVE
- Valid for 30 days

## 🧪 API Testing

### Login API
```bash
# Test client login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@consultpro.com","password":"client123"}'

# Test consultant login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"consultant@consultpro.com","password":"consultant123"}'
```

## ✅ Verification Checklist

- [ ] Database seeded successfully
- [ ] Can login as client
- [ ] Can login as consultant
- [ ] Can login as admin
- [ ] Client can access /client routes
- [ ] Consultant can access /consultant routes
- [ ] Admin can access all routes
- [ ] Middleware blocks unauthorized access
- [ ] Missions display correctly
- [ ] Messages are associated with missions
- [ ] Subscription is active for client

## 🐛 Troubleshooting

### Issue: Login fails
- Check database is seeded: `npx prisma studio`
- Verify JWT_SECRET in .env file
- Check console for errors

### Issue: Routes redirect unexpectedly
- Clear browser cookies
- Check token in browser DevTools → Application → Cookies
- Verify middleware.ts is correct

### Issue: No data showing
- Run seed again: `npx prisma db seed`
- Check Prisma Studio: `npx prisma studio`
- Verify API responses in Network tab
