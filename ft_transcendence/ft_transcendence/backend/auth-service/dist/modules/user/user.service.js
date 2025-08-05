"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.findUserByEmail = findUserByEmail;
const init_1 = __importDefault(require("../../db/init"));
const hash_1 = require("../../utils/hash");
async function registerUser(input) {
    const { username, email, password } = input;
    const hashedPassword = (0, hash_1.hashPassword)(password);
    return new Promise((resolve, reject) => {
        const stmt = init_1.default.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
        stmt.run(username, email, hashedPassword, function (err) {
            if (err)
                return reject(err);
            const userId = this.lastID;
            // First create user_stats record
            init_1.default.run('INSERT INTO user_stats (user_id) VALUES (?)', [userId], (statsErr) => {
                if (statsErr) {
                    console.error("Failed to insert user_stats:", statsErr);
                    return reject(statsErr);
                }
                // Then return user data
                init_1.default.get('SELECT id, username, email FROM users WHERE id = ?', userId, (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
        });
        stmt.finalize();
    });
}
async function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        init_1.default.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err)
                return reject(err);
            resolve(row);
        });
    });
}
//# sourceMappingURL=user.service.js.map