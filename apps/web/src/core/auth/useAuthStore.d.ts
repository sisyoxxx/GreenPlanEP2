import type { AuthResponse, LoginPayload, Role, UserProfile } from './types';
interface AuthState {
    accessToken: string;
    refreshToken: string;
    user: UserProfile | null;
}
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", AuthState, {
    isLoggedIn: (state: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            username: string;
            role: Role;
            nickname?: string | null | undefined;
            avatarDataUrl?: string | null | undefined;
        } | null;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => boolean;
    role: (state: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            username: string;
            role: Role;
            nickname?: string | null | undefined;
            avatarDataUrl?: string | null | undefined;
        } | null;
    } & import("pinia").PiniaCustomStateProperties<AuthState>) => Role | null;
}, {
    login(payload: LoginPayload): Promise<void>;
    register(payload: {
        username: string;
        password: string;
        roleCode: Role;
    }): Promise<void>;
    applyAuth(data: AuthResponse): void;
    syncUserProfile(patch: Partial<UserProfile>): void;
    logout(): void;
}>;
export {};
