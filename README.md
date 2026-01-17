# Mindful Gamer

A mindful gaming wellness app that helps gamers track, balance, and improve their gaming habits through data-driven insights and community support.

![Mindful Gamer](./public/icon-512.png)

## Platforms

- **🌐 Web App** - Progressive Web App accessible from any browser
- **🤖 Android App** - Native Android app built with Capacitor

## Features

- **🏠 Dashboard** - Track daily gaming sessions, set budgets, and monitor wellness goals
- **📊 Insights** - View detailed analytics on gaming patterns and balance trends
- **👥 Community** - Compare progress with fellow mindful gamers
- **⚙️ Settings** - Customize your experience and manage your profile
- **🔐 User Accounts** - Sign up with email or Google, sync data across devices
- **📱 PWA Support** - Install as a native app on any device
- **📲 Auto-Tracking (Android)** - Automatic game session detection using Android Usage Stats API

## Tech Stack

### Core
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast development and build tool
- **Tailwind CSS v4** - Styling with Matsu (Ghibli-inspired) theme

### State & Data
- **Zustand** - State management
- **Firebase** - Authentication and Firestore database

### UI & Animation
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Radix UI** - Accessible component primitives

### Mobile
- **Capacitor** - Native Android wrapper
- **Android Usage Stats API** - Game session auto-tracking

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Start development server (web)
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run cap:sync` | Sync web build to native platforms |
| `npm run cap:open:android` | Open Android project in Android Studio |
| `npm run android:build` | Build and sync for Android |

## Android Development

The Android app is built using Capacitor, which wraps the web app in a native container.

### Setup

1. Build the web app: `npm run build`
2. Sync to Android: `npm run cap:sync`
3. Open in Android Studio: `npm run cap:open:android`
4. Run on device/emulator from Android Studio

### Android-Specific Features

- **Usage Stats Permission** - Required for auto-tracking game sessions
- **Background Fetch** - Syncs data in the background
- **Splash Screen** - Native splash screen on app launch
- **Status Bar** - Themed status bar integration

## Web Deployment

### Static Hosting (Recommended)

This app builds to static files and can be deployed to any static hosting service.

#### Vercel

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Deploy with default settings (auto-detected as Vite)

#### Netlify

1. Push your code to GitHub
2. Connect repository to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

#### Cloudflare Pages

1. Push your code to GitHub
2. Connect repository to [Cloudflare Pages](https://pages.cloudflare.com)
3. Set build command: `npm run build`
4. Set build output directory: `dist`

## PWA Features

The web app includes full PWA support:

- **Offline Access** - Works without internet after initial load
- **Installable** - Add to home screen on mobile or desktop
- **Auto-Updates** - Receives updates automatically
- **Responsive** - Optimized for all screen sizes

## Project Structure

```
├── android/              # Android native project (Capacitor)
├── src/
│   ├── components/
│   │   ├── budgets/      # Budget management
│   │   ├── charts/       # Data visualization
│   │   ├── community/    # Community features
│   │   ├── dashboard/    # Dashboard widgets
│   │   ├── games/        # Game management
│   │   ├── layout/       # App shell, navigation
│   │   ├── nudges/       # Wellness notifications
│   │   ├── settings/     # Settings components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   ├── plugins/          # Capacitor plugins
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
└── capacitor.config.ts   # Capacitor configuration
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Android Support

- Android 6.0+ (API 23+)

## License

MIT

---

Built with 💚 for mindful gamers everywhere.
