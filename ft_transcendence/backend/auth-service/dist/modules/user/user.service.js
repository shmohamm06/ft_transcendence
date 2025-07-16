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
            init_1.default.get('SELECT id, username, email FROM users WHERE id = ?', this.lastID, (err, row) => {
                if (err)
                    return reject(err);
                resolve(row);
                const userId = row.id;
                init_1.default.run('INSERT INTO user_stats (user_id) VALUES (?)', [userId], (err) => {
                    if (err)
                        console.error("Failed to insert user_stats:", err);
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