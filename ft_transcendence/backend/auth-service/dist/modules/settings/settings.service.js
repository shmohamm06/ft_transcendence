"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsForUser = getSettingsForUser;
exports.updateSettingsForUser = updateSettingsForUser;
const init_1 = __importDefault(require("../../db/init"));
async function getSettingsForUser(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT key, value FROM game_settings WHERE user_id = ?';
        init_1.default.all(sql, [userId], (err, rows) => {
            if (err)
                return reject(err);
            resolve(rows);
        });
    });
}
async function updateSettingsForUser(userId, settings) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO game_settings (user_id, key, value)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value;
        `;
        init_1.default.serialize(() => {
            const stmt = init_1.default.prepare(sql);
            try {
                init_1.default.run('BEGIN');
                for (const setting of settings) {
                    stmt.run(userId, setting.key, setting.value);
                }
                init_1.default.run('COMMIT', (err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            }
            catch (err) {
                init_1.default.run('ROLLBACK');
                reject(err);
            }
            finally {
                stmt.finalize();
            }
        });
    });
}
//# sourceMappingURL=settings.service.js.map