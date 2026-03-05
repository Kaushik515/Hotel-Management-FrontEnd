# 🏨 Hotel Management Frontend

> Modern React client for hotel search, booking, authentication, and booking history.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=000)
![Router](https://img.shields.io/badge/React_Router-v6-CA4245?logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white)
![CSS](https://img.shields.io/badge/UI-Custom_CSS-1572B6?logo=css3&logoColor=white)

---

## ✨ Highlights

- 🏠 Home page with featured cities/properties
- 🔎 Smart hotel listing filters and improved search behavior
- 🏩 Hotel detail page with reservation modal + date-based checks
- 🔐 Login/Register with enhanced validation, live username availability, and password visibility toggle
- 🛡️ Session-safe auth handling (`sessionStorage`, browser-close logout, 1-hour auto-expiry)
- 👤 My Account page with profile view/edit and password security center
- 📖 My Bookings page with active/history sections, filters, cancellation, and reviews
- 🖼️ Local image pipeline with fallback handling
- 📱 Responsive layout and polished CSS across components

## 🧰 Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 18 |
| Routing | React Router v6 |
| API Client | Axios |
| Date UI | react-date-range |
| Select UI | react-select |

## 📁 Project Structure

```text
Hotel-Management-FrontEnd/
├── public/
│   └── images/             # static image assets
└── src/
    ├── components/         # reusable UI blocks
    ├── pages/              # route screens
    ├── context/            # AuthContext + SearchContext
    ├── hooks/              # useFetch and helpers
    ├── utils/              # shared validation utilities
    └── App.js              # route composition
```

## ⚙️ Environment Variables

Create `.env` in this folder:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
PORT=3000
```

> CRA exposes only variables prefixed with `REACT_APP_`.

## 🚀 Quick Start

```bash
npm install
npm start
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 📜 Scripts

- `npm start` — run development server
- `npm run build` — generate production bundle in `build/`

## 🧭 App Routes

- `/` — Home
- `/hotels` — Hotel listing / search
- `/hotels/:id` — Hotel details + reserve flow
- `/my-bookings` — User booking history
- `/account` — User account center
- `/login`
- `/register`

## 🔌 Backend Integration

The frontend calls backend routes under `/api/...` using `REACT_APP_API_BASE_URL`.

Architecture highlights:

- `AuthContext` for login state and user session data
- `SearchContext` for destination, dates, and filter options
- `useFetch` for shared loading/error/data fetching logic
- `src/utils/validation.js` for shared email/phone/password validation across pages
- Reusable component composition across all route pages

Session/auth hardening:

- Axios request interceptor auto-attaches `Authorization: Bearer <token>` from active session state.
- Auth session is stored in `sessionStorage` (closing browser/tab clears session and forces re-login).
- Token is validated at app bootstrap; expired/malformed sessions are cleared before protected pages load.
- Client-side timer auto-logs out users when token expires (default: 1 hour).
- Global axios response interceptor handles `401/403` (non-auth endpoints):
    - clears stale session
    - redirects to `/login?reason=session-expired`.

## 🔄 Key User Flows

### Reservation Flow

1. User picks dates and room options
2. Unavailable room dates are blocked in UI
3. Booking request sent to backend
4. Conflict (`409`) is shown with user-facing feedback

### My Bookings

- Loads current user bookings
- Displays date range, status, room count, and total price
- Allows cancellation of active bookings
- Splits bookings into active/upcoming and past history
- Supports history filters: `All`, `Completed`, `Cancelled`
- Allows rating/review submission for completed stays

### My Account

- Shows saved profile details in read-only mode
- `Edit Profile` enables update flow
- `Security Center` supports password change with strength indicator, rule checklist, and show/hide controls
- Profile phone updates are validated by country with format hints and inline error messaging

### Registration Validation

- Searchable country/city selects
- Live username availability check with immediate feedback
- Client-side email validation before submit
- Phone input is digits-only local number (no extension) with country-based length validation
- Password policy checklist (min length, upper/lowercase, number, special character)
- Show/Hide password toggle on register form
- Backend handles final validation + uniqueness checks

## 🎨 UI Improvements Included

- Upgraded spacing and typography
- Cleaner card layouts and section hierarchy
- Better navbar actions (bookings/logout)
- Username dropdown with `My Account`, `My Bookings`, `Logout`
- More robust image rendering fallback behavior

## 🧯 Troubleshooting

- **App not starting**: ensure port `3000` is free
- **API calls failing**: verify backend is running on `5000`
- **Auth issues**: check backend CORS + credentials settings
- **Session expires immediately after deploy**: clear browser local storage once, login again, then verify request headers contain `Authorization: Bearer ...`
- **Missing images**: confirm files exist in `public/images`

## 🚢 Deployment Notes

- Build with `npm run build`
- Serve static output from `build/`
- Set backend `CLIENT_URL` to deployed frontend origin
- Validate cookie/session behavior over HTTPS

## ✅ QA Checklist

- [ ] Register/Login/Logout works end-to-end
- [ ] Closing browser/tab clears session and requires login again
- [ ] Username availability feedback works while typing
- [ ] Register blocks invalid email/phone/password before submit
- [ ] Refresh protected routes (`/account`, `/my-bookings`) keeps session active
- [ ] Expired token redirects to `/login?reason=session-expired`
- [ ] Featured counts render correctly
- [ ] Booking conflict path shows clear `409` message
- [ ] My Bookings lists user data and allows cancel
- [ ] Image fallback behavior works

---

### 📌 Current Status

Frontend is integrated with backend booking APIs and supports the complete user booking journey.