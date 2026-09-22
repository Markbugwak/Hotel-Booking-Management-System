/* ================================================== */
/* ANIMATIONS.JS — GSAP ScrollTrigger Animations      */
/* ================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------ */
  /* REDUCED MOTION CHECK                             */
  /* ------------------------------------------------ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------ */
  /* LOADING SCREEN ANIMATION                         */
  /* ------------------------------------------------ */
  function playLoader(onComplete) {
    if (prefersReducedMotion) {
      // Skip loader
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.display = 'none';
        loader.classList.add('is-hidden');
      }
      if (onComplete) onComplete();
      return;
    }

    const loader = document.getElementById('loader');
    const loaderLogo = document.querySelector('.loader__logo');
    const loaderSub = document.querySelector('.loader__sub');
    const loaderProgress = document.querySelector('.loader__progress');
    const loaderBar = document.querySelector('.loader__progress-bar');
    const loaderCounter = document.querySelector('.loader__counter');

    if (!loader) {
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: function () {
        // Fade out loader
        gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: function () {
            loader.classList.add('is-hidden');
            loader.style.display = 'none';
            if (onComplete) onComplete();
          },
        });
      },
    });

    // Counter animation
    var counterObj = { val: 0 };

    tl.to(loaderLogo, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    })
    .to(loaderLogo, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
    .to(loaderLogo, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.inOut',
    })
    .to(loaderSub, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power3.out',
    }, '-=0.3')
    .to(loaderProgress, {
      opacity: 1,
      duration: 0.3,
    }, '-=0.2')
    .to(loaderCounter, {
      opacity: 1,
      duration: 0.3,
    }, '-=0.3')
    .to(loaderBar, {
      width: '100%',
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: function () {
        var progress = Math.round(this.progress() * 100);
        loaderCounter.textContent = progress + '%';
      },
    }, '-=0.2')
    .to({}, { duration: 0.2 }); // Small pause before exit
  }

  /* ------------------------------------------------ */
  /* HERO ANIMATIONS                                  */
  /* ------------------------------------------------ */
  function animateHero() {
    if (prefersReducedMotion) return;

    var tl = gsap.timeline({ delay: 0.1 });

    // Navbar reveal
    tl.to('.navbar', {
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Hero image zoom in
    tl.to('.hero__image', {
      scale: 1,
      duration: 1.8,
      ease: 'power2.out',
    }, '-=0.5');

    // Headline lines reveal
    tl.to('.hero__line--1', {
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=1.2');

    tl.to('.hero__line--2', {
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.8');

    // Subtitle
    tl.to('.hero__subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.6');

    // CTAs
    tl.to('.hero__ctas', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.5');

    // Floating details
    tl.to('.hero__detail', {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.15,
    }, '-=0.5');

    // Scroll indicator
    tl.to('.hero__scroll', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.3');

    // Section number
    tl.to('.hero__section-number', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.5');
  }

  /* ------------------------------------------------ */
  /* HERO PARALLAX ON SCROLL                          */
  /* ------------------------------------------------ */
  function heroScrollParallax() {
    if (prefersReducedMotion) return;

    gsap.to('.hero__image-inner', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Fade hero content on scroll
    gsap.to('.hero__content', {
      opacity: 0,
      y: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: '30% top',
        end: '80% top',
        scrub: true,
      },
    });
  }

  /* ------------------------------------------------ */
  /* STORY SECTION ANIMATIONS                         */
  /* ------------------------------------------------ */
  function animateStory() {
    if (prefersReducedMotion) return;

    // Section number
    gsap.from('.story__number', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: '.story',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Headline lines
    gsap.from('.story__line', {
      y: '100%',
      duration: 1,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.story__headline',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Description
    gsap.from('.story__description', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.story__description',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Meta items
    gsap.to('.story__meta-item', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.story__meta',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Image reveal — clip path
    gsap.from('.story__image-reveal', {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: '.story__image-container',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    // Image scale
    gsap.to('.story__image', {
      scale: 1,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.story__image-container',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    // Image parallax on scroll
    gsap.to('.story__image', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.story__image-container',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Caption
    gsap.from('.story__image-caption', {
      opacity: 0,
      y: 15,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.story__image-caption',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ------------------------------------------------ */
  /* EXPERIENCE SECTION ANIMATIONS                    */
  /* ------------------------------------------------ */
  function animateExperience() {
    if (prefersReducedMotion) return;

    // Number
    gsap.from('.experience__number', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: '.experience',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Headline
    gsap.from('.experience__line', {
      y: '100%',
      duration: 1,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.experience__headline',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Image scale on scroll
    gsap.from('.experience__image', {
      scale: 1.2,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.experience__image-container',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Image parallax
    gsap.to('.experience__image', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.experience__image-container',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Description
    gsap.from('.experience__description', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.experience__content',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Features
    gsap.to('.experience__feature', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.experience__features',
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ------------------------------------------------ */
  /* ROOMS SECTION ANIMATIONS                         */
  /* ------------------------------------------------ */
  function animateRooms() {
    if (prefersReducedMotion) return;

    // Number
    gsap.from('.rooms__number', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: '.rooms',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Headline
    gsap.from('.rooms__line', {
      y: '100%',
      duration: 1,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.rooms__headline',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Room cards stagger
    gsap.to('.room-card', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.rooms__grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ------------------------------------------------ */
  /* BOOKING SECTION ANIMATIONS                       */
  /* ------------------------------------------------ */
  function animateBooking() {
    if (prefersReducedMotion) return;

    // Number
    gsap.from('.booking__number', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: '.booking',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Headline
    gsap.from('.booking__line', {
      y: '100%',
      duration: 1,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.booking__headline',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Form fields stagger
    gsap.to('.booking__field', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.booking__fields',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Button
    gsap.from('.btn--book', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.btn--book',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ------------------------------------------------ */
  /* FOOTER ANIMATIONS                                */
  /* ------------------------------------------------ */
  function animateFooter() {
    if (prefersReducedMotion) return;

    gsap.to('.footer__top', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    gsap.to('.footer__bottom', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.footer__divider',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ------------------------------------------------ */
  /* HERO MOUSE PARALLAX                              */
  /* ------------------------------------------------ */
  function initHeroMouseParallax() {
    if (prefersReducedMotion) return;

    var isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isMobile) return;

    var heroSection = document.getElementById('hero');
    var heroImageInner = document.getElementById('heroImageInner');
    var heroDetail1 = document.getElementById('heroDetail1');
    var heroDetail2 = document.getElementById('heroDetail2');
    var heroDetail3 = document.getElementById('heroDetail3');

    if (!heroSection || !heroImageInner) return;

    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      // Image movement (low intensity)
      gsap.to(heroImageInner, {
        x: x * 20,
        y: y * 15,
        duration: 1,
        ease: 'power2.out',
      });

      // Floating details parallax
      if (heroDetail1) {
        gsap.to(heroDetail1, { x: x * -10, y: y * -8, duration: 1.2, ease: 'power2.out' });
      }
      if (heroDetail2) {
        gsap.to(heroDetail2, { x: x * -15, y: y * -12, duration: 1.2, ease: 'power2.out' });
      }
      if (heroDetail3) {
        gsap.to(heroDetail3, { x: x * -8, y: y * -6, duration: 1.2, ease: 'power2.out' });
      }
    });
  }

  /* ------------------------------------------------ */
  /* CUSTOM CURSOR                                    */
  /* ------------------------------------------------ */
  function initCustomCursor() {
    var isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isMobile || prefersReducedMotion) return;

    var cursor = document.getElementById('cursor');
    var cursorDot = cursor.querySelector('.cursor-dot');
    var cursorRing = cursor.querySelector('.cursor-ring');
    var cursorLabel = cursor.querySelector('.cursor-label');

    if (!cursor) return;

    var mouseX = 0;
    var mouseY = 0;
    var cursorX = 0;
    var cursorY = 0;
    var ringX = 0;
    var ringY = 0;

    // Track mouse position
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Animation loop
    function updateCursor() {
      // Dot follows exactly
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;

      // Ring follows with more lag
      ringX += (mouseX - ringX) * 0.08;
      ringY += (mouseY - ringY) * 0.08;

      cursorDot.style.transform = 'translate(' + cursorX + 'px, ' + cursorY + 'px)';
      cursorRing.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px)';
      cursorLabel.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px)';

      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Interactive elements
    var interactiveElements = document.querySelectorAll('[data-cursor]');

    interactiveElements.forEach(function (el) {
      var type = el.getAttribute('data-cursor');

      el.addEventListener('mouseenter', function () {
        cursor.className = 'custom-cursor is-' + type;
        if (type === 'view') {
          cursorLabel.textContent = 'VIEW';
        }
      });

      el.addEventListener('mouseleave', function () {
        cursor.className = 'custom-cursor';
        cursorLabel.textContent = '';
      });
    });

    // Also handle generic links and buttons
    document.querySelectorAll('a:not([data-cursor]), button:not([data-cursor])').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('is-link');
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('is-link');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', function () {
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
    });

    document.addEventListener('mouseenter', function () {
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    });
  }

  /* ------------------------------------------------ */
  /* REGISTER GSAP PLUGINS                            */
  /* ------------------------------------------------ */
  function registerPlugins() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  /* ------------------------------------------------ */
  /* INIT ALL SCROLL ANIMATIONS                       */
  /* ------------------------------------------------ */
  function initScrollAnimations() {
    registerPlugins();
    heroScrollParallax();
    animateStory();
    animateExperience();
    animateRooms();
    animateBooking();
    animateFooter();
  }

  /* ------------------------------------------------ */
  /* EXPORT                                           */
  /* ------------------------------------------------ */
  window.Animations = {
    playLoader: playLoader,
    animateHero: animateHero,
    initScrollAnimations: initScrollAnimations,
    initHeroMouseParallax: initHeroMouseParallax,
    initCustomCursor: initCustomCursor,
    registerPlugins: registerPlugins,
  };

})();