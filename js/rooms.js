/* ================================================== */
/* ROOMS.JS — Room Card Interactions                  */
/* ================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------ */
  /* ROOM DATA (mirrors data/rooms.json)              */
  /* ------------------------------------------------ */
  var roomsData = [
    {
      id: 'standard',
      name: 'Standard Room',
      type: 'STANDARD',
      price: 120,
      capacity: 2,
      size: '28 M²',
      image: 'assets/images/rooms/standard-room.png',
      description: 'A comfortable retreat with all essential amenities for the modern traveler.',
    },
    {
      id: 'deluxe',
      name: 'Deluxe Room',
      type: 'DELUXE',
      price: 220,
      capacity: 2,
      size: '42 M²',
      image: 'assets/images/rooms/deluxe-room.png',
      description: 'Elevated comfort with panoramic views and curated design details throughout.',
    },
    {
      id: 'suite',
      name: 'Suite Room',
      type: 'SUITE',
      price: 380,
      capacity: 4,
      size: '65 M²',
      image: 'assets/images/rooms/suite-room.png',
      description: 'The ultimate expression of luxury — a private sanctuary with world-class amenities.',
    },
  ];

  /* ------------------------------------------------ */
  /* ROOM CARD TILT EFFECT (Desktop Only)             */
  /* ------------------------------------------------ */
  function initRoomCardTilt() {
    var isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || prefersReducedMotion) return;

    var cards = document.querySelectorAll('.room-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;

        // Subtle tilt
        var tiltX = (y - 0.5) * 4; // degrees
        var tiltY = (x - 0.5) * -4;

        gsap.to(card, {
          rotationX: tiltX,
          rotationY: tiltY,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 1000,
          transformOrigin: 'center center',
        });
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.6,
          ease: 'power3.out',
        });
      });
    });
  }

  /* ------------------------------------------------ */
  /* ROOM CARD CLICK — TRANSITION EFFECT              */
  /* ------------------------------------------------ */
  function initRoomCardTransitions() {
    var cards = document.querySelectorAll('.room-card');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    cards.forEach(function (card) {
      var cta = card.querySelector('.room-card__cta');

      // Click on CTA to navigate with transition
      if (cta) {
        cta.addEventListener('click', function (e) {
          e.preventDefault();

          var href = cta.getAttribute('href');
          var image = card.querySelector('.room-card__image');
          var imageContainer = card.querySelector('.room-card__image-container');

          if (prefersReducedMotion) {
            window.location.href = href;
            return;
          }

          // Transition animation
          var tl = gsap.timeline({
            onComplete: function () {
              window.location.href = href;
            },
          });

          // Expand image to fill screen
          var rect = imageContainer.getBoundingClientRect();

          // Create overlay
          var overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:' + 'var(--bg)' + ';z-index:9998;opacity:0;';
          document.body.appendChild(overlay);

          tl.to(overlay, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.inOut',
          });

          tl.to(image, {
            scale: 1.3,
            duration: 0.5,
            ease: 'power2.in',
          }, 0);
        });
      }
    });
  }

  /* ------------------------------------------------ */
  /* GET ROOM DATA                                    */
  /* ------------------------------------------------ */
  function getRoomById(id) {
    return roomsData.find(function (room) {
      return room.id === id;
    });
  }

  function getAllRooms() {
    return roomsData;
  }

  /* ------------------------------------------------ */
  /* INIT                                             */
  /* ------------------------------------------------ */
  function initRooms() {
    initRoomCardTilt();
    initRoomCardTransitions();
  }

  /* ------------------------------------------------ */
  /* EXPORT                                           */
  /* ------------------------------------------------ */
  window.Rooms = {
    init: initRooms,
    getRoomById: getRoomById,
    getAllRooms: getAllRooms,
    data: roomsData,
  };

})();