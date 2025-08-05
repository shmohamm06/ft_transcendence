import axios from 'axios';
import db from '../../db/init';

const OAUTH_CONFIG = {
    CLIENT_ID: process.env.OAUTH_CLIENT_ID || 'your_client_id',
    CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET || 'your_client_secret',
    REDIRECT_URI: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/42/callback',
    AUTHORIZATION_URL: 'https://api.intra.42.fr/oauth/authorize',
    TOKEN_URL: 'https://api.intra.42.fr/oauth/token',
    USER_INFO_URL: 'https://api.intra.42.fr/v2/me',
};

export interface User42Data {
    id: number;
    login: string;
    email: string;
    first_name: string;
    last_name: string;
    image: {
        versions: {
            large: string;
            medium: string;
            small: string;
        };
    };
}

export class OAuthService {
    static generateAuthURL(state?: string): string {
        const params = new URLSearchParams({
            client_id: OAUTH_CONFIG.CLIENT_ID,
            redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
            response_type: 'code',
            scope: 'public',
            ...(state && { state }),
        });

        return `${OAUTH_CONFIG.AUTHORIZATION_URL}?${params.toString()}`;
    }

    static async exchangeCodeForToken(code: string): Promise<string> {
        try {
            console.log('Exchanging code for token with:', {
                grant_type: 'authorization_code',
                client_id: OAUTH_CONFIG.CLIENT_ID,
                client_secret: OAUTH_CONFIG.CLIENT_SECRET ? '[HIDDEN]' : 'MISSING',
                code: code.substring(0, 10) + '...',
                redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
                url: OAUTH_CONFIG.TOKEN_URL
            });

            const response = await axios.post(OAUTH_CONFIG.TOKEN_URL, {
                grant_type: 'authorization_code',
                client_id: OAUTH_CONFIG.CLIENT_ID,
                client_secret: OAUTH_CONFIG.CLIENT_SECRET,
                code,
                redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
            });

            console.log('Token exchange successful');
            return response.data.access_token;
        } catch (error: any) {
            console.error('Error exchanging code for token:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw new Error('Failed to exchange authorization code for token');
        }
    }

    static async getUserInfo(accessToken: string): Promise<User42Data> {
        try {
            const response = await axios.get(OAUTH_CONFIG.USER_INFO_URL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Error fetching user info:', error.response?.data || error.message);
            throw new Error('Failed to fetch user information from 42 API');
        }
    }

    static async findOrCreateUser(userData: User42Data): Promise<any> {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE intra_id = ?',
                [userData.id],
                (err: any, existingUser: any) => {
                    if (err) {
                        console.error('Database error:', err);
                        return reject(new Error('Database error'));
                    }

                    if (existingUser) {
                        db.run(
                            `UPDATE users SET
                             username = ?,
                             email = ?,
                             avatar = ?,
                             intra_login = ?
                             WHERE intra_id = ?`,
                            [
                                userData.login,
                                userData.email,
                                userData.image?.versions?.medium || null,
                                userData.login,
                                userData.id
                            ],
                            function(updateErr: any) {
                                if (updateErr) {
                                    console.error('Error updating user:', updateErr);
                                    return reject(new Error('Failed to update user'));
                                }

                                db.run(
                                    'INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)',
                                    [existingUser.id],
                                    (statsErr: any) => {
                                        if (statsErr) {
                                            console.error('Failed to create user stats for existing user:', statsErr);
                                        }

                                        db.get(
                                            'SELECT id, username, email, avatar, intra_id, intra_login, auth_provider FROM users WHERE intra_id = ?',
                                            [userData.id],
                                            (selectErr: any, updatedUser: any) => {
                                                if (selectErr || !updatedUser) {
                                                    return reject(new Error('Failed to fetch updated user'));
                                                }
                                                resolve(updatedUser);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    } else {
                        db.run(
                            `INSERT INTO users (username, email, avatar, intra_id, intra_login, auth_provider)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                userData.login,
                                userData.email,
                                userData.image?.versions?.medium || null,
                                userData.id,
                                userData.login,
                                '42'
                            ],
                            function(insertErr: any) {
                                if (insertErr) {
                                    console.error('Error creating user:', insertErr);
                                    return reject(new Error('Failed to create user'));
                                }

                                const userId = this.lastID;
                                db.run(
                                    'INSERT INTO user_stats (user_id) VALUES (?)',
                                    [userId],
                                    (statsErr: any) => {
                                        if (statsErr) {
                                            console.error('Failed to create user stats:', statsErr);
                                        }
                                    }
                                );

                                db.get(
                                    'SELECT id, username, email, avatar, intra_id, intra_login, auth_provider FROM users WHERE id = ?',
                                    [userId],
                                    (selectErr: any, newUser: any) => {
                                        if (selectErr || !newUser) {
                                            return reject(new Error('Failed to fetch created user'));
                                        }
                                        resolve(newUser);
                                    }
                                );
                            }
                        );
                    }
                }
            );
        });
    }
}
