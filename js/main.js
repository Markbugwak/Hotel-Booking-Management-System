/* ================================================== */
/* MAIN.JS — Application Entry Point                  */
/* ================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------ */
  /* LENIS SMOOTH SCROLLING                           */
  /* ------------------------------------------------ */
  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    window.lenisInstance = lenis;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ------------------------------------------------ */
  /* HOMEPAGE BOOKING FORM — REDIRECT TO BOOKING PAGE */
  /* ------------------------------------------------ */
  function initBookingForm() {
    var form = document.getElementById('bookingForm');
    if (!form) return;

    var today = new Date().toISOString().split('T')[0];
    var checkInInput = document.getElementById('checkIn');
    var checkOutInput = document.getElementById('checkOut');

    if (checkInInput) {
      checkInInput.setAttribute('min', today);
      checkInInput.addEventListener('change', function () {
        var checkInDate = new Date(checkInInput.value);
        checkInDate.setDate(checkInDate.getDate() + 1);
        var minCheckOut = checkInDate.toISOString().split('T')[0];
        if (checkOutInput) checkOutInput.setAttribute('min', minCheckOut);

        if (checkOutInput && checkOutInput.value && checkOutInput.value <= checkInInput.value) {
          checkOutInput.value = '';
        }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var checkIn = checkInInput ? checkInInput.value : '';
      var checkOut = checkOutInput ? checkOutInput.value : '';
      var guests = document.getElementById('guests') ? document.getElementById('guests').value : '';
      var roomType = document.getElementById('roomType') ? document.getElementById('roomType').value : '';

      // Basic validation
      var isValid = true;
      var fields = form.querySelectorAll('.booking__input[required]');

      fields.forEach(function (field) {
        if (!field.value) {
          isValid = false;
          field.style.borderColor = '#E74C3C';
          setTimeout(function () {
            field.style.borderColor = '';
          }, 2000);
        }
      });

      if (!isValid) return;

      if (checkIn && checkOut && checkOut <= checkIn) {
        if (checkOutInput) {
          checkOutInput.style.borderColor = '#E74C3C';
          setTimeout(function () {
            checkOutInput.style.borderColor = '';
          }, 2000);
        }
        return;
      }

      // Success feedback + redirect
      var btn = form.querySelector('.btn--book');
      var btnText = btn ? btn.querySelector('.btn__text') : null;
      var originalText = btnText ? btnText.textContent : '';

      if (btnText) btnText.textContent = 'REDIRECTING...';

      setTimeout(function () {
        // Redirect to full booking page with pre-filled params
        var targetUrl = 'pages/booking.html?' +
          'checkIn=' + encodeURIComponent(checkIn) +
          '&checkOut=' + encodeURIComponent(checkOut) +
          '&guests=' + encodeURIComponent(guests) +
          '&room=' + encodeURIComponent(roomType);
        window.location.href = targetUrl;
      }, 800);
    });
  }

  /* ------------------------------------------------ */
  /* SCROLL PROGRESS                                  */
  /* ------------------------------------------------ */
  function initScrollProgress() {
    var scrollIndicator = document.querySelector('.hero__scroll');
    if (!scrollIndicator) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 200) {
        gsap.to(scrollIndicator, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    }, { passive: true });
  }

  /* ------------------------------------------------ */
  /* APPLICATION INIT                                 */
  /* ------------------------------------------------ */
  function init() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    initLenis();

    if (window.Navigation) {
      window.Navigation.init();
    }

    if (window.Animations) {
      window.Animations.initCustomCursor();
    }

    if (window.Animations) {
      window.Animations.playLoader(function () {
        window.Animations.animateHero();
        window.Animations.initScrollAnimations();
        window.Animations.initHeroMouseParallax();

        if (window.Rooms) {
          window.Rooms.init();
        }

        initBookingForm();
        initScrollProgress();

        setTimeout(function () {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }, 500);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ------------------------------------------------ */
  /* SCROLLTRIGGER SYNC AFTER IMAGES LOAD             */
  /* ------------------------------------------------ */
  window.addEventListener('load', function () {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  /* ------------------------------------------------ */
  /* WINDOW RESIZE                                    */
  /* ------------------------------------------------ */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 250);
  });

  /* ------------------------------------------------ */
  /* PAGE VISIBILITY (pause animations)               */
  /* ------------------------------------------------ */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (typeof gsap !== 'undefined') gsap.globalTimeline.pause();
    } else {
      if (typeof gsap !== 'undefined') gsap.globalTimeline.resume();
    }
  });

})();