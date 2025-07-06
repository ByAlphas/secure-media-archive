const express = require("express");
const bcrypt = require("bcryptjs");
const database = require("../config/database");
const { redirectIfAuthenticated } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const db = database.getDatabase();

// Rate limiter for login attempts
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes."
});

// Login page
router.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login", { error: null });
});

// Login POST
router.post("/login", loginRateLimiter, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render("login", { error: "Username and password are required" });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.render("login", { error: "Database error" });
        }

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.render("login", { error: "Invalid username or password" });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect("/dashboard");
    });
});

// Logout
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/dashboard");
        }
        res.redirect("/login");
    });
});

module.exports = router;
