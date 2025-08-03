import { z } from 'zod';
declare const registerUserSchema: z.ZodObject<{
    password: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    username: string;
    email: string;
}, {
    password: string;
    username: string;
    email: string;
}>;
declare const oauthCallbackSchema: z.ZodObject<{
    code: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    state?: string | undefined;
}, {
    code: string;
    state?: string | undefined;
}>;
declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const userSchemas: import("fastify-zod").JsonSchema[], $ref: import("fastify-zod/build/JsonSchema").$Ref<{
    registerUserSchema: z.ZodObject<{
        password: z.ZodString;
        username: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        username: string;
        email: string;
    }, {
        password: string;
        username: string;
        email: string;
    }>;
    oauthCallbackSchema: z.ZodObject<{
        code: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        state?: string | undefined;
    }, {
        code: string;
        state?: string | undefined;
    }>;
    loginSchema: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
    }, {
        password: string;
        email: string;
    }>;
    userResponseSchema: z.ZodObject<{
        username: z.ZodString;
        email: z.ZodString;
        id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        username: string;
        email: string;
        id: number;
    }, {
        username: string;
        email: string;
        id: number;
    }>;
    oauthUserResponseSchema: z.ZodObject<{
        id: z.ZodNumber;
        username: z.ZodString;
        email: z.ZodString;
        avatar: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        intra_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        intra_login: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        auth_provider: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
        email: string;
        id: number;
        auth_provider: string;
        avatar?: string | null | undefined;
        intra_id?: number | null | undefined;
        intra_login?: string | null | undefined;
    }, {
        username: string;
        email: string;
        id: number;
        auth_provider: string;
        avatar?: string | null | undefined;
        intra_id?: number | null | undefined;
        intra_login?: string | null | undefined;
    }>;
}>;
export {};
//# sourceMappingURL=user.schema.d.ts.map