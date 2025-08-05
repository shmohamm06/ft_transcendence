"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
function hashPassword(password) {
    const salt = bcrypt_1.default.genSaltSync(10);
    return bcrypt_1.default.hashSync(password, salt);
}
function verifyPassword(password, hash) {
    return bcrypt_1.default.compareSync(password, hash);
}
//# sourceMappingURL=hash.js.map