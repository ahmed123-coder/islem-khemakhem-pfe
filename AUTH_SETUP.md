# Authentication System Setup

## Installation

```bash
npm install
```

## Database Setup

1. Create `.env` file:
```bash
cp .env.example .env
```

2. Update `DATABASE_URL` and `JWT_SECRET` in `.env`

3. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Usage

### Start Development Server
```bash
npm run dev
```

### API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Pages

- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Protected user dashboard
- `/admin` - Admin-only page

### Create Admin User

```bash
npx prisma studio
```

Then manually change a user's role to `ADMIN`.

## File Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/auth/          # Auth API routes
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── dashboard/         # Protected page
│   │   └── admin/             # Admin page
│   └── lib/
│       ├── auth.ts            # Auth utilities
│       └── prisma.ts          # Prisma client
└── middleware.ts              # Route protection
```

## Security Features

- JWT tokens with 7-day expiry
- HTTP-only cookies
- Secure cookies in production
- Password hashing with bcrypt
- Role-based access control
- Middleware route protection
