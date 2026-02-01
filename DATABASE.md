# Database Setup

## Quick Start

1. **Setup Database:**
   ```bash
   npm run db:setup
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Manual Setup

If the quick setup doesn't work, follow these steps:

1. **Start Local Database:**
   ```bash
   npx prisma dev
   ```

2. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

3. **Run Migrations:**
   ```bash
   npm run db:migrate
   ```

## API Endpoints

### POST /api/contact

Submit a contact form message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp", // optional
  "message": "I need help with strategic planning."
}
```

**Response:**
```json
{
  "message": "Contact form submitted successfully",
  "id": "contact_id"
}
```

## Database Schema

The `contacts` table stores all contact form submissions:

- `id`: Unique identifier
- `name`: Full name of the contact
- `email`: Email address
- `company`: Company name (optional)
- `message`: Message content
- `createdAt`: Timestamp of submission

## Development Tools

- **Prisma Studio:** `npm run db:studio` - Visual database browser
- **Database Migrations:** `npm run db:migrate` - Apply schema changes
- **Generate Client:** `npm run db:generate` - Regenerate Prisma client