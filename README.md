# Hotel Management Frontend

Modern React client for hotel search, booking, authentication, and booking history.

## Highlights
- Home page with featured cities/properties and property-type insights
- Hotel listing with filters and improved query behavior
- Hotel detail page with reservation modal and date-based availability checks
- Authentication pages (login/register) with enhanced validation
- My Bookings page with status view and cancel action
- Local image asset pipeline with fallback handling
- Responsive UI and upgraded CSS across major components

## Tech Stack
- React 18
- React Router v6
- Axios
- react-date-range
- react-select

## Project Structure
- `src/components/` reusable UI modules
- `src/pages/` route-level pages
- `src/context/` auth/search state
- `src/hooks/` shared data hooks
- `public/images/` local media assets

## Environment Variables
Create `.env` inside this folder:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
PORT=3000
```

## Install & Run
```bash
npm install
npm start
```

## Build
```bash
npm run build
```

## Available Scripts
- `npm start` — starts React development server
- `npm run build` — creates production build in `build/`
- `npm test` — runs test watcher

## Routing
- `/` Home
- `/hotels` Listing/search
- `/hotels/:id` Hotel details + reserve flow
- `/my-bookings` User booking history
- `/login`
- `/register`

## Backend Integration
This app targets backend API routes under `/api/...`.

Default local setup:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Application Architecture
- `AuthContext` stores session user and auth actions
- `SearchContext` stores destination/dates/options used by listing and hotel pages
- `useFetch` centralizes API read operations and loading/error handling
- Route pages compose reusable components (`Navbar`, `Header`, cards, reserve modal)

## Data & State Strategy
- Axios defaults are configured globally in `src/index.js`
- Authenticated calls rely on cookie-based backend session
- Booking and cancellation use optimistic UI refresh patterns in relevant screens
- Reserve flow computes date ranges and disables unavailable room numbers

## Key Functional Flows

### Reservation Flow
- User selects travel dates and room(s)
- Unavailable room dates are blocked in UI
- Booking request sent to backend
- Conflict response (`409`) is handled with user-facing feedback

### My Bookings
- Fetches current user bookings
- Displays date range, status, room count, price
- Allows cancellation for active bookings

### Register Validation
- Country/city selectable with searchable dropdowns
- Client-side email validation before submit
- Backend enforces final email and uniqueness checks

## UI/CSS Improvements Included
- Enhanced home page sections (featured, properties, cards)
- Better typography and card spacing
- Improved navbar actions (including booking navigation/logout flow)
- More robust image rendering and fallback behavior

## Troubleshooting
- **Frontend fails to start**: ensure no other app uses port `3000`
- **API calls fail**: verify backend is running on `5000`
- **Auth cookie issues**: check backend CORS + credentials config
- **Images not showing**: confirm files exist in `public/images`

## Environment Modes
- Local development: use `.env` with `REACT_APP_API_BASE_URL=http://localhost:5000`
- If backend host changes, update `REACT_APP_API_BASE_URL` and restart frontend
- CRA only exposes variables prefixed with `REACT_APP_`

## Deployment Notes
- Build command: `npm run build`
- Serve static output from `build/` using your preferred web server
- Ensure backend `CLIENT_URL` matches deployed frontend origin
- Validate cookie/session behavior under HTTPS before release

## QA Checklist
- [ ] Register/Login/Logout flow works end-to-end
- [ ] Featured city/property counts render non-zero values
- [ ] Booking conflict shows clear error (`409` path)
- [ ] My Bookings shows current user records and cancel action
- [ ] Fallback images render when an asset URL fails

## Status
Frontend is integrated with booking APIs, includes polished UI updates, and supports the complete user booking workflow.
