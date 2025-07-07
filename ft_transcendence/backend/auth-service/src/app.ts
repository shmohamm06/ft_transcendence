import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { initializeDatabase } from './db/init';
import userRoutes from './modules/user/user.route';
import { userSchemas } from './modules/user/user.schema';
import settingsRoutes from './modules/settings/settings.route';
import { settingsSchemas } from './modules/settings/settings.schema';
import { FastifyRequest, FastifyReply } from 'fastify';

const fastify = Fastify({ logger: true });

// Initialize Database
initializeDatabase();

// Register JWT
fastify.register(jwt, {
  secret: 'a-super-secret-key-that-is-long-enough', // This MUST be the same across services
});

// Add schemas
for (const schema of [...userSchemas, ...settingsSchemas]) {
    fastify.addSchema(schema);
}

// Register user routes
fastify.register(userRoutes, { prefix: '/api/users' });

// Register settings routes
fastify.register(settingsRoutes, { prefix: '/api/settings' });

// Add a new route to verify tokens for other services
fastify.post('/api/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
        reply.send(request.user);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.decorate("authenticate", async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
});

start();

