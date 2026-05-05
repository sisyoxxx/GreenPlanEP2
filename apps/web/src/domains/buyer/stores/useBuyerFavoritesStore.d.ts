export interface FavoritePostSnapshot {
    id: number;
    topic: string;
    title: string;
    content: string;
    time: string;
    author: string;
    imageUrl?: string;
    imageAlt?: string;
}
interface FavoritesState {
    tutorialIds: number[];
    posts: FavoritePostSnapshot[];
}
export declare const useBuyerFavoritesStore: import("pinia").StoreDefinition<"buyer-favorites", FavoritesState, {
    tutorialIdSet: (state: {
        tutorialIds: number[];
        posts: {
            id: number;
            topic: string;
            title: string;
            content: string;
            time: string;
            author: string;
            imageUrl?: string | undefined;
            imageAlt?: string | undefined;
        }[];
    } & import("pinia").PiniaCustomStateProperties<FavoritesState>) => Set<number>;
    postIdSet: (state: {
        tutorialIds: number[];
        posts: {
            id: number;
            topic: string;
            title: string;
            content: string;
            time: string;
            author: string;
            imageUrl?: string | undefined;
            imageAlt?: string | undefined;
        }[];
    } & import("pinia").PiniaCustomStateProperties<FavoritesState>) => Set<number>;
}, {
    loadFavoritePostsFromServer(): Promise<void>;
    seedTutorialFavoritesIfEmpty(ids: number[]): void;
    toggleTutorial(id: number): void;
    togglePost(post: FavoritePostSnapshot): Promise<void>;
    removePost(id: number): void;
    clearAll(): void;
}>;
export {};
