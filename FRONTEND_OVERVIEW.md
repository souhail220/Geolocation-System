# TrackPOC Frontend - Production-Grade GPS Tracking Platform

## Overview
A complete, production-ready frontend for a real-time GPS tracking platform managing 5,000+ POC radios. Features an industrial-precision dark theme with electric cyan accents inspired by mission-critical command centers.

## Features Implemented

### Pages
1. **Landing Page (/)** - Multi-section marketing site with:
   - Animated hero section with dot-grid background and scanline effect
   - 6 feature cards (Live Map, Geofencing, Battery Monitoring, History, Fleet Management, RBAC)
   - 3-step "How It Works" section
   - Enterprise security highlights
   - Stats banner
   - Responsive navbar and footer

2. **Login Page (/login)** - Split-screen layout with:
   - Animated map visualization on left
   - Login form with email/password
   - Remember me and forgot password options
   - Loading states and error handling
   - Connects to: POST /api/auth/login

3. **Register Page (/register)** - Centered form with:
   - Full name, email, organization, role fields
   - Password with strength indicator (weak/medium/strong)
   - Confirm password with match validation
   - Terms agreement checkbox
   - Success state with animated checkmark
   - Connects to: POST /api/auth/register

4. **Dashboard (/dashboard)** - Protected route placeholder:
   - Coming soon message
   - Logout functionality
   - Preview of future features

## Design System

### Color Palette
- Background Base: `#080D14` - Deep navy black
- Background Surface: `#0E1622` - Slightly lighter navy
- Background Card: `#131D2E` - Card background
- Border: `#1E2D42` - Subtle borders
- Accent: `#00C2FF` - Electric cyan (primary)
- Accent Dim: `#0096CC` - Darker cyan
- Success: `#00E096` - Green
- Warning: `#FFB800` - Amber
- Danger: `#FF4757` - Red
- Text Primary: `#F0F4F8` - Near white
- Text Secondary: `#7A8FA6` - Muted blue-gray
- Text Muted: `#3D5166` - Very muted

### Typography
- Display/Headings: **Rajdhani** - Geometric, technical, commanding
- Body Text: **DM Sans** - Clean, modern, readable
- Monospace/Data: **JetBrains Mono** - For coordinates, IDs, stats

### Visual Effects
- Dot-grid background pattern
- Animated scanline effect
- Glass-morphism cards (blur + transparency)
- Cyan glow effects on buttons/interactive elements
- Smooth page transitions (Framer Motion)
- Custom cyan scrollbar
- Hover states with scale transforms
- Pulsing location pins

## Tech Stack
- React 19
- React Router 7
- Tailwind CSS 4 (with @tailwindcss/postcss)
- Framer Motion (animations)
- Lucide React (icons)
- Vite 8 (build tool)

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Main navigation
│   │   ├── Footer.jsx          # Site footer
│   │   └── PageTransition.jsx  # Route transition wrapper
│   ├── pages/
│   │   ├── Landing.jsx         # Home/marketing page
│   │   ├── Login.jsx           # Sign in page
│   │   ├── Register.jsx        # Sign up page
│   │   └── Dashboard.jsx       # Protected dashboard
│   ├── hooks/
│   │   └── useAuth.jsx         # Authentication hook
│   ├── App.jsx                 # Router & route protection
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles + Tailwind
├── public/                     # Static assets
├── index.html                  # HTML template
├── postcss.config.js          # PostCSS config
└── package.json               # Dependencies

```

## Authentication Flow
- JWT tokens stored in `localStorage` with key `jwt_token`
- Protected routes redirect to `/login` if not authenticated
- Auth routes (`/login`, `/register`) redirect to `/dashboard` if already authenticated
- `useAuth()` hook provides: `isAuthenticated`, `token`, `login()`, `logout()`

## API Integration
Backend endpoints (default: `http://localhost:8080`):
- `POST /api/auth/login` - Email & password login
- `POST /api/auth/register` - User registration
- JWT token returned in `Authorization` header

## Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile menu for navigation on small screens
- Stack layouts on mobile, grid layouts on desktop
- Touch-friendly tap targets

## Accessibility
- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Proper heading hierarchy
- Alt text placeholders for icons

## Development

### Install
```bash
cd frontend
npm install
```

### Run Dev Server
```bash
npm run dev
```
Server runs on http://localhost:5173

### Build for Production
```bash
npm run build
```
Output in `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## Key Components

### Navbar
- Sticky header with blur-on-scroll
- Logo with icon
- Navigation links (Features, How It Works, Security, Contact)
- CTA buttons (Sign In, Get Started)
- Mobile hamburger menu

### PageTransition
- Fade + slide animation wrapper
- 300ms duration
- Applied to all route changes

### useAuth Hook
- Manages authentication state
- Persists tokens to localStorage
- Provides login/logout methods
- Checks auth status on mount

## Customization

### Changing Colors
Edit `src/index.css` in the `@theme` block:
```css
@theme {
  --color-accent: #YOUR_COLOR;
  --color-bg-base: #YOUR_BG;
  ...
}
```

### Adding Routes
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Wrap with `ProtectedRoute` if auth required

### API Endpoint
Change backend URL in:
- `src/pages/Login.jsx` (line ~52)
- `src/pages/Register.jsx` (line ~75)

## Production Checklist
- ✅ Build succeeds without errors
- ✅ All routes functional
- ✅ Form validation working
- ✅ Error states displayed
- ✅ Loading states implemented
- ✅ Responsive on all screen sizes
- ✅ Animations smooth
- ✅ No console errors
- ✅ Accessible markup
- ✅ SEO-friendly meta tags

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance
- Code splitting via React Router
- Lazy loading ready
- Optimized animations (GPU-accelerated)
- Minimal bundle size
- Tree-shaking enabled

## Next Steps
1. Connect to real backend API
2. Implement dashboard with live map
3. Add fleet management features
4. Build route history playback
5. Implement geofencing UI
6. Add user management
7. Create analytics/reports section
