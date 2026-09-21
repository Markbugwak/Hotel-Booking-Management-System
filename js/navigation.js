/* ================================================== */
/* NAVIGATION.JS — Navbar & Mobile Menu Logic         */
/* ================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------ */
  /* VARIABLES                                        */
  /* ------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  const mobileLogin = document.querySelector('.mobile-menu__login');
  const navLinks = document.querySelectorAll('.navbar__link');

  let isMenuOpen = false;
  let lastScrollY = 0;
  let scrollThreshold = 50;

  /* ------------------------------------------------ */
  /* SCROLL HANDLER — Navbar background + shrink      */
  /* ------------------------------------------------ */
  function handleNavbarScroll() {
    const currentY = window.scrollY;

    // Add scrolled class
    if (currentY > scrollThreshold) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }

    lastScrollY = currentY;
  }

  /* ------------------------------------------------ */
  /* MOBILE MENU TOGGLE                               */
  /* ------------------------------------------------ */
  function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  function openMenu() {
    isMenuOpen = true;
    mobileMenu.hidden = false;
    // Force reflow before adding class
    void mobileMenu.offsetHeight;
    mobileMenu.classList.add('is-open');
    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isMenuOpen = false;
    mobileMenu.classList.remove('is-open');
    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';

    // Hide after transition
    setTimeout(function () {
      if (!isMenuOpen) {
        mobileMenu.hidden = true;
      }
    }, 600);
  }

  /* ------------------------------------------------ */
  /* SMOOTH SCROLL TO SECTIONS                        */
  /* ------------------------------------------------ */
  function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (!target) return;

    const offsetTop = target.offsetTop - 80; // Account for navbar height

    // If Lenis exists, use it; otherwise use native
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(offsetTop, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  }

  function handleNavLinkClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      smoothScrollTo(href);
    }
  }

  function handleMobileLinkClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      closeMenu();
      // Delay scroll to let menu close
      setTimeout(function () {
        smoothScrollTo(href);
      }, 400);
    }
  }

  /* ------------------------------------------------ */
  /* KEYBOARD ACCESSIBILITY                           */
  /* ------------------------------------------------ */
  function handleMenuKeydown(e) {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
      menuToggle.focus();
    }
  }

  /* ------------------------------------------------ */
  /* INIT                                             */
  /* ------------------------------------------------ */
  function initNavigation() {
    // Scroll listener
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });

    // Mobile menu toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Mobile links
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', handleMobileLinkClick);
    });

    // Desktop links
    navLinks.forEach(function (link) {
      link.addEventListener('click', handleNavLinkClick);
    });

    // Footer back-to-top & any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          if (isMenuOpen) {
            closeMenu();
            setTimeout(function () {
              smoothScrollTo(href);
            }, 400);
          } else {
            smoothScrollTo(href);
          }
        }
      });
    });

    // Keyboard
    document.addEventListener('keydown', handleMenuKeydown);

    // Set initial state
    handleNavbarScroll();
  }

  /* ------------------------------------------------ */
  /* EXPORT                                           */
  /* ------------------------------------------------ */
  window.Navigation = {
    init: initNavigation,
    closeMenu: closeMenu,
  };

})();