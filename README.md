# Library Connekto – Frontend (React + Vite)

Modern, responsive frontend for Library Connekto — a platform that connects students with smart libraries and empowers admins with management, analytics, booking and messaging tools.

![Library Connekto](src/assets/Logo.png)

## Features

- **Public Site**
  - Home, Services, About, Contact with animated sections (AOS/Tailwind)

- **Admin Portal**
  - Dashboard with quick stats, charts and recent activity
  - Student management (single/bulk add, edit, delete)
  - Seat management with layout, booking approvals and auto-assignment
  - Booking management with bulk approve/reject
  - Messaging with students (including broadcast)
  - Attendance details and per-student history
  - Revenue analytics and trends
  - Referral program management and invite flow
  - Admin profile and library details (location, shifts, seats)

- **Student Portal**
  - Dashboard with attendance actions and quick actions
  - Book seats, view available seats by library/date
  - Attendance history and daily attendance
  - Tasks and exams tracking
  - Messages with admin
  - Subscription management with plans and payment flow (Razorpay-ready; simulated fallback)

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS + PostCSS + Autoprefixer
- Recharts (charts & analytics)
- React Router DOM 7
- ESLint 9 with React Hooks & React Refresh configs

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Backend API running (FastAPI in this repo’s Backend folder or a deployed URL)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Vite will print the local and network URLs. The app defaults to using API base URL from `.env` (see Environment).

### Build

```bash
npm run build
```

### Preview (serve dist)

```bash
npm run preview
``;

### Lint

```bash
npm run lint
```

## Environment

Create a `.env` file in project root (already present in repo). Typical variables:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

The API client reads `VITE_API_BASE_URL` in `src/lib/api.js`. For production, set it to your deployed backend URL.

## Project Structure

```
Library Connekto/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ component/
│  │  ├─ About/
│  │  ├─ Admin/                 # Admin pages (Dashboard, Analytics, Seats, Bookings, Messages, etc.)
│  │  ├─ Auth/                  # Admin & Student authentication UIs
│  │  ├─ Booking/               # Anonymous booking form
│  │  ├─ Contact/
│  │  ├─ Footer/
│  │  ├─ Header/
│  │  ├─ Home/
│  │  ├─ Icons/
│  │  ├─ Services/
│  │  ├─ Student/               # Student portal
│  │  └─ common/                # Shared components (Charts, Messaging)
│  ├─ contexts/                 # Auth context
│  ├─ lib/                      # API client
│  ├─ services/                 # Payment service (Razorpay-ready)
│  ├─ App.jsx                   # Routes
│  ├─ index.css
│  └─ main.jsx
├─ eslint.config.js
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
├─ package.json
└─ README.md
```

## Routing

Routes are defined in `src/App.jsx` using React Router. Highlights:

- Public: `/`, `/services`, `/about`, `/contact`
- Admin: `/admin/auth`, `/admin/dashboard`, `/admin/students`, `/admin/messages`, `/admin/seats`, `/admin/analytics`, `/admin/booking-management`, `/admin/details`, `/admin/revenue-details`, `/admin/student-removal-requests`, `/admin/student-attendance/:studentId`
- Student: `/student/login`, `/student/set-password`, `/student/dashboard`, `/student/book-seat`, `/student/messages`, `/student/attendance`, `/student/attendance-history`, `/student/profile`

## API Client

`src/lib/api.js` wraps fetch with auth handling:

- Reads token from `localStorage` (helpers included)
- Sends JSON by default, includes `Authorization: Bearer <token>` when present
- Exposes `get`, `post`, `put`, `del`, and anonymous variants

Configure the base URL with `VITE_API_BASE_URL`.

## Styling & UI

- Tailwind utility-first styling. See `tailwind.config.js` and `index.css` for utilities and custom animations.
- Charts built with Recharts. Shared components in `src/component/common/Charts.jsx`.

## Payments

`src/services/paymentService.js` provides a Razorpay integration scaffold with a simulator fallback for development. Swap `simulatePayment` for live `Razorpay` flow once keys are configured.

## Development Notes

- Uses ESLint with React Hooks and React Refresh plugins
- AOS used on About page animations
- Seat management and booking flows expect backend endpoints present in the backend app (`/admin/*`, `/booking/*`, `/messaging/*`, etc.)

## Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

## Troubleshooting

- If API calls fail locally, confirm `VITE_API_BASE_URL` and CORS settings on backend.
- For Windows line-endings warnings from Git, you can set `git config core.autocrlf true` or keep defaults; it does not affect runtime.

## License

Proprietary – All rights reserved. Contact the project owner for usage terms.
