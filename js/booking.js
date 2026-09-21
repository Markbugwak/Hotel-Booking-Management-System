/* ================================================== */
/* BOOKING.JS — Booking Logic & State Management      */
/* ================================================== */

(function () {
  'use strict';

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
  /* LOCAL STORAGE HELPERS                            */
  /* ------------------------------------------------ */
  function saveBooking(booking) {
    var bookings = getBookings();
    booking.id = 'HBS-' + Date.now().toString(36).toUpperCase();
    booking.createdAt = new Date().toISOString();
    bookings.push(booking);
    localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
    return booking;
  }

  function getBookings() {
    var data = localStorage.getItem('hotel_bookings');
    return data ? JSON.parse(data) : [];
  }

  function getBookingById(id) {
    var bookings = getBookings();
    return bookings.find(function (b) { return b.id === id; });
  }

  /* ------------------------------------------------ */
  /* PRICE CALCULATION                                */
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
  /* ROOM DATA LOADER                                 */
  /* ------------------------------------------------ */
  function loadRoomsData() {
    return fetch('../data/rooms.json')
      .then(function (res) { return res.json(); })
      .then(function (data) { return data.rooms; })
      .catch(function () {
        // Fallback data if JSON fails to load
        return [
          { id: 'standard', name: 'Standard Room', price: 2500, currency: '₱' },
          { id: 'deluxe', name: 'Deluxe Room', price: 4500, currency: '₱' },
          { id: 'suite', name: 'Suite Room', price: 7500, currency: '₱' },
        ];
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
    calculatePrice: calculatePrice,
    formatPrice: formatPrice,
    loadRoomsData: loadRoomsData,
    updateState: updateState,
    getState: getState,
    state: bookingState,
  };

})();