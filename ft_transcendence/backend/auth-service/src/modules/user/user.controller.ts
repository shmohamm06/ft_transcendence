import { FastifyReply, FastifyRequest } from 'fastify';
import { registerUser, findUserByEmail } from './user.service';
import { LoginInput, RegisterUserInput } from './user.schema';
import { verifyPassword } from '../../utils/hash';
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
              `SELECT u.id, u.username, u.email, us.pong_wins, us.pong_losses, us.ttt_wins, us.ttt_losses
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

    if (!gameKey || !resultKey) {
        return reply.code(400).send({ message: 'Invalid game or result type' });
    }

    const column = `${gameKey}_${resultKey}`;

    return new Promise<void>((resolve, reject) => {
        db.run(
            `UPDATE user_stats SET ${column} = ${column} + 1 WHERE user_id = ?`,
            [id],
            function (err: Error | null) {
                if (err) {
                    reply.code(500).send({ message: 'Failed to update stats' });
                    reject(err);
                } else {
                    reply.code(200).send({ message: 'Stats updated successfully' });
                    resolve();
                }
            }
        );
    });
}
