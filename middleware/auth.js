const rateLimit = require("express-rate-limit");

// User authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect("/login");
    }
};

// Redirect middleware if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect("/dashboard");
    } else {
        return next();
    }
};

// Brute force rate limit
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // Her IP için 5 istek
    message: "Too many login attempts from this IP, please try again after 15 minutes."
});

module.exports = {
    requireAuth,
    redirectIfAuthenticated,
    loginRateLimiter
};
