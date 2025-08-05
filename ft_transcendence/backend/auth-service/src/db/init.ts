import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../db/db.sqlite');
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
            else {
                console.log('User_stats table created/verified');

                db.run(`
                    INSERT OR IGNORE INTO user_stats (user_id)
                    SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_stats)
                `, (statsErr) => {
                    if (statsErr) {
                        console.error('Error creating missing user_stats records:', statsErr);
                    } else {
                        console.log('Missing user_stats records created for existing users');
                    }
                });
            }
        });

        console.log('Database initialized successfully.');
    });
};

export default db;
