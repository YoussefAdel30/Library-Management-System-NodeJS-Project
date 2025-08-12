const rateLimit = require('express-rate-limit');

const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 5,                  // max 5 requests per 5 minutes
  message: "Too many checkout requests from this IP, please try again later."
});

const returnLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 10,                 // max 10 requests per 5 minutes
  message: "Too many return requests from this IP, please try again later."
});

module.exports = { checkoutLimiter, returnLimiter };
