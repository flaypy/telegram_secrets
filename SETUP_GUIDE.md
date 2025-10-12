# Telegram Secrets - Complete Setup Guide

This guide will walk you through setting up the entire project from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Database Setup

First, create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE telegram_secrets;

# Create user (optional)
CREATE USER telegram_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE telegram_secrets TO telegram_user;

# Exit psql
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
DATABASE_URL="postgresql://telegram_user:your_password@localhost:5432/telegram_secrets?schema=public"
JWT_SECRET="generate-a-random-secret-here-use-at-least-32-characters"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
PUSHINPAY_API_KEY="your-pushinpay-api-key"
PUSHINPAY_MERCHANT_ID="your-merchant-id"
PUSHINPAY_WEBHOOK_SECRET="your-webhook-secret"
```

Run database migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

Start the backend server:

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3001
🌍 Environment: development
🔗 Frontend URL: http://localhost:3000
```

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend server:

```bash
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 4. Create Admin User

Use curl or Postman to create an admin user:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "ADMIN"
  }'
```

Save the JWT token from the response. You'll need it for admin operations.

### 5. Test the Application

1. **Homepage**: Open http://localhost:3000
   - You should see the elegant noir-themed homepage

2. **Store**: Navigate to http://localhost:3000/store
   - Initially empty, but shows geolocation detection

3. **Admin Panel**: Navigate to http://localhost:3000/admin/products
   - You need to set the JWT token in localStorage first

### 6. Setting JWT Token in Browser

Open browser console (F12) and run:

```javascript
localStorage.setItem('auth_token', 'YOUR_JWT_TOKEN_HERE');
```

Refresh the page. You should now have access to the admin panel.

### 7. Create Sample Products

In the admin panel at http://localhost:3000/admin/products:

1. Click "Create Product"
2. Fill in the form:
   - Name: "Premium Collection"
   - Description: "Exclusive high-quality digital content"
   - Image URL: "https://picsum.photos/400/300"
   - Active: Checked
3. Click "Save"

Or use the API:

```bash
curl -X POST http://localhost:3001/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Premium Collection",
    "description": "Exclusive high-quality digital content",
    "imageUrl": "https://picsum.photos/400/300",
    "isActive": true,
    "prices": [
      {
        "amount": 29.99,
        "currency": "USD",
        "category": "HD"
      },
      {
        "amount": 49.99,
        "currency": "USD",
        "category": "4K"
      }
    ]
  }'
```

### 8. Test Geolocation Filtering

Products are visible globally by default. To restrict a product to specific regions:

```bash
curl -X POST http://localhost:3001/api/admin/products/regions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "YOUR_PRODUCT_ID",
    "countryCode": "BR"
  }'
```

Now the product will only be visible to users from Brazil.

### 9. Test Language Switching

Visit the homepage and check the footer. You can switch between:
- English (EN)
- Portuguese (PT)
- Spanish (ES)

The URL will change to `/en`, `/pt`, or `/es` respectively.

## Common Issues

### Issue: "Cannot connect to database"

**Solution**: Ensure PostgreSQL is running and the DATABASE_URL in `.env` is correct.

```bash
# Check if PostgreSQL is running (Windows)
pg_ctl status

# Start PostgreSQL (Windows)
pg_ctl start

# Check connection
psql -U postgres -d telegram_secrets
```

### Issue: "Module not found"

**Solution**: Run `npm install` in the respective directory.

### Issue: "Port already in use"

**Solution**: Change the PORT in backend `.env` or kill the process using that port.

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### Issue: "Prisma Client not generated"

**Solution**: Run `npm run prisma:generate` in the backend directory.

## Production Deployment

### Backend (Railway, Render, or similar)

1. Connect your GitHub repository
2. Set environment variables (same as `.env`)
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Run migrations: `npm run prisma:migrate`

### Frontend (Vercel recommended)

1. Connect your GitHub repository
2. Set root directory to `frontend`
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-api-domain.com`
4. Deploy

## Next Steps

1. **Implement PushinPay**: Replace placeholder code in `backend/src/services/pushinpay.ts`
2. **Add email notifications**: Send order confirmations and download links
3. **Implement proper authentication**: Add login page and protected routes
4. **Add product details page**: Create `/store/[id]` page
5. **Implement search and filters**: Add search functionality to store
6. **Add analytics**: Track user behavior and sales
7. **Implement file storage**: Use S3 or similar for actual digital content
8. **Add rate limiting**: Protect API endpoints from abuse
9. **Implement webhooks**: Handle payment notifications properly
10. **Add tests**: Write unit and integration tests

## Support

For issues or questions, refer to the main README.md or contact the development team.

---

**Congratulations!** Your Telegram Secrets e-commerce platform is now running locally.
