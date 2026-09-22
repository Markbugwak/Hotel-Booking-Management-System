/* =========================================================
   SUPABASE CONFIG
   Fill in your own project's URL and anon (public) key below.
   Both are found in Supabase Dashboard → Project Settings → API.
   The anon key is safe to ship in client-side code — it has no
   power beyond what your Row Level Security policies allow.
   ========================================================= */

(function () {
  'use strict';

  var SUPABASE_URL = 'https://fglzlrnsxbfcdikqoawx.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_cKa21Q3lMy59q7delP2HmA_4pfnm-q4';

  if (!window.supabase) {
    console.error('Supabase JS library not loaded — check that the CDN <script> tag is included before supabase-config.js.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
