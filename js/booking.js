/* ================================================== */
/* BOOKING.JS — Booking Logic & State Management      */
/* Backed by the Supabase `bookings` / `rooms` tables. */
/*                                                      */
/* Public API is unchanged EXCEPT: saveBooking,         */
/* getBookings, getBookingById and loadRoomsData now    */
/* return Promises (they're network calls now instead   */
/* of synchronous localStorage reads). calculatePrice    */
/* and formatPrice stay synchronous — they don't touch   */
/* the network.                                          */
/* ================================================== */

(function () {
  'use strict';

  var supabaseClient = window.supabaseClient;

  if (!supabaseClient) {
    console.error('Booking: window.supabaseClient is not set. Make sure js/supabase-config.js loads before js/booking.js.');
  }

  /* ------------------------------------------------ */
  /* STATE                                            */
  /* ------------------------------------------------ */
  var bookingState = {
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: '',
    roomData: null,
    totalPrice: 0,
    nights: 0,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  };

  /* ------------------------------------------------ */
  /* ROW <-> APP OBJECT MAPPING                       */
  /* ------------------------------------------------ */
  function mapRow(row) {
    return {
      id: row.id,
      guestName: row.guest_name,
      guestEmail: row.guest_email,
      guestPhone: row.guest_phone,
      roomType: row.room_type,
      checkIn: row.check_in,
      checkOut: row.check_out,
      guests: row.guests,
      total: Number(row.total),
      status: row.status,
      specialRequests: row.special_requests,
      createdAt: row.created_at,
    };
  }

  /* ------------------------------------------------ */
  /* SUPABASE-BACKED BOOKING CRUD                     */
  /* ------------------------------------------------ */
  function createBookingId() {
    return 'HBS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function saveBooking(booking) {
    return supabaseClient.auth.getSession().then(function (sessionRes) {
      var session = sessionRes.data && sessionRes.data.session;

      var row = {
        id: createBookingId(),
        user_id: session ? session.user.id : null,
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        guest_phone: booking.guestPhone,
        room_type: booking.roomType,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests: booking.guests,
        total: booking.total,
        status: booking.status || 'confirmed',
        special_requests: booking.specialRequests,
      };

      return supabaseClient.from('bookings').insert(row).then(function (res) {
        if (res.error) throw res.error;
        return { data: row };
      });
    }).then(function (res) {
      return mapRow(res.data);
    });
  }

  // Returns every booking the signed-in visitor is allowed to see:
  // an admin gets ALL bookings, a signed-in guest gets only their
  // own, a logged-out visitor gets none. RLS enforces this
  // server-side — this function doesn't need to know who's asking.
  function getBookings() {
    return supabaseClient
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data || []).map(mapRow);
      });
  }

  function getBookingById(id) {
    return supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data ? mapRow(res.data) : null;
      });
  }

  // Used by the admin dashboard to cancel/update a reservation's
  // status. Only succeeds for rows RLS allows this user to update
  // (their own booking, or any booking if they're an admin).
  function updateBookingStatus(id, status) {
    return supabaseClient
      .from('bookings')
      .update({ status: status })
      .eq('id', id)
      .select()
      .single()
      .then(function (res) {
        if (res.error) throw res.error;
        return mapRow(res.data);
      });
  }

  // Used by the admin dashboard's "Clear All" action. Only an
  // admin's RLS policy permits this to actually delete anything.
  function deleteAllBookings() {
    return supabaseClient
      .from('bookings')
      .delete()
      .not('id', 'is', null)
      .then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
  }

  /* ------------------------------------------------ */
  /* PRICE CALCULATION (no network call — unchanged)  */
  /* ------------------------------------------------ */
  function calculatePrice(roomType, checkIn, checkOut) {
    var prices = {
      standard: 2500,
      deluxe: 4500,
      suite: 7500,
    };

    var pricePerNight = prices[roomType] || 0;

    if (!checkIn || !checkOut) {
      return { nights: 0, total: 0, perNight: pricePerNight };
    }

    var dateIn = new Date(checkIn);
    var dateOut = new Date(checkOut);
    var diffTime = Math.abs(dateOut - dateIn);
    var nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights < 1) nights = 1;

    return {
      nights: nights,
      total: nights * pricePerNight,
      perNight: pricePerNight,
    };
  }

  function formatPrice(amount) {
    return '₱' + amount.toLocaleString('en-PH');
  }

  /* ------------------------------------------------ */
  /* ROOM DATA LOADER — now reads the `rooms` table   */
  /* ------------------------------------------------ */
  function loadRoomsData() {
    return supabaseClient
      .from('rooms')
      .select('*')
      .order('number')
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) {
          // Fallback data if the table can't be reached
          return [
            { id: 'standard', name: 'Standard Room', price: 2500, currency: '₱' },
            { id: 'deluxe', name: 'Deluxe Room', price: 4500, currency: '₱' },
            { id: 'suite', name: 'Suite Room', price: 7500, currency: '₱' },
          ];
        }
        return res.data;
      });
  }

  /* ------------------------------------------------ */
  /* UPDATE STATE                                     */
  /* ------------------------------------------------ */
  function updateState(key, value) {
    bookingState[key] = value;
  }

  function getState() {
    return Object.assign({}, bookingState);
  }

  /* ------------------------------------------------ */
  /* EXPORT                                           */
  /* ------------------------------------------------ */
  window.Booking = {
    saveBooking: saveBooking,
    getBookings: getBookings,
    getBookingById: getBookingById,
    updateBookingStatus: updateBookingStatus,
    deleteAllBookings: deleteAllBookings,
    calculatePrice: calculatePrice,
    formatPrice: formatPrice,
    loadRoomsData: loadRoomsData,
    updateState: updateState,
    getState: getState,
    state: bookingState,
  };

})();
