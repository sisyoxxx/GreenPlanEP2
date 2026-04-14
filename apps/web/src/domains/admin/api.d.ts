export declare function fetchSalesOverview(): Promise<any>;
export declare function fetchAnnouncements(): Promise<any[]>;
export declare function createAnnouncement(payload: {
    title: string;
    content: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function createProduct(payload: {
    sku: string;
    name: string;
    description: string;
    price: number;
    category: string;
    plantingMonth: string;
    suitableRegion: string;
    imageUrl: string;
    initialStock: number;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function createPromotion(payload: {
    title: string;
    strategyType: string;
    description: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function createPromotionPost(payload: {
    promotionId: number;
    channel: string;
    content: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchPromotions(): Promise<any[]>;
