# Telegram Secrets - Frontend

Next.js 14 application with App Router and internationalization.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `.env.local` file (see `.env.local.example`)

3. Start development server:
```bash
npm run dev
```

## Features

- **Internationalization**: Automatic language detection with manual switcher
- **Dark Theme**: Elegant noir design with gold accents
- **Responsive**: Mobile-first design
- **Type-Safe**: Full TypeScript support

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Directory Structure

```
frontend/
├── app/
│   ├── [locale]/         # Internationalized routes
│   │   ├── page.tsx      # Homepage
│   │   ├── store/        # Store page
│   │   └── admin/        # Admin panel
│   └── globals.css       # Global styles
├── components/           # Reusable components
├── lib/                  # Utilities and API client
├── messages/             # i18n translations
└── public/              # Static assets
```

## Internationalization

Supported languages:
- English (en)
- Portuguese (pt)
- Spanish (es)

Add new translations in `messages/{locale}.json`

## Styling

Using Tailwind CSS with custom configuration:
- Custom color palette (noir theme)
- Custom components (buttons, cards, inputs)
- Responsive utilities

## API Integration

API client is configured in `lib/api.ts` with automatic JWT token handling.
