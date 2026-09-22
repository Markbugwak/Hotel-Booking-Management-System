/* ================================================== */
/* COMPONENTS.JS — Load Reusable HTML Partials        */
/* ================================================== */

(function () {
  'use strict';

  /**
   * Fetches an HTML component file and injects it into a target element.
   * @param {string} selector - CSS selector of the target container
   * @param {string} filePath - Path to the HTML component file
   * @returns {Promise}
   */
  function loadComponent(selector, filePath) {
    var target = document.querySelector(selector);
    if (!target) return Promise.resolve();

    return fetch(filePath)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Component not found: ' + filePath);
        }
        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
      })
      .catch(function (err) {
        console.warn('Component load failed:', err.message);
      });
  }

  /**
   * Load all components marked with data-component attributes.
   * Usage in HTML: <div data-component="components/navbar.html"></div>
   */
  function loadAllComponents() {
    var components = document.querySelectorAll('[data-component]');
    var promises = [];

    components.forEach(function (el) {
      var path = el.getAttribute('data-component');
      if (path) {
        promises.push(
          fetch(path)
            .then(function (res) { return res.text(); })
            .then(function (html) { el.innerHTML = html; })
            .catch(function (err) { console.warn('Failed to load:', path, err); })
        );
      }
    });

    return Promise.all(promises);
  }

  /* ------------------------------------------------ */
  /* EXPORT                                           */
  /* ------------------------------------------------ */
  window.Components = {
    load: loadComponent,
    loadAll: loadAllComponents,
  };

})();