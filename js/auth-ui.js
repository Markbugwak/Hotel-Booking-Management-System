/* =========================================================
   AUTH-UI.JS — Keeps the navbar "LOGIN" link in sync with
   the current session on every page, and turns it into a
   working "LOGOUT" control once a user is signed in.
   ========================================================= */

(function () {
  'use strict';

  function applyAuthUI() {
    if (!window.HotelAuth) return;

    // Wait for the initial Supabase session check to resolve so we
    // don't briefly render a "logged out" navbar for a signed-in user.
    HotelAuth.ready.then(renderAuthUI);
  }

  function renderAuthUI() {
    var loggedIn = HotelAuth.isLoggedIn();
    var user = HotelAuth.getCurrentUser();

    var links = document.querySelectorAll('.navbar__login, .mobile-menu__login');

    links.forEach(function (link) {
      if (loggedIn) {
        var label = user.role === 'admin'
          ? 'LOGOUT (ADMIN)'
          : 'LOGOUT (' + (user.name ? user.name.split(' ')[0] : user.email.split('@')[0]).toUpperCase() + ')';

        var span = link.querySelector('span');
        if (span) {
          span.textContent = label;
        } else {
          link.textContent = label;
        }

        link.setAttribute('href', '#');
        link.setAttribute('data-auth-state', 'logged-in');
        link.onclick = function (e) {
          e.preventDefault();
          if (window.confirm('Log out of HOTEL+?')) {
            HotelAuth.logout();
          }
        };
      } else {
        link.setAttribute('data-auth-state', 'guest');
        link.onclick = null;
      }
    });
  }

  window.AuthUI = { apply: applyAuthUI };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAuthUI);
  } else {
    applyAuthUI();
  }

})();
