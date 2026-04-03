# TrackPOC - Production-Grade GPS Tracking Platform Frontend

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 to see the application.

## What's Been Built

A complete, production-ready frontend for TrackPOC - a real-time GPS tracking platform for managing 5,000+ POC (Push-to-Talk over Cellular) radios.

### Pages Implemented

1. **Landing Page (/)** 
   - Hero section with animated dot-grid and scanline effects
   - Features showcase (6 cards)
   - How It Works section (3 steps)
   - Enterprise security highlights
   - Stats banner
   - Full responsive navbar and footer

2. **Login Page (/login)**
   - Split-screen design
   - Left: Animated map visualization with pulsing radio pins
   - Right: Login form with validation
   - Remember me + forgot password
   - Error handling and loading states

3. **Register Page (/register)**
   - Centered form with glass effect
   - Password strength indicator (weak/medium/strong)
   - Confirm password matching
   - Success state with animated checkmark
   - Full form validation

4. **Dashboard (/dashboard)**
   - Protected route (requires authentication)
   - Logout functionality
   - Placeholder for future features

## Design System

**Aesthetic**: Industrial-precision command center with dark navy base and electric cyan accents.

**Colors**:
- Primary Background: `#080D14` (deep navy)
- Accent: `#00C2FF` (electric cyan)
- Success: `#00E096`
- Warning: `#FFB800`
- Danger: `#FF4757`

**Typography**:
- Headings: Rajdhani (geometric, technical)
- Body: DM Sans (clean, readable)
- Mono: JetBrains Mono (data, coordinates)

**Effects**:
- Dot-grid backgrounds
- Animated scanlines
- Glass-morphism cards
- Cyan glow on hover
- Smooth page transitions
- Custom scrollbar

## Tech Stack

- **React 19** - UI framework
- **React Router 7** - Routing & navigation
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite 8** - Build tool

## Authentication

The app integrates with your existing backend:
- Login: `POST http://localhost:8080/api/auth/login`
- Register: `POST http://localhost:8080/api/auth/register`

JWT tokens are stored in localStorage and included in the Authorization header.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom React hooks
│   ├── App.jsx         # Router config
│   └── index.css       # Global styles
├── dist/               # Production build
└── package.json        # Dependencies
```

## Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder:
- index.html (0.84 kB)
- CSS bundle (22.15 kB)
- JS bundle (394.02 kB)

## Key Features

✅ Fully responsive (mobile-first)
✅ Smooth animations and transitions
✅ Form validation with error messages
✅ Loading states for async operations
✅ Protected routes with auth checks
✅ Custom scrollbar and visual effects
✅ Accessible (semantic HTML, ARIA labels)
✅ Production-ready build
✅ Clean, maintainable code structure

## Customization

### Change API Endpoint
Edit the fetch URLs in:
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`

### Modify Colors
Edit `src/index.css` in the `@theme` block:
```css
@theme {
  --color-accent: #YOUR_COLOR;
}
```

### Add New Routes
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Use `<ProtectedRoute>` wrapper if auth required

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Next Steps

The frontend is ready to connect to your backend. To extend functionality:

1. Add real-time map with GPS tracking
2. Implement fleet management dashboard
3. Build route history & playback
4. Create geofencing configuration UI
5. Add user/team management screens
6. Develop analytics & reporting

---

**Note**: This is a complete, standalone frontend. It connects to the Spring Boot backend at `http://localhost:8080` for authentication. All routes are functional, responsive, and production-ready.
