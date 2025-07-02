import db from '../../db/init';
import { UpdateSettingsInput } from './settings.schema';

export async function getSettingsForUser(userId: number) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT key, value FROM game_settings WHERE user_id = ?';
        db.all(sql, [userId], (err: any, rows: any) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

export async function updateSettingsForUser(userId: number, settings: UpdateSettingsInput) {
    return new Promise<void>((resolve, reject) => {
        const sql = `
            INSERT INTO game_settings (user_id, key, value)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value;
        `;

        db.serialize(() => {
            const stmt = db.prepare(sql);
            try {
                db.run('BEGIN');
                for (const setting of settings) {
                    stmt.run(userId, setting.key, setting.value);
                }
                db.run('COMMIT', (err: any) => {
                    if (err) return reject(err);
                    resolve();
                });
            } catch (err) {
                db.run('ROLLBACK');
                reject(err);
            } finally {
                stmt.finalize();
            }
        });
    });
}
