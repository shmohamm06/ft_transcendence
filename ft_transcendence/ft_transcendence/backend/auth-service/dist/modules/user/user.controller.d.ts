import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginInput, RegisterUserInput, OAuthCallbackInput } from './user.schema';
export declare function registerUserHandler(request: FastifyRequest<{
    Body: RegisterUserInput;
}>, reply: FastifyReply): Promise<never>;
export declare function loginHandler(request: FastifyRequest<{
    Body: LoginInput;
}>, reply: FastifyReply): Promise<{
    accessToken: string;
}>;
export declare function getUserProfileHandler(request: FastifyRequest, reply: FastifyReply): Promise<unknown>;
export declare function updateUserStatsHandler(request: FastifyRequest<{
    Params: {
        id: string;
    };
    Body: {
        game: string;
        result: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function oauthAuthorizeHandler(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function oauthCallbackHandler(request: FastifyRequest<{
    Body: OAuthCallbackInput;
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=user.controller.d.ts.map