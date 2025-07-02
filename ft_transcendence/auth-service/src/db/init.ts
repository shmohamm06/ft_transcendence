import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('/tmp/db.sqlite');

export const initializeDatabase = () => {
    db.serialize(() => {
        console.log('Initializing database...');

        // User table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                avatar TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

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
        `);

        // You can add more tables here later (e.g., friends, matches)

        console.log('Database initialized successfully.');
    });
};

export default db;
