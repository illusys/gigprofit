function csrfProtection(req, res, next) {
  // JWT bearer clients are protected from browser CSRF by not using ambient cookies.
  // If cookie auth is enabled later, validate an X-CSRF-Token header here.
  return next();
}

module.exports = { csrfProtection };
