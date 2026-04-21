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
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
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
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
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
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
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
    } & import("pinia").PiniaCustomStateProperties<{
        items: BuyerCartItem[];
    }>) => boolean;
}, {
    persist(): void;
    syncProduct(product: Product): void;
    addItem(product: Product, quantity?: number): void;
    setQuantity(productId: number, quantity: number): void;
    increase(productId: number): void;
    decrease(productId: number): void;
    removeItem(productId: number): void;
    clear(): void;
    buildOrderPayload(): {
        productId: number;
        quantity: number;
    }[];
}>;
