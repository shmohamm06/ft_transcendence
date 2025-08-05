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

const oauthCallbackSchema = z.object({
    code: z.string(),
    state: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const userResponseSchema = z.object({
    id: z.number(),
    ...userCore,
});

const oauthUserResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    avatar: z.string().nullable().optional(),
    intra_id: z.number().nullable().optional(),
    intra_login: z.string().nullable().optional(),
    auth_provider: z.string(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
    registerUserSchema,
    oauthCallbackSchema,
    loginSchema,
    userResponseSchema,
    oauthUserResponseSchema,
}, { $id: 'userSchemas' });
