"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ref = exports.userSchemas = void 0;
const zod_1 = require("zod");
const fastify_zod_1 = require("fastify-zod");
const userCore = {
    username: zod_1.z.string(),
    email: zod_1.z.string().email(),
};
const registerUserSchema = zod_1.z.object({
    ...userCore,
    password: zod_1.z.string().min(6),
});
const oauthCallbackSchema = zod_1.z.object({
    code: zod_1.z.string(),
    state: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const userResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    ...userCore,
});
const oauthUserResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    username: zod_1.z.string(),
    email: zod_1.z.string(),
    avatar: zod_1.z.string().nullable().optional(),
    intra_id: zod_1.z.number().nullable().optional(),
    intra_login: zod_1.z.string().nullable().optional(),
    auth_provider: zod_1.z.string(),
});
_a = (0, fastify_zod_1.buildJsonSchemas)({
    registerUserSchema,
    oauthCallbackSchema,
    loginSchema,
    userResponseSchema,
    oauthUserResponseSchema,
}, { $id: 'userSchemas' }), exports.userSchemas = _a.schemas, exports.$ref = _a.$ref;
//# sourceMappingURL=user.schema.js.map