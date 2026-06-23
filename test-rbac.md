# RBAC Testing Guide

## Quick Test Scenarios

### Scenario 1: CLIENT trying to access ADMIN dashboard

**Steps:**
1. Login as CLIENT user
2. Navigate to: `http://localhost:3000/admin`

**Expected Result:**
- ✅ Redirected to `/` (home page)
- ❌ Should NOT see admin dashboard

**What to check:**
- Browser URL changes to `/`
- No admin content is visible
- No console errors

---

### Scenario 2: CLIENT trying to access CONSULTANT dashboard

**Steps:**
1. Login as CLIENT user
2. Navigate to: `http://localhost:3000/consultant`

**Expected Result:**
- ✅ Redirected to `/` (home page)
- ❌ Should NOT see consultant dashboard

---

### Scenario 3: CONSULTANT trying to access ADMIN dashboard

**Steps:**
1. Login as CONSULTANT user
2. Navigate to: `http://localhost:3000/admin`

**Expected Result:**
- ✅ Redirected to `/` (home page)
- ❌ Should NOT see admin dashboard

---

### Scenario 4: CONSULTANT trying to access CLIENT dashboard

**Steps:**
1. Login as CONSULTANT user
2. Navigate to: `http://localhost:3000/client`

**Expected Result:**
- ✅ Redirected to `/` (home page)
- ❌ Should NOT see client dashboard

---

### Scenario 5: ADMIN trying to access CONSULTANT dashboard

**Steps:**
1. Login as ADMIN user
2. Navigate to: `http://localhost:3000/consultant`

**Expected Result:**
- ✅ Redirected to `/` (home page)
- ❌ Should NOT see consultant dashboard

**Note:** This is by design for strict role separation. If you want ADMIN to access consultant routes, update the middleware.

---

### Scenario 6: Unauthenticated user trying to access protected route

**Steps:**
1. Logout (or open incognito window)
2. Navigate to: `http://localhost:3000/admin`

**Expected Result:**
- ✅ Redirected to `/login`
- ❌ Should NOT see admin dashboard

---

### Scenario 7: CLIENT accessing own dashboard

**Steps:**
1. Login as CLIENT user
2. Navigate to: `http://localhost:3000/client`

**Expected Result:**
- ✅ Can access client dashboard
- ✅ See client-specific content

---

### Scenario 8: CONSULTANT accessing own dashboard

**Steps:**
1. Login as CONSULTANT user
2. Navigate to: `http://localhost:3000/consultant`

**Expected Result:**
- ✅ Can access consultant dashboard
- ✅ See consultant-specific content

---

### Scenario 9: ADMIN accessing own dashboard

**Steps:**
1. Login as ADMIN user
2. Navigate to: `http://localhost:3000/admin`

**Expected Result:**
- ✅ Can access admin dashboard
- ✅ See admin-specific content

---

## API Testing

### Test Admin API Endpoint

**Using Browser Console:**
```javascript
// Test as CLIENT (should fail with 403)
fetch('/api/admin/users')
  .then(r => r.json())
  .then(console.log)
// Expected: { error: "Insufficient permissions", code: "AUTHORIZATION_ERROR", ... }

// Test as ADMIN (should succeed)
fetch('/api/admin/users')
  .then(r => r.json())
  .then(console.log)
// Expected: Array of users
```

**Using curl:**
```bash
# Without authentication (should return 401)
curl http://localhost:3000/api/admin/users

# With CLIENT token (should return 403)
curl -H "Cookie: auth_token=YOUR_CLIENT_TOKEN" http://localhost:3000/api/admin/users

# With ADMIN token (should return 200)
curl -H "Cookie: auth_token=YOUR_ADMIN_TOKEN" http://localhost:3000/api/admin/users
```

---

### Test Consultant API Endpoint

**Using Browser Console:**
```javascript
// Test as CLIENT (should fail with 403)
fetch('/api/consultant/profile')
  .then(r => r.json())
  .then(console.log)
// Expected: { error: "Insufficient permissions", code: "AUTHORIZATION_ERROR", ... }

// Test as CONSULTANT (should succeed)
fetch('/api/consultant/profile')
  .then(r => r.json())
  .then(console.log)
// Expected: { data: { name: "...", email: "...", specialty: "..." } }
```

---

### Test Client API Endpoint

**Using Browser Console:**
```javascript
// Test as CONSULTANT (should fail with 403)
fetch('/api/client/profile')
  .then(r => r.json())
  .then(console.log)
// Expected: { error: "Insufficient permissions", code: "AUTHORIZATION_ERROR", ... }

// Test as CLIENT (should succeed)
fetch('/api/client/profile')
  .then(r => r.json())
  .then(console.log)
// Expected: { data: { name: "...", email: "..." } }
```

---

## Automated Testing Checklist

### Frontend Protection
- [ ] CLIENT cannot access `/admin`
- [ ] CLIENT cannot access `/consultant`
- [ ] CLIENT can access `/client`
- [ ] CONSULTANT cannot access `/admin`
- [ ] CONSULTANT cannot access `/client`
- [ ] CONSULTANT can access `/consultant`
- [ ] ADMIN cannot access `/consultant`
- [ ] ADMIN cannot access `/client`
- [ ] ADMIN can access `/admin`
- [ ] Unauthenticated users redirected to `/login`

### Backend Protection
- [ ] `/api/admin/users` requires ADMIN role
- [ ] `/api/consultant/profile` requires CONSULTANT role
- [ ] `/api/client/profile` requires CLIENT role
- [ ] Returns 401 when no token
- [ ] Returns 403 when wrong role
- [ ] Returns 200 when correct role

### Status Codes
- [ ] 401 for missing/invalid token
- [ ] 403 for insufficient permissions
- [ ] 200 for successful requests

---

## Common Issues & Solutions

### Issue: Still can access wrong dashboard

**Possible Causes:**
1. Browser cache - Clear cache and hard reload (Ctrl+Shift+R)
2. Old token - Logout and login again
3. Middleware not applied - Check `middleware.ts` is in root directory

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

### Issue: Getting 401 instead of 403

**Cause:** Token is invalid or expired

**Solution:**
1. Logout and login again
2. Check token in browser DevTools → Application → Cookies
3. Verify JWT_SECRET is correct in `.env`

---

### Issue: API returns old error format

**Cause:** Route not updated to use new middleware

**Solution:**
Update the route to use `requireAuth()` and `successResponse()` helpers

---

## Manual Testing Script

Copy and paste this into your browser console after logging in:

```javascript
// Test all routes
const testRoutes = async () => {
  const routes = [
    '/api/admin/users',
    '/api/consultant/profile',
    '/api/client/profile'
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      const data = await response.json();
      console.log(`${route}: ${response.status}`, data);
    } catch (error) {
      console.error(`${route}: Error`, error);
    }
  }
};

testRoutes();
```

**Expected Output:**
- As CLIENT: admin=403, consultant=403, client=200
- As CONSULTANT: admin=403, consultant=200, client=403
- As ADMIN: admin=200, consultant=403, client=403

---

## Security Verification

### Check Security Headers

Open browser DevTools → Network → Select any request → Headers

**Should see:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: ...
```

### Check Token Security

Open browser DevTools → Application → Cookies

**auth_token should have:**
- ✅ HttpOnly: true
- ✅ Secure: true (in production)
- ✅ SameSite: Lax
- ✅ Path: /

---

## Performance Check

The RBAC fixes should have minimal performance impact:

**Middleware:**
- Adds ~1-2ms per request (token verification)
- No database queries in middleware

**API Routes:**
- Adds ~1-2ms per request (token verification)
- No additional database queries

**Total Impact:** Negligible (~2-4ms per request)

---

## Rollback Plan

If issues occur, you can rollback:

```bash
# Revert middleware
git checkout HEAD~1 middleware.ts

# Revert API routes
git checkout HEAD~1 src/app/api/admin/users/route.ts
git checkout HEAD~1 src/app/api/consultant/profile/route.ts
git checkout HEAD~1 src/app/api/client/profile/route.ts

# Remove new middleware file
rm src/lib/auth/middleware.ts

# Restart server
npm run dev
```

---

## Success Criteria

✅ **All tests pass**
✅ **No TypeScript errors**
✅ **No console errors**
✅ **Correct HTTP status codes**
✅ **Users can only access their own dashboards**
✅ **API routes properly protected**
✅ **Security headers present**

---

## Next Steps After Testing

1. **If all tests pass:**
   - Protect remaining API routes (see RBAC_IMPLEMENTATION_SUMMARY.md)
   - Add resource ownership checks
   - Add audit logging

2. **If tests fail:**
   - Check browser console for errors
   - Check server logs
   - Verify token is valid
   - Clear cache and retry

3. **Deploy to production:**
   - Run full test suite
   - Monitor logs for authorization errors
   - Set up alerts for 403 errors
