"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthService = void 0;
const axios_1 = __importDefault(require("axios"));
const init_1 = __importDefault(require("../../db/init"));
// 42 OAuth Configuration
const OAUTH_CONFIG = {
    CLIENT_ID: process.env.OAUTH_CLIENT_ID || 'your_client_id',
    CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET || 'your_client_secret',
    REDIRECT_URI: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/42/callback',
    AUTHORIZATION_URL: 'https://api.intra.42.fr/oauth/authorize',
    TOKEN_URL: 'https://api.intra.42.fr/oauth/token',
    USER_INFO_URL: 'https://api.intra.42.fr/v2/me',
};
class OAuthService {
    static generateAuthURL(state) {
        const params = new URLSearchParams({
            client_id: OAUTH_CONFIG.CLIENT_ID,
            redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
            response_type: 'code',
            scope: 'public',
            ...(state && { state }),
        });
        return `${OAUTH_CONFIG.AUTHORIZATION_URL}?${params.toString()}`;
    }
    static async exchangeCodeForToken(code) {
        try {
            console.log('Exchanging code for token with:', {
                grant_type: 'authorization_code',
                client_id: OAUTH_CONFIG.CLIENT_ID,
                client_secret: OAUTH_CONFIG.CLIENT_SECRET ? '[HIDDEN]' : 'MISSING',
                code: code.substring(0, 10) + '...',
                redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
                url: OAUTH_CONFIG.TOKEN_URL
            });
            const response = await axios_1.default.post(OAUTH_CONFIG.TOKEN_URL, {
                grant_type: 'authorization_code',
                client_id: OAUTH_CONFIG.CLIENT_ID,
                client_secret: OAUTH_CONFIG.CLIENT_SECRET,
                code,
                redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
            });
            console.log('Token exchange successful');
            return response.data.access_token;
        }
        catch (error) {
            console.error('Error exchanging code for token:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw new Error('Failed to exchange authorization code for token');
        }
    }
    static async getUserInfo(accessToken) {
        try {
            const response = await axios_1.default.get(OAUTH_CONFIG.USER_INFO_URL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching user info:', error.response?.data || error.message);
            throw new Error('Failed to fetch user information from 42 API');
        }
    }
    static async findOrCreateUser(userData) {
        return new Promise((resolve, reject) => {
            // First, try to find existing user by intra_id
            init_1.default.get('SELECT * FROM users WHERE intra_id = ?', [userData.id], (err, existingUser) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Database error'));
                }
                if (existingUser) {
                    // User exists, update their info
                    init_1.default.run(`UPDATE users SET
                             username = ?,
                             email = ?,
                             avatar = ?,
                             intra_login = ?
                             WHERE intra_id = ?`, [
                        userData.login,
                        userData.email,
                        userData.image?.versions?.medium || null,
                        userData.login,
                        userData.id
                    ], function (updateErr) {
                        if (updateErr) {
                            console.error('Error updating user:', updateErr);
                            return reject(new Error('Failed to update user'));
                        }
                        // Return updated user data
                        init_1.default.get('SELECT id, username, email, avatar, intra_id, intra_login, auth_provider FROM users WHERE intra_id = ?', [userData.id], (selectErr, updatedUser) => {
                            if (selectErr || !updatedUser) {
                                return reject(new Error('Failed to fetch updated user'));
                            }
                            resolve(updatedUser);
                        });
                    });
                }
                else {
                    // User doesn't exist, create new one
                    init_1.default.run(`INSERT INTO users (username, email, avatar, intra_id, intra_login, auth_provider)
                             VALUES (?, ?, ?, ?, ?, ?)`, [
                        userData.login,
                        userData.email,
                        userData.image?.versions?.medium || null,
                        userData.id,
                        userData.login,
                        '42'
                    ], function (insertErr) {
                        if (insertErr) {
                            console.error('Error creating user:', insertErr);
                            return reject(new Error('Failed to create user'));
                        }
                        // Create user stats
                        const userId = this.lastID;
                        init_1.default.run('INSERT INTO user_stats (user_id) VALUES (?)', [userId], (statsErr) => {
                            if (statsErr) {
                                console.error('Failed to create user stats:', statsErr);
                            }
                        });
                        // Return new user data
                        init_1.default.get('SELECT id, username, email, avatar, intra_id, intra_login, auth_provider FROM users WHERE id = ?', [userId], (selectErr, newUser) => {
                            if (selectErr || !newUser) {
                                return reject(new Error('Failed to fetch created user'));
                            }
                            resolve(newUser);
                        });
                    });
                }
            });
        });
    }
}
exports.OAuthService = OAuthService;
//# sourceMappingURL=oauth.service.js.map