export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    price: number;
    category: string;
    plantingMonth: string;
    suitableRegion: string;
    imageUrl: string;
    onlineStock: number;
}
export declare function fetchProducts(): Promise<Product[]>;
export declare function createOrder(items: Array<{
    productId: number;
    quantity: number;
}>): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchMyOrders(): Promise<any[]>;
