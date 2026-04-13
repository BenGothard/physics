/**
 * router.js — Hash-based SPA router for PhysicsQuest
 *
 * Supports parameterised routes (e.g. #/courses/:courseId/:unitId),
 * a default redirect, and declarative route registration.
 */

class Router {
  constructor(containerSelector = '#app') {
    /** @type {Array<{pattern: string, parts: string[], handler: Function}>} */
    this._routes = [];
    this._container = null;
    this._containerSelector = containerSelector;
    this._notFoundHandler = null;
    this._beforeEach = null;
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * Register a route.
   * @param {string} pattern  Hash pattern, e.g. "#/courses/:courseId/:unitId"
   * @param {Function} handler  (params) => string|void — return HTML or render manually
   * @returns {Router} for chaining
   */
  on(pattern, handler) {
    const normalised = this._normalise(pattern);
    this._routes.push({
      pattern: normalised,
      parts: normalised.split('/').filter(Boolean),
      handler,
    });
    return this;
  }

  /**
   * Register a handler shown when no route matches.
   * @param {Function} handler
   * @returns {Router}
   */
  notFound(handler) {
    this._notFoundHandler = handler;
    return this;
  }

  /**
   * Register a guard that runs before every route transition.
   * Return `false` to cancel navigation.
   * @param {Function} guard  (path, params) => boolean
   * @returns {Router}
   */
  beforeEach(guard) {
    this._beforeEach = guard;
    return this;
  }

  /**
   * Programmatic navigation.
   * @param {string} hash  e.g. "#/courses/mechanics" or "/courses/mechanics"
   */
  navigate(hash) {
    window.location.hash = hash.startsWith('#') ? hash : `#${hash}`;
  }

  /**
   * Start the router — resolve the container, attach the hashchange
   * listener, and handle the initial URL.
   */
  init() {
    this._container = document.querySelector(this._containerSelector);
    if (!this._container) {
      throw new Error(`Router: container "${this._containerSelector}" not found in DOM`);
    }

    window.addEventListener('hashchange', () => this._resolve());

    // Default route redirect when no hash is present
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/';
    } else {
      this._resolve();
    }
  }

  /**
   * Return the current hash path (without the leading #).
   * @returns {string}
   */
  get currentPath() {
    return this._normalise(window.location.hash);
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Normalise a hash string to a clean path.
   *  "#/foo/bar" → "/foo/bar"
   *  "foo/bar"   → "/foo/bar"
   */
  _normalise(hash) {
    let path = hash.replace(/^#\/?/, '/');
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }

  /**
   * Match the current hash against registered routes and invoke the
   * appropriate handler.
   */
  _resolve() {
    const path = this.currentPath;
    const pathParts = path.split('/').filter(Boolean);

    for (const route of this._routes) {
      const params = this._match(route.parts, pathParts);
      if (params !== null) {
        // Run guard
        if (this._beforeEach && this._beforeEach(path, params) === false) {
          return;
        }
        this._invoke(route.handler, params);
        return;
      }
    }

    // No match — try not-found handler
    if (this._notFoundHandler) {
      this._invoke(this._notFoundHandler, {});
    }
  }

  /**
   * Try to match route parts against URL parts.
   * Returns a params object on success, or null.
   */
  _match(routeParts, pathParts) {
    if (routeParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (routeParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  /**
   * Call a handler, and if it returns HTML, inject it into the container.
   */
  _invoke(handler, params) {
    const result = handler(params, this._container);
    if (typeof result === 'string') {
      this._container.innerHTML = result;
    }
  }
}

export { Router };
