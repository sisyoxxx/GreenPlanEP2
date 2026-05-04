import { type CommunityPost, type CommunityComment } from '../api';
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
    liked?: boolean;
    auditStatus?: 'pending' | 'approved' | 'rejected';
    auditMessage?: string;
}
export declare const useBuyerCommunityStore: import("pinia").StoreDefinition<"buyer-community", Pick<{
    posts: import("vue").Ref<{
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
        liked?: boolean | undefined;
        auditStatus?: "pending" | "approved" | "rejected" | undefined;
        auditMessage?: string | undefined;
    }[], CommunityPostItem[] | {
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
        liked?: boolean | undefined;
        auditStatus?: "pending" | "approved" | "rejected" | undefined;
        auditMessage?: string | undefined;
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string, string>;
    loadPosts: () => Promise<void>;
    addPost: (payload: {
        topic: string;
        title: string;
        content: string;
        imageUrl?: string | null;
    }) => Promise<void>;
    likePost: (postId: number) => Promise<void>;
    getPostById: (postId: number) => CommunityPostItem | null;
    setAuditStatus: (postId: number, status: "pending" | "approved" | "rejected", message?: string) => void;
}, "posts" | "loading" | "error">, Pick<{
    posts: import("vue").Ref<{
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
        liked?: boolean | undefined;
        auditStatus?: "pending" | "approved" | "rejected" | undefined;
        auditMessage?: string | undefined;
    }[], CommunityPostItem[] | {
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
        liked?: boolean | undefined;
        auditStatus?: "pending" | "approved" | "rejected" | undefined;
        auditMessage?: string | undefined;
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string, string>;
    loadPosts: () => Promise<void>;
    addPost: (payload: {
        topic: string;
        title: string;
        content: string;
        imageUrl?: string | null;
    }) => Promise<void>;
    likePost: (postId: number) => Promise<void>;
    getPostById: (postId: number) => CommunityPostItem | null;
    setAuditStatus: (postId: number, status: "pending" | "approved" | "rejected", message?: string) => void;
}, never>, Pick<{
    posts: import("vue").Ref<{
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
        liked?: boolean | undefined;
        auditStatus?: "pending" | "approved" | "rejected" | undefined;
        auditMessage?: string | undefined;
    }[], CommunityPostItem[] | {
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
        liked?: boolean | undefined;
        auditStatus?: "pending" | "approved" | "rejected" | undefined;
        auditMessage?: string | undefined;
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string, string>;
    loadPosts: () => Promise<void>;
    addPost: (payload: {
        topic: string;
        title: string;
        content: string;
        imageUrl?: string | null;
    }) => Promise<void>;
    likePost: (postId: number) => Promise<void>;
    getPostById: (postId: number) => CommunityPostItem | null;
    setAuditStatus: (postId: number, status: "pending" | "approved" | "rejected", message?: string) => void;
}, "loadPosts" | "addPost" | "likePost" | "getPostById" | "setAuditStatus">>;
export type { CommunityPost, CommunityComment };
