const express = require("express");
const session = require("express-session");
const path = require("path");
const database = require("./config/database");
const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT =  3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Session configuration
app.use(session({
    secret: "ALPHA_SECRET_URL", //CHANGE!!!
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));

// Session timeout control
app.use((req, res, next) => {
    if (req.session && req.session.userId) {
        const now = Date.now();
        const lastActive = req.session.lastActive || now;
        const inactivePeriod = now - lastActive;

        // 30 dakikadan fazla hareketsiz kaldıysa oturumu sonlandır
        if (inactivePeriod > 30 * 60 * 1000) {
            req.session.destroy(() => {
                return res.redirect('/login?error=Session expired due to inactivity');
            });
        } else {
            req.session.lastActive = now; // Update last activity time
            next();
        }
    } else {
        next();
    }
});

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", authRoutes);
app.use("/", mediaRoutes);

// Root route - redirect to dashboard if authenticated, otherwise to login
app.get("/", (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect("/dashboard");
    } else {
        res.redirect("/login");
    }
});

// Keep-alive endpoint to extend session
app.post('/keep-alive', (req, res) => {
    if (req.session && req.session.userId) {
        // Oturum süresini uzat
        req.session.touch(); // Oturumun son erişim zamanını günceller
        return res.status(200).send('Session kept alive');
    }
    return res.status(401).send('Unauthorized');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("login", { 
        error: "Something went wrong! Please try again." 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Secure Media Archive server running on http://localhost:${PORT}`);
    //You can also access from your phone with your IPv4 address. for example: 192.X.X.X:3000 address...
    console.log("Default login credentials:");
    console.log("Username: admin");
    console.log("Password: developedbyalpha");
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\nShutting down server...");
    database.close();
    process.exit(0);
});
