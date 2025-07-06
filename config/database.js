const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, "../database.db"));
        this.init();
    }

    init() {
        // Create users table
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create media table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS media (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    filename TEXT NOT NULL,
                    original_name TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    thumbnail_path TEXT,
                    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);

            // Create default admin user if not exists
            const defaultPassword = bcrypt.hashSync("developedbyalpha", 10);
            
            this.db.run(`
                INSERT OR IGNORE INTO users (username, password_hash) 
                VALUES ("admin", ?)
            `, [defaultPassword], (err) => {
                if (err) {
                    console.error("Error creating default user:", err);
                } else {
                    console.log("Database initialized successfully");
                }
            });
        });
    }

    getDatabase() {
        return this.db;
    }

    close() {
        this.db.close();
    }
}

module.exports = new Database();