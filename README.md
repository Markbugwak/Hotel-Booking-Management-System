# HOTEL+ — Hotel Booking Management System

A front-end hotel booking experience for a fictional Cebu City hotel: a
cinematic marketing homepage, a room catalog, a full reservation flow, and
an admin dashboard for managing incoming bookings.

**Live demo:** https://hotelcebu.netlify.app/

This is a static site (HTML/CSS/vanilla JS) with no backend — all
accounts and bookings are stored in the browser's `localStorage`. It's
built for demos, portfolios, and coursework rather than production use.
See **Limitations** below before treating it as a real booking system.

---

## Features

- **Marketing homepage** (`index.html`) with a quick-search booking form,
  room previews, and scroll-driven animations (GSAP + Lenis).
- **Room catalog** (`pages/rooms.html`) with full details for Standard,
  Deluxe, and Suite rooms.
- **Reservation flow** (`pages/booking.html` → `pages/confirmation.html`):
  pick dates and guests, enter guest details, and get a real booking
  reference plus a confirmation page.
- **Accounts** (`pages/login.html`): registration and login, with
  sessions persisted in `localStorage`. Logged-in guests get their name
  and email pre-filled at checkout.
- **Admin dashboard** (`pages/admin.html`): protected page (redirects
  anyone who isn't signed in as the admin), showing live stats,
  filterable/searchable reservations, booking detail + payment
  breakdown, CSV export, and demo data seeding.

## Project structure

```
index.html                 Homepage
pages/
  rooms.html                Room catalog & detail sections
  booking.html               Reservation form
  confirmation.html          Booking confirmation
  login.html                 Login + registration
  admin.html                  Admin dashboard (protected)
components/
  navbar.html, footer.html    Shared partials (footer is loaded via fetch;
                               navbar markup is inlined per page — see Notes)
css/
  style.css, animations.css, responsive.css
js/
  main.js                    App bootstrap, homepage search form
  navigation.js               Navbar scroll state & mobile menu
  animations.js                GSAP/Lenis animation setup
  rooms.js                    Room card interactions + room data helper
  booking.js                  Shared booking state, pricing, localStorage I/O
  auth.js                     Login / registration / session / admin guard
  auth-ui.js                   Syncs the navbar "LOGIN" link to session state
  components.js                Loads reusable HTML partials via fetch
data/
  rooms.json, bookings.json    Source-of-truth room catalog (bookings.json
                               is a static example — actual bookings live in
                               localStorage, not this file)
assets/                        Images and icons
```

## Running locally

This is a static site — no build step or dependencies. Because a couple
of pages `fetch()` local files (the footer partial, `data/rooms.json`),
opening `index.html` directly via `file://` will hit browser CORS
restrictions. Serve the folder instead, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

then visit `http://localhost:PORT/index.html`.

## Demo accounts

| Role  | Email                  | Password       |
|-------|-------------------------|----------------|
| Admin | `admin@hotelplus.com`   | `m0987654321`  |
| Guest | Register your own via **Login → Create Account** |

Guest accounts you register are stored in `localStorage` on your own
browser, so they won't appear for other visitors or persist across
different browsers/devices.

## How data is stored

Everything is client-side, keyed in `localStorage`:

- `hotelplus_users` — registered guest accounts (demo only — **passwords
  are stored in plain text**, see Limitations).
- `hotelplus_logged_in` / `hotelplus_user_email` / `hotelplus_user_role` /
  `hotelplus_user_name` — the current session.
- `hotel_bookings` — every reservation made through the booking flow;
  read by both the confirmation page and the admin dashboard.

Clearing your browser storage (or using a different browser/device)
resets all of the above.

## Limitations

This project intentionally has no server, database, or payment
processor, so:

- **Not secure.** Passwords are stored in plain text in `localStorage`
  and are visible to anyone with access to the browser's dev tools.
  Do not reuse a real password here.
- **Not multi-user.** Bookings and accounts live only in the browser
  that created them — there's no shared/central database.
- **No real availability checking.** Room types don't have a fixed
  inventory count, so double-bookings aren't prevented.
- **No real payments or emails.** "Confirmation emails" mentioned in the
  UI are simulated copy only.

These are natural next steps if this were turned into a production app
(a real backend + database, hashed passwords, server-side sessions,
inventory/availability logic, and a payment provider).
