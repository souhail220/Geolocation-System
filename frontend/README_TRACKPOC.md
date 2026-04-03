# TrackPOC Frontend

Production-grade frontend for a real-time GPS tracking platform managing 5,000+ POC radios.

## Features

- Landing page with features showcase
- User authentication (login/register)
- Protected dashboard routes
- Industrial-precision dark theme with cyan accents
- Fully responsive design
- Smooth page transitions
- Custom scrollbar and visual effects

## Tech Stack

- React 19
- React Router 7
- Tailwind CSS 4
- Framer Motion
- Lucide React Icons
- Vite

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

The frontend connects to the backend at `http://localhost:8080`

- POST /api/auth/login
- POST /api/auth/register

JWT tokens are stored in localStorage.
