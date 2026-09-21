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

    // Store instance globally for navigation.js
    window.lenisInstance = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ------------------------------------------------ */
  /* BOOKING FORM — Basic Validation                  */
  /* ------------------------------------------------ */
  function initBookingForm() {
    var form = document.getElementById('bookingForm');
    if (!form) return;

    // Set minimum date to today
    var today = new Date().toISOString().split('T')[0];
    var checkInInput = document.getElementById('checkIn');
    var checkOutInput = document.getElementById('checkOut');

    if (checkInInput) {
      checkInInput.setAttribute('min', today);
      checkInInput.addEventListener('change', function () {
        // Set checkout minimum to day after check-in
        var checkInDate = new Date(checkInInput.value);
        checkInDate.setDate(checkInDate.getDate() + 1);
        var minCheckOut = checkInDate.toISOString().split('T')[0];
        checkOutInput.setAttribute('min', minCheckOut);

        // Clear checkout if it's before new minimum
        if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
          checkOutInput.value = '';
        }
      });
    }

    // Form submission
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
          // Reset after 2 seconds
          setTimeout(function () {
            field.style.borderColor = '';
          }, 2000);
        }
      });

      if (!isValid) {
        return;
      }

      // Validate dates
      if (checkIn && checkOut && checkOut <= checkIn) {
        checkOutInput.style.borderColor = '#E74C3C';
        setTimeout(function () {
          checkOutInput.style.borderColor = '';
        }, 2000);
        return;
      }

      // Success feedback
      var btn = form.querySelector('.btn--book');
      var btnText = btn.querySelector('.btn__text');
      var originalText = btnText.textContent;

      btnText.textContent = 'CHECKING...';

      setTimeout(function () {
        btnText.textContent = 'AVAILABLE ✓';
        btn.style.background = '#2ECC71';

        setTimeout(function () {
          btnText.textContent = originalText;
          btn.style.background = '';
          // In a real app, redirect to booking confirmation
          // window.location.href = 'pages/booking.html';
        }, 2000);
      }, 1500);
    });
  }

  /* ------------------------------------------------ */
  /* SCROLL PROGRESS (optional visual)                */
  /* ------------------------------------------------ */
  function initScrollProgress() {
    // Hide hero scroll indicator after scrolling
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
    // 1. Register GSAP plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 2. Init Lenis smooth scroll
    initLenis();

    // 3. Init navigation
    if (window.Navigation) {
      window.Navigation.init();
    }

    // 4. Init custom cursor
    if (window.Animations) {
      window.Animations.initCustomCursor();
    }

    // 5. Play loader, then reveal content
    if (window.Animations) {
      window.Animations.playLoader(function () {
        // After loader completes:

        // Animate hero entrance
        window.Animations.animateHero();

        // Init scroll-triggered animations
        window.Animations.initScrollAnimations();

        // Init hero mouse parallax
        window.Animations.initHeroMouseParallax();

        // Init room interactions
        if (window.Rooms) {
          window.Rooms.init();
        }

        // Init booking form
        initBookingForm();

        // Init scroll progress
        initScrollProgress();

        // Refresh ScrollTrigger after everything is loaded
        setTimeout(function () {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }, 500);
      });
    }
  }

  /* ------------------------------------------------ */
  /* WAIT FOR DOM                                     */
  /* ------------------------------------------------ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ------------------------------------------------ */
  /* HANDLE WINDOW RESIZE                             */
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
  /* HANDLE PAGE VISIBILITY (pause animations)        */
  /* ------------------------------------------------ */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (typeof gsap !== 'undefined') {
        gsap.globalTimeline.pause();
      }
    } else {
      if (typeof gsap !== 'undefined') {
        gsap.globalTimeline.resume();
      }
    }
  });

})();