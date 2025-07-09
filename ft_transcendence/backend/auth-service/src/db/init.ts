import sqlite3 from 'sqlite3';
import path from 'path';

// Используем абсолютный путь для базы данных
const dbPath = path.join(__dirname, '../../db.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connection opened successfully');
    }
});

export const initializeDatabase = () => {
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
            if (err) console.error('Error creating users table:', err);
            else console.log('Users table created/verified');
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
            if (err) console.error('Error creating game_settings table:', err);
            else console.log('Game_settings table created/verified');
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
            if (err) console.error('Error creating user_stats table:', err);
            else console.log('User_stats table created/verified');
        });

        // You can add more tables here later (e.g., friends, matches)

        console.log('Database initialized successfully.');
    });
};

export default db;
