export interface User42Data {
    id: number;
    login: string;
    email: string;
    first_name: string;
    last_name: string;
    image: {
        versions: {
            large: string;
            medium: string;
            small: string;
        };
    };
}
export declare class OAuthService {
    static generateAuthURL(state?: string): string;
    static exchangeCodeForToken(code: string): Promise<string>;
    static getUserInfo(accessToken: string): Promise<User42Data>;
    static findOrCreateUser(userData: User42Data): Promise<any>;
}
//# sourceMappingURL=oauth.service.d.ts.map