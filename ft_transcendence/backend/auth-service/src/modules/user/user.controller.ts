import { FastifyReply, FastifyRequest } from 'fastify';
import { registerUser, findUserByEmail } from './user.service';
import { LoginInput, RegisterUserInput } from './user.schema';
import { verifyPassword } from '../../utils/hash';

export async function registerUserHandler(
    request: FastifyRequest<{ Body: RegisterUserInput }>,
    reply: FastifyReply
) {
    try {
        const user = await registerUser(request.body);
        return reply.code(201).send(user);
    } catch (e) {
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
