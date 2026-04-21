export interface InventoryStaffProfile {
    id: number;
    username: string;
    role: 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER';
    nickname: string | null;
    gender: string | null;
    phone: string | null;
    avatarDataUrl: string | null;
}
export declare function fetchInventoryItems(): Promise<any[]>;
export declare function fetchInventoryWarnings(): Promise<any[]>;
export declare function updateWarningThreshold(productId: number, warningThreshold: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function inboundStock(payload: {
    productId: number;
    quantity: number;
    note: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchInventoryMovements(): Promise<any[]>;
export declare function fetchInventoryOrders(): Promise<any[]>;
export declare function shipInventoryOrder(orderId: number, payload: {
    trackingNo?: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function batchShipInventoryOrders(payload: {
    orderIds: number[];
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function updateInventoryOrderLogistics(orderId: number, payload: {
    shippingStatus: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchMyProfile(): Promise<InventoryStaffProfile>;
export declare function updateMyProfile(payload: Partial<Pick<InventoryStaffProfile, 'username' | 'gender' | 'phone' | 'avatarDataUrl'>>): Promise<InventoryStaffProfile>;
