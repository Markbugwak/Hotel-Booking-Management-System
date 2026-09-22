/* =========================================================
   HOTEL+ AUTHENTICATION SYSTEM
   Backed by Supabase Auth (auth.users + a small `profiles`
   table for the is_admin flag). Powers login, registration,
   session state and admin-page protection across every page.

   Public API is unchanged from the old localStorage version
   EXCEPT: login(), register() and protectAdminPage() now
   return Promises (they need a network round trip). isLoggedIn(),
   isAdmin() and getCurrentUser() stay synchronous, reading from
   an in-memory session cache kept in sync by Supabase's
   onAuthStateChange listener — but that cache isn't populated
   until the initial session check resolves, so anything that
   runs isLoggedIn()/isAdmin()/getCurrentUser() at page load
   should `await HotelAuth.ready` first.
   ========================================================= */

(function () {
  'use strict';

  var supabaseClient = window.supabaseClient;

  if (!supabaseClient) {
    console.error('HotelAuth: window.supabaseClient is not set. Make sure js/supabase-config.js loads before js/auth.js.');
  }

  // ========================================================
  // SESSION CACHE
  // ========================================================

  var currentSession = null;
  var currentProfile = null; // { is_admin }
  var readyResolve;
  var ready = new Promise(function (resolve) { readyResolve = resolve; });

  function refreshProfile() {
    if (!currentSession) {
      currentProfile = null;
      return Promise.resolve();
    }
    return supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', currentSession.user.id)
      .maybeSingle()
      .then(function (res) {
        currentProfile = res.data || null;
      })
      .catch(function () {
        currentProfile = null;
      });
  }

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(function (_event, session) {
      currentSession = session;
      refreshProfile().then(function () {
        if (readyResolve) { readyResolve(); readyResolve = null; }
        if (window.AuthUI && window.AuthUI.apply) window.AuthUI.apply();
      });
    });
  }


  // ========================================================
  // REGISTER
  // ========================================================

  function register(name, email, password) {
    name = String(name || '').trim();
    email = String(email || '').trim().toLowerCase();
    password = String(password || '').trim();

    if (!name || !email || !password) {
      return Promise.resolve({ success: false, message: 'Please fill in all required fields.' });
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return Promise.resolve({ success: false, message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return Promise.resolve({ success: false, message: 'Password must be at least 6 characters.' });
    }

    return supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: name } }
    }).then(function (res) {
      if (res.error) {
        return { success: false, message: res.error.message };
      }

      // If Supabase has "Confirm email" turned on, there is no
      // session yet at this point — the user has to verify first.
      if (!res.data.session) {
        return {
          success: true,
          role: 'user',
          message: 'Account created! Please check your email to confirm before signing in.',
          redirect: null
        };
      }

      return { success: true, role: 'user', redirect: '../index.html' };
    });
  }


  // ========================================================
  // LOGIN
  // ========================================================

  function login(email, password) {
    email = String(email || '').trim().toLowerCase();
    password = String(password || '').trim();

    if (!email || !password) {
      return Promise.resolve({ success: false, message: 'Please enter your email and password.' });
    }

    return supabaseClient.auth.signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) {
          return { success: false, message: 'Incorrect email or password. Please try again.' };
        }

        currentSession = res.data.session;

        return refreshProfile().then(function () {
          var isAdminFlag = !!(currentProfile && currentProfile.is_admin);
          return {
            success: true,
            role: isAdminFlag ? 'admin' : 'user',
            redirect: isAdminFlag ? 'admin.html' : '../index.html'
          };
        });
      });
  }


  // ========================================================
  // CHECK IF USER IS LOGGED IN
  // ========================================================

  function isLoggedIn() {
    return !!currentSession;
  }


  // ========================================================
  // CHECK IF CURRENT USER IS ADMIN
  // ========================================================

  function isAdmin() {
    return !!currentSession && !!(currentProfile && currentProfile.is_admin);
  }


  // ========================================================
  // GET CURRENT USER
  // ========================================================

  function getCurrentUser() {
    if (!currentSession) {
      return { email: '', role: '', name: '' };
    }
    var user = currentSession.user;
    var isAdminFlag = !!(currentProfile && currentProfile.is_admin);
    var fullName = (user.user_metadata && user.user_metadata.full_name) || '';
    return {
      email: user.email || '',
      role: isAdminFlag ? 'admin' : 'user',
      name: fullName || (user.email ? user.email.split('@')[0] : '')
    };
  }


  // ========================================================
  // LOGOUT
  // ========================================================

  function logout() {
    return supabaseClient.auth.signOut().then(function () {
      // Always send the user back to the site root, from either
      // a top-level page (index.html) or a /pages/ subpage.
      var inPagesDir = window.location.pathname.indexOf('/pages/') !== -1;
      window.location.href = inPagesDir ? '../index.html' : 'index.html';
    });
  }


  // ========================================================
  // PROTECT ADMIN PAGE
  // Async now: it has to wait for the initial session check
  // before it can know whether the visitor is an admin.
  // ========================================================

  function protectAdminPage() {
    return ready.then(function () {
      if (!isAdmin()) {
        window.location.replace('../index.html');
      }
    });
  }


  // ========================================================
  // EXPORT AUTH FUNCTIONS
  // ========================================================

  window.HotelAuth = {
    login: login,
    register: register,
    logout: logout,
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    getCurrentUser: getCurrentUser,
    protectAdminPage: protectAdminPage,
    ready: ready // await this before trusting isLoggedIn()/isAdmin()/getCurrentUser() on first paint
  };

})();
