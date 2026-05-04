import type { Product } from '../api';
export interface BuyerCartItem {
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
    quantity: number;
}
export declare const useBuyerCartStore: import("pinia").StoreDefinition<"buyer-cart", {
    items: BuyerCartItem[];
    loaded: boolean;
}, {
    itemCount: (state: {
        items: {
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
            quantity: number;
        }[];
        loaded: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
        loaded: boolean;
    }>) => number;
    uniqueCount: (state: {
        items: {
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
            quantity: number;
        }[];
        loaded: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
        loaded: boolean;
    }>) => number;
    totalAmount: (state: {
        items: {
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
            quantity: number;
        }[];
        loaded: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
        loaded: boolean;
    }>) => number;
    isEmpty: (state: {
        items: {
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
            quantity: number;
        }[];
        loaded: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
        loaded: boolean;
    }>) => boolean;
}, {
    loadCart(): Promise<void>;
    syncProduct(product: Product): void;
    addItem(product: Product, quantity?: number): Promise<void>;
    setQuantity(productId: number, quantity: number): Promise<void>;
    increase(productId: number): Promise<void>;
    decrease(productId: number): Promise<void>;
    removeItem(productId: number): Promise<void>;
    clear(): Promise<void>;
    buildOrderPayload(): {
        productId: number;
        quantity: number;
    }[];
}>;
