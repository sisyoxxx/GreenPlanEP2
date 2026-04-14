export type Permission = 'BUYER_ONLY' | 'ADMIN_ONLY' | 'INVENTORY_ONLY';
export declare function hasPermission(role: string | null, required?: Permission): boolean;
