import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

const userCore = {
    username: z.string(),
    email: z.string().email(),
};

const registerUserSchema = z.object({
    ...userCore,
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const userResponseSchema = z.object({
    id: z.number(),
    ...userCore,
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
    registerUserSchema,
    loginSchema,
    userResponseSchema,
}, { $id: 'userSchemas' });
