-- ============================================================
-- HOTEL+ SUPABASE SCHEMA
-- Run this once in your Supabase project's SQL editor.
-- ============================================================

-- ------------------------------------------------------------
-- ROOMS
-- ------------------------------------------------------------
create table public.rooms (
  id text primary key,              -- 'standard' | 'deluxe' | 'suite'
  number text not null,
  name text not null,
  type text not null,
  price numeric(10,2) not null,
  currency text not null default '₱',
  capacity int not null,
  size text not null,
  bed text not null,
  image text not null,
  description text not null,
  amenities text[] not null default '{}',
  available boolean not null default true
);

insert into public.rooms (id, number, name, type, price, currency, capacity, size, bed, image, description, amenities, available) values
('standard','01','Standard Room','STANDARD',2500,'₱',2,'28 M²','Queen Bed','../assets/images/rooms/standard-room.png',
 'A comfortable retreat with all essential amenities for the modern traveler. Clean lines, warm lighting, and thoughtful touches create a space that feels both minimal and inviting.',
 array['Free Wi-Fi','Air Conditioning','Flat-screen TV','Mini Fridge','Hot Shower','Room Service'], true),
('deluxe','02','Deluxe Room','DELUXE',4500,'₱',2,'42 M²','King Bed','../assets/images/rooms/deluxe-room.png',
 'Elevated comfort with panoramic views of Cebu City and curated design details throughout. The Deluxe Room offers a generous living area and premium bathroom fixtures.',
 array['Free Wi-Fi','Air Conditioning','55" Smart TV','Mini Bar','Rain Shower','Room Service','City View','Workspace'], true),
('suite','03','Suite Room','SUITE',7500,'₱',4,'65 M²','King Bed + Sofa Bed','../assets/images/rooms/suite-room.png',
 'The ultimate expression of luxury — a private sanctuary with world-class amenities, a separate living area, and breathtaking views of the Cebu skyline.',
 array['Free Wi-Fi','Air Conditioning','65" Smart TV','Full Bar','Jacuzzi Tub','24/7 Butler','Skyline View','Living Room','Dining Area','Walk-in Closet'], true);

-- ------------------------------------------------------------
-- PROFILES — replaces the old plaintext hotelplus_users table.
-- Auth itself lives entirely in Supabase's built-in auth.users;
-- this table only stores the one extra bit auth.users doesn't
-- have: whether someone is an admin.
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false
);

-- Auto-create a profile row for every new signup.
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- BOOKINGS
-- ------------------------------------------------------------
create table public.bookings (
  id text primary key default ('HBS-' || upper(to_hex(floor(extract(epoch from clock_timestamp())*1000)::bigint))),
  user_id uuid references auth.users(id) on delete set null,  -- null = guest booking
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  room_type text not null references public.rooms(id),
  check_in date not null,
  check_out date not null,
  guests int not null default 1,
  total numeric(10,2) not null,
  status text not null default 'confirmed'
    check (status in ('confirmed','checked-in','cancelled','pending')),
  special_requests text,
  created_at timestamptz not null default now()
);

create index bookings_user_id_idx on public.bookings(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.profiles enable row level security;

-- ROOMS: public read
create policy "rooms are viewable by everyone"
  on public.rooms for select using (true);

-- PROFILES: a user can read their own row (client needs this to know if it's an admin)
create policy "users can read own profile"
  on public.profiles for select using (auth.uid() = id);

-- Helper used by the policies below.
create function public.is_admin() returns boolean as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$ language sql stable security definer;

-- BOOKINGS
create policy "anyone can create a booking (guest checkout allowed)"
  on public.bookings for insert
  with check (true);

create policy "users can view their own bookings"
  on public.bookings for select
  using (user_id = auth.uid());

create policy "users can update their own bookings"
  on public.bookings for update
  using (user_id = auth.uid());

create policy "admins can view all bookings"
  on public.bookings for select
  using (public.is_admin());

create policy "admins can update all bookings"
  on public.bookings for update
  using (public.is_admin());

create policy "admins can delete bookings"
  on public.bookings for delete
  using (public.is_admin());

-- ============================================================
-- To make your own account an admin, after you've signed up
-- once through the site, run:
--
--   update public.profiles set is_admin = true where id =
--     (select id from auth.users where email = 'you@example.com');
-- ============================================================
