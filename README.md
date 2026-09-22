# HOTEL+ — Hotel Booking Management System

A front-end hotel booking experience for a fictional Cebu City hotel: a
cinematic marketing homepage, a room catalog, a full reservation flow, and
an admin dashboard for managing incoming bookings.

**Live demo:** https://hotelcebu.netlify.app/

This is a static site (HTML/CSS/vanilla JS, no build step) backed by
[Supabase](https://supabase.com) — Postgres for data, Supabase Auth for
accounts, and Row Level Security for access control. There's no custom
server; the browser talks to Supabase directly via the `supabase-js` CDN
client.

---

## Features

- **Marketing homepage** (`index.html`) with a quick-search booking form,
  room previews, and scroll-driven animations (GSAP + Lenis).
- **Room catalog** (`pages/rooms.html`) with full details for Standard,
  Deluxe, and Suite rooms, sourced from the `rooms` table.
- **Reservation flow** (`pages/booking.html` → `pages/confirmation.html`):
  pick dates and guests, enter guest details, and get a real booking
  reference plus a confirmation page. Works for both guests (no account
  needed) and signed-in users.
- **Accounts** (`pages/login.html`): registration and login via Supabase
  Auth. Logged-in guests get their name and email pre-filled at
  checkout, and can see their own past bookings.
- **Admin dashboard** (`pages/admin.html`): protected page (redirects
  anyone who isn't signed in as an admin), showing live stats,
  filterable/searchable reservations, booking detail + payment
  breakdown, CSV export, cancel/update actions, and demo data seeding —
  all reading and writing real rows in Supabase.

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
  rooms.js                    Room card interactions + local room display data
  booking.js                  Booking state, pricing, and Supabase `bookings`/
                               `rooms` I/O (saveBooking, getBookings, etc.)
  auth.js                     Supabase Auth wrapper — login / registration /
                               session / admin guard
  auth-ui.js                   Syncs the navbar "LOGIN" link to session state
  components.js                Loads reusable HTML partials via fetch
  supabase-config.js           Supabase project URL + anon key — plug your
                               own project's values in here
database/
  supabase-schema.sql          Full schema (rooms, profiles, bookings) +
                               Row Level Security policies. Run once in the
                               Supabase SQL editor to set up a new project.
assets/                        Images and icons
```

## Running locally

This is a static site — no build step or npm dependencies. Because a
couple of pages `fetch()` local files (the footer partial), opening
`index.html` directly via `file://` will hit browser CORS restrictions.
Serve the folder instead, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

then visit `http://localhost:PORT/index.html`.

### Backend setup (required)

The front end expects a Supabase project behind it:

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run `database/supabase-schema.sql` — this
   creates the `rooms`, `profiles`, and `bookings` tables, seeds the
   three rooms, and sets up Row Level Security.
3. In **Project Settings → API**, copy your **Project URL** and
   **anon/public key** into `js/supabase-config.js`:
   ```js
   var SUPABASE_URL = 'https://your-project-ref.supabase.co';
   var SUPABASE_ANON_KEY = 'your-anon-public-key';
   ```
4. To make an account an admin, sign up through `pages/login.html`,
   then run in the SQL Editor:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```

The anon key is safe to commit/expose client-side — it has no power
beyond what the RLS policies in `supabase-schema.sql` grant.

## Demo accounts

| Role  | Email                  | Password       |
|-------|-------------------------|----------------|
| Guest | Register your own via **Login → Create Account** |
| Admin | Register, then promote your account via the SQL snippet above |

Accounts are real Supabase Auth users shared across anyone using the
deployed site — unlike a purely local demo, these persist across
browsers and devices.

## How data is stored

Everything lives in Postgres, via Supabase:

- **`auth.users`** — accounts and credentials, managed entirely by
  Supabase Auth (passwords are hashed, not stored in plain text).
- **`public.profiles`** — one row per user, holding just the `is_admin`
  flag used to gate the dashboard.
- **`public.rooms`** — the three room types (Standard/Deluxe/Suite) and
  their details.
- **`public.bookings`** — every reservation, with `user_id` set for
  signed-in bookings and left `null` for guest checkouts.

Row Level Security enforces who can read/write what: anyone can browse
rooms and create a booking, a signed-in user can only see/update their
own bookings, and only accounts with `is_admin = true` can see, update,
or delete every booking.

## Limitations

- **No real availability checking.** Room types don't have a fixed
  inventory count, so double-bookings aren't prevented at the database
  level.
- **No real payments or emails.** "Confirmation emails" mentioned in the
  UI are simulated copy only — no email provider is wired up.
- **Email confirmation is configurable, not enforced by the app.**
  Whether new signups need to verify their email before signing in is a
  toggle in the Supabase dashboard (Authentication → Providers → Email),
  not something the front end decides.

Natural next steps for a production version: real availability/
inventory logic, a payment provider integration, and transactional
email (e.g. via a Supabase Edge Function or a service like Resend).
