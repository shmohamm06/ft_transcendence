import { FastifyReply, FastifyRequest } from 'fastify';
import { registerUser, findUserByEmail } from './user.service';
import { LoginInput, RegisterUserInput, OAuthCallbackInput } from './user.schema';
import { verifyPassword } from '../../utils/hash';
import { OAuthService } from './oauth.service';
import db from '../../db/init';


export async function registerUserHandler(
    request: FastifyRequest<{ Body: RegisterUserInput }>,
    reply: FastifyReply
) {
    try {
        const user = await registerUser(request.body);
        return reply.code(201).send(user);
    } catch (e: any) {
        console.error('Registration failed:', e.message);
        console.error('Full error:', e);

        // Check for specific SQLite constraint errors
        if (e.message && e.message.includes('UNIQUE constraint failed')) {
            if (e.message.includes('users.email')) {
                return reply.code(409).send({ message: 'Email already exists' });
            }
            if (e.message.includes('users.username')) {
                return reply.code(409).send({ message: 'Username already exists' });
            }
            return reply.code(409).send({ message: 'User already exists' });
        }

        return reply.code(500).send({ message: 'Error creating user' });
    }
}

export async function loginHandler(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
) {
    const user = await findUserByEmail(request.body.email);
    if (!user) {
        return reply.code(401).send({ message: 'Invalid email or password' });
    }

    const isCorrectPassword = verifyPassword(request.body.password, user.password);
    if (!isCorrectPassword) {
        return reply.code(401).send({ message: 'Invalid email or password' });
    }

    const { password, ...payload } = user;
    const token = request.server.jwt.sign(payload);

    return { accessToken: token };
}

export async function getUserProfileHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        await request.jwtVerify();
        const user = request.user as { id: number };

        return new Promise((resolve, reject) => {
            db.get(
              `SELECT u.id, u.username, u.email, u.created_at, us.pong_wins, us.pong_losses, us.ttt_wins, us.ttt_losses
               FROM users u
               JOIN user_stats us ON u.id = us.user_id
               WHERE u.id = ?`,
              [user.id],
              (err: Error | null, row: any) => {
                  if (err || !row) {
                      return reject(reply.code(404).send({ message: 'User not found' }));
                  }
                  resolve(reply.send(row));
              }
            );

        });
    } catch (err) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }
}

export async function updateUserStatsHandler(
    request: FastifyRequest<{ Params: { id: string }, Body: { game: string, result: string } }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    const { game, result } = request.body;

    console.log('Stats update request:', { id, game, result, user: request.user });

    const gameMap: Record<string, string> = {
        pong: 'pong',
        tictactoe: 'ttt',
    };

    const resultMap: Record<string, string> = {
        win: 'wins',
        loss: 'losses',
    };

    const gameKey = gameMap[game];
    const resultKey = resultMap[result];

    console.log('Mapped values:', { gameKey, resultKey });

    if (!gameKey || !resultKey) {
        console.error('Invalid game or result type:', { game, result });
        return reply.code(400).send({ message: 'Invalid game or result type' });
    }

    const column = `${gameKey}_${resultKey}`;
    console.log('Updating column:', column);

    return new Promise<void>((resolve, reject) => {
        db.run(
            `UPDATE user_stats SET ${column} = ${column} + 1 WHERE user_id = ?`,
            [id],
            function (err: Error | null) {
                if (err) {
                    console.error('Database error updating stats:', err);
                    reply.code(500).send({ message: 'Failed to update stats' });
                    reject(err);
                } else {
                    console.log('Stats updated successfully for user:', id);
                    reply.code(200).send({ message: 'Stats updated successfully' });
                    resolve();
                }
            }
        );
    });
}

export async function oauthAuthorizeHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const state = Math.random().toString(36).substring(2, 15);
        const authURL = OAuthService.generateAuthURL(state);

        // Redirect directly to 42 OAuth
        return reply.redirect(302, authURL);
    } catch (error: any) {
        console.error('OAuth authorization error:', error);
        return reply.code(500).send({ message: 'Failed to generate authorization URL' });
    }
}

export async function oauthCallbackHandler(
    request: FastifyRequest<{ Body: OAuthCallbackInput }>,
    reply: FastifyReply
) {
    console.log('OAuth callback received:', {
        method: request.method,
        url: request.url,
        body: request.body,
        query: request.query,
        headers: request.headers
    });

    try {
        const { code } = request.body;

        console.log('Processing OAuth callback with code:', code ? `${code.substring(0, 10)}...` : 'MISSING');

        if (!code) {
            console.error('No authorization code provided');
            return reply.code(400).send({ message: 'Authorization code is required' });
        }

        // Exchange code for access token
        const accessToken = await OAuthService.exchangeCodeForToken(code);

        // Get user info from 42 API
        const userData = await OAuthService.getUserInfo(accessToken);

        // Find or create user in our database
        const user = await OAuthService.findOrCreateUser(userData);

        console.log('OAuth: User from database:', {
            user,
            hasId: !!user.id,
            idType: typeof user.id,
            keys: Object.keys(user)
        });

        // Generate JWT token for our system
        const jwtToken = request.server.jwt.sign(user);

        // Create a plain object to ensure proper JSON serialization
        const responseUser = {
            id: Number(user.id),
            username: String(user.username),
            email: String(user.email),
            avatar: user.avatar ? String(user.avatar) : null,
            auth_provider: user.auth_provider ? String(user.auth_provider) : null
        };

        console.log('OAuth: Sending response user:', {
            responseUser,
            hasId: !!responseUser.id,
            idType: typeof responseUser.id,
            serialized: JSON.stringify(responseUser)
        });

        const responseData = {
            accessToken: jwtToken,
            user: responseUser
        };

        console.log('OAuth: Final response data:', {
            responseData,
            serializedResponse: JSON.stringify(responseData)
        });

        // Force JSON serialization by setting content-type and using JSON.stringify
        return reply
            .header('Content-Type', 'application/json')
            .send(JSON.stringify(responseData));

    } catch (error: any) {
        console.error('OAuth callback error:', error);
        return reply.code(500).send({
            message: 'OAuth authentication failed',
            error: error.message
        });
    }
}
