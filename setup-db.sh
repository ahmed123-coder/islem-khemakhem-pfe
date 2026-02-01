#!/bin/bash

echo "Setting up database..."

# Start Prisma dev database (this will create a local PostgreSQL instance)
echo "Starting local PostgreSQL database..."
npx prisma dev &

# Wait for database to be ready
sleep 5

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

echo "Database setup complete!"
echo "You can now run 'npm run dev' to start the application."