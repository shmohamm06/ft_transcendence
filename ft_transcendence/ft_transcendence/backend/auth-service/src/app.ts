import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Environment variables loaded:', {
    CLIENT_ID: process.env.OAUTH_CLIENT_ID ? 'LOADED' : 'MISSING',
    CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET ? 'LOADED' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'LOADED' : 'MISSING'
});
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import { initializeDatabase } from './db/init';
import userRoutes from './modules/user/user.route';
import { userSchemas } from './modules/user/user.schema';
import settingsRoutes from './modules/settings/settings.route';
import { settingsSchemas } from './modules/settings/settings.schema';
import { FastifyRequest, FastifyReply } from 'fastify';

const fastify = Fastify({ logger: true });

initializeDatabase();

fastify.register(cors, {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8081', 'http://127.0.0.1:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'a-super-secret-key-that-is-long-enough',
});

for (const schema of [...userSchemas, ...settingsSchemas]) {
    fastify.addSchema(schema);
}

fastify.register(userRoutes, { prefix: '/api/users' });

fastify.register(settingsRoutes, { prefix: '/api/settings' });

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

