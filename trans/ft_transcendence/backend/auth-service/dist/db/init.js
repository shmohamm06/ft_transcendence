"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// Use absolute path for database
const dbPath = path_1.default.join(__dirname, '../../db.sqlite');
console.log('Database path:', dbPath);
const db = new sqlite3_1.default.Database(dbPath, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    }
    else {
        console.log('Database connection opened successfully');
    }
});
const initializeDatabase = () => {
    db.serialize(() => {
        console.log('Initializing database...');
        // User table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT,
                avatar TEXT,
                intra_id INTEGER UNIQUE,
                intra_login TEXT UNIQUE,
                auth_provider TEXT DEFAULT 'local',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err)
                console.error('Error creating users table:', err);
            else
                console.log('Users table created/verified');
        });
        // Game Settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS game_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, key)
            )
        `, (err) => {
            if (err)
                console.error('Error creating game_settings table:', err);
            else
                console.log('Game_settings table created/verified');
        });
        // Add this inside db.serialize() in initializeDatabase
        db.run(`
            CREATE TABLE IF NOT EXISTS user_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                pong_wins INTEGER DEFAULT 0,
                pong_losses INTEGER DEFAULT 0,
                ttt_wins INTEGER DEFAULT 0,
                ttt_losses INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err)
                console.error('Error creating user_stats table:', err);
            else {
                console.log('User_stats table created/verified');
                // Ensure all existing users have stats records
                db.run(`
                    INSERT OR IGNORE INTO user_stats (user_id)
                    SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_stats)
                `, (statsErr) => {
                    if (statsErr) {
                        console.error('Error creating missing user_stats records:', statsErr);
                    }
                    else {
                        console.log('Missing user_stats records created for existing users');
                    }
                });
            }
        });
        // You can add more tables here later (e.g., friends, matches)
        console.log('Database initialized successfully.');
    });
};
exports.initializeDatabase = initializeDatabase;
exports.default = db;
//# sourceMappingURL=init.js.map