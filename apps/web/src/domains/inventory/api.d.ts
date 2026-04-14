export declare function fetchInventoryItems(): Promise<any[]>;
export declare function fetchInventoryWarnings(): Promise<any[]>;
export declare function updateWarningThreshold(productId: number, warningThreshold: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function inboundStock(payload: {
    productId: number;
    quantity: number;
    note: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchInventoryMovements(): Promise<any[]>;
