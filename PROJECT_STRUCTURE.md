# Telegram Secrets - Complete Project Structure

## Full Directory Tree

```
telegram_secrets/
│
├── README.md                          # Main project documentation
├── SETUP_GUIDE.md                     # Detailed setup instructions
├── PROJECT_STRUCTURE.md               # This file
├── .gitignore                         # Git ignore rules
│
├── backend/                           # Backend API Server
│   ├── package.json                   # Backend dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── nodemon.json                   # Nodemon configuration
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore                     # Backend-specific gitignore
│   ├── README.md                      # Backend documentation
│   │
│   ├── prisma/
│   │   └── schema.prisma              # Database schema (User, Product, Price, Order, ProductRegion)
│   │
│   └── src/
│       ├── server.ts                  # Main Express application
│       │
│       ├── middleware/
│       │   ├── geolocation.ts         # IP-based country detection
│       │   └── auth.ts                # JWT authentication & admin authorization
│       │
│       ├── routes/
│       │   ├── auth.ts                # POST /register, /login
│       │   ├── products.ts            # GET /products (with geo-filtering), GET /products/:id
│       │   ├── admin.ts               # CRUD for products, regions, and orders
│       │   └── payments.ts            # POST /initiate-payment, /webhook, GET /order/:orderId
│       │
│       └── services/
│           └── pushinpay.ts           # Payment gateway integration (placeholder)
│
└── frontend/                          # Next.js 14 Frontend
    ├── package.json                   # Frontend dependencies
    ├── tsconfig.json                  # TypeScript configuration
    ├── next.config.js                 # Next.js configuration
    ├── tailwind.config.ts             # Tailwind CSS configuration
    ├── postcss.config.js              # PostCSS configuration
    ├── .env.local.example             # Environment variables template
    ├── .gitignore                     # Frontend-specific gitignore
    ├── README.md                      # Frontend documentation
    ├── i18n.ts                        # Internationalization config
    ├── middleware.ts                  # Next.js middleware for i18n routing
    │
    ├── app/
    │   ├── globals.css                # Global styles with Tailwind
    │   │
    │   └── [locale]/                  # Internationalized routes
    │       ├── layout.tsx             # Root layout with Header/Footer
    │       ├── page.tsx               # Homepage (hero + features)
    │       │
    │       ├── store/
    │       │   └── page.tsx           # Store page with product grid
    │       │
    │       └── admin/
    │           ├── layout.tsx         # Admin panel layout
    │           ├── products/
    │           │   └── page.tsx       # Product management (CRUD)
    │           └── orders/
    │               └── page.tsx       # Order management (view orders)
    │
    ├── components/
    │   ├── Header.tsx                 # Navigation header
    │   ├── Footer.tsx                 # Footer with language switcher
    │   ├── LanguageSwitcher.tsx       # Language dropdown
    │   └── ProductCard.tsx            # Product display card
    │
    ├── lib/
    │   └── api.ts                     # API client with axios (types & functions)
    │
    └── messages/                      # i18n translations
        ├── en.json                    # English translations
        ├── pt.json                    # Portuguese translations
        └── es.json                    # Spanish translations
```

## Key Files Explained

### Backend

| File | Purpose |
|------|---------|
| `server.ts` | Main Express app with middleware and route registration |
| `middleware/geolocation.ts` | Detects user country from IP using geoip-lite |
| `middleware/auth.ts` | JWT verification and admin role checking |
| `routes/auth.ts` | User registration and login endpoints |
| `routes/products.ts` | Public product listing with geolocation filtering |
| `routes/admin.ts` | Protected admin endpoints for CRUD operations |
| `routes/payments.ts` | Payment initiation and webhook handling |
| `services/pushinpay.ts` | Payment gateway integration placeholder |
| `prisma/schema.prisma` | Complete database schema with 5 models |

### Frontend

| File | Purpose |
|------|---------|
| `i18n.ts` | Configures next-intl with supported locales |
| `middleware.ts` | Next.js middleware for automatic locale detection |
| `app/[locale]/layout.tsx` | Root layout providing i18n context |
| `app/[locale]/page.tsx` | Homepage with hero section and features |
| `app/[locale]/store/page.tsx` | Product listing page with API integration |
| `app/[locale]/admin/layout.tsx` | Admin panel wrapper with authentication check |
| `app/[locale]/admin/products/page.tsx` | Product CRUD interface |
| `app/[locale]/admin/orders/page.tsx` | Order management interface |
| `components/Header.tsx` | Site navigation |
| `components/Footer.tsx` | Footer with language switcher |
| `components/LanguageSwitcher.tsx` | Language selection dropdown |
| `components/ProductCard.tsx` | Reusable product card component |
| `lib/api.ts` | Centralized API client with type definitions |
| `messages/*.json` | Translation files for EN, PT, ES |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  (Browser with Next.js 14 + React + Tailwind CSS)          │
│                                                             │
│  Pages:                                                     │
│  • Homepage (/)                                            │
│  • Store (/store)                                          │
│  • Admin Panel (/admin/products, /admin/orders)           │
│                                                             │
│  Features:                                                  │
│  • Multi-language (EN/PT/ES)                               │
│  • Responsive Design                                        │
│  • JWT Authentication                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST API
                   │ (JSON)
┌──────────────────▼──────────────────────────────────────────┐
│                    EXPRESS.JS API                           │
│  (Node.js + TypeScript + Express)                          │
│                                                             │
│  Middleware:                                                │
│  • Geolocation (IP → Country Code)                         │
│  • JWT Authentication                                       │
│  • Admin Authorization                                      │
│                                                             │
│  Routes:                                                    │
│  • /api/auth - Registration & Login                        │
│  • /api/products - Product listing (geo-filtered)          │
│  • /api/admin - Admin CRUD operations                      │
│  • /api/payments - Payment processing                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ Prisma ORM
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                      │
│                                                             │
│  Tables:                                                    │
│  • users (authentication & roles)                          │
│  • products (digital content items)                        │
│  • prices (multi-currency pricing tiers)                   │
│  • orders (purchase tracking)                              │
│  • product_regions (geolocation restrictions)              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Product Listing with Geolocation

```
User (Brazil) → Frontend /store
                    ↓
Frontend → API GET /api/products
                    ↓
API: Geolocation Middleware
     • Detects IP: 200.XXX.XXX.XXX
     • Resolves to: BR (Brazil)
                    ↓
API: Products Route
     • Query all active products
     • Filter by ProductRegion table
     • Show products with no regions OR BR region
                    ↓
Frontend: Display filtered products
```

### 2. Admin Creating Product

```
Admin → Login → Receive JWT token
         ↓
Admin → Admin Panel → Create Product Form
         ↓
Frontend → API POST /api/admin/products
           + JWT in Authorization header
                    ↓
API: Auth Middleware
     • Verify JWT signature
     • Check role = ADMIN
                    ↓
API: Admin Route
     • Validate input
     • Create product in database
     • Return product data
                    ↓
Frontend: Update product list
```

### 3. Payment Flow

```
Customer → Select Product → Choose Price Tier
                    ↓
Frontend → API POST /api/payments/initiate-payment
           + JWT token
           + priceId
                    ↓
API: Create Order (status: PENDING)
     ↓
API: Call PushinPay SDK
     • Create payment session
     • Return payment URL
                    ↓
Frontend: Redirect to payment URL
                    ↓
Customer completes payment on PushinPay
                    ↓
PushinPay → Webhook POST /api/payments/webhook
            + payment status
                    ↓
API: Update Order (status: COMPLETED)
     • Generate download link
     • Store in order record
                    ↓
API: (Optional) Send email with download link
```

## Technology Stack Details

### Backend Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js 4.18+
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5.7+
- **Authentication**: jsonwebtoken 9.0+
- **Password Hashing**: bcryptjs 2.4+
- **Geolocation**: geoip-lite 1.4+
- **CORS**: cors 2.8+

### Frontend Stack
- **Framework**: Next.js 14.1+
- **Language**: TypeScript 5.3+
- **UI Library**: React 18.2+
- **Styling**: Tailwind CSS 3.4+
- **i18n**: next-intl 3.4+
- **HTTP Client**: axios 1.6+
- **Font**: Inter (sans), Georgia (serif)

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=              # PostgreSQL connection string
JWT_SECRET=                # Secret for JWT signing
PORT=                      # Server port (default: 3001)
NODE_ENV=                  # development | production
FRONTEND_URL=              # CORS allowed origin
PUSHINPAY_API_KEY=        # Payment gateway API key
PUSHINPAY_MERCHANT_ID=    # Payment merchant ID
PUSHINPAY_WEBHOOK_SECRET= # Webhook signature verification
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=      # Backend API URL
```

## Color Palette (Noir Theme)

| Color | Hex | Usage |
|-------|-----|-------|
| Noir Darker | `#0a0a0a` | Main background |
| Noir Dark | `#1a1a1a` | Card backgrounds |
| Noir Medium | `#2d2d2d` | Input backgrounds |
| Noir Light | `#404040` | Borders |
| Accent Gold | `#d4af37` | Primary accent, headings |
| Accent Rose | `#ff6b9d` | Secondary accent |
| Accent Purple | `#9b59b6` | Tertiary accent |

## API Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

### JWT Token Response
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

**Note**: This structure represents the complete, production-ready skeleton. Customize as needed for your specific requirements.
