export type TopicCategory = '种植经验' | '求助问答' | '成果展示' | '官方活动';
export interface CommunityPostItem {
    id: number;
    topic: TopicCategory;
    title: string;
    content: string;
    time: string;
    likes: number;
    mine: boolean;
    author: string;
    imageUrl?: string;
    imageAlt?: string;
}
export declare const useBuyerCommunityStore: import("pinia").StoreDefinition<"buyer-community", {
    posts: CommunityPostItem[];
}, {}, {
    addPost(post: CommunityPostItem): void;
    likePost(postId: number): void;
    getPostById(postId: number): {
        id: number;
        topic: TopicCategory;
        title: string;
        content: string;
        time: string;
        likes: number;
        mine: boolean;
        author: string;
        imageUrl?: string | undefined;
        imageAlt?: string | undefined;
    } | null;
}>;
