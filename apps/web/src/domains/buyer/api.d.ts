export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    price: number;
    category: string;
    variety: string;
    plantingMonth: string;
    suitableRegion: string;
    origin: string;
    germinationRate: number;
    imageUrl: string;
    onlineStock: number;
    sales: number;
}
export interface TutorialItem {
    id: number;
    displayArea: 'HOT' | 'LIST';
    displayOrder: number;
    tag: string;
    categoryCode: string | null;
    title: string;
    description: string;
    difficulty: string | null;
    durationMinutes: number | null;
    backgroundStyle: string;
    mediaUrl: string | null;
    mediaType: 'IMAGE' | 'VIDEO' | null;
    detailVideoUrl: string | null;
    favoriteDefault: boolean;
}
export interface TutorialList {
    hotTutorials: TutorialItem[];
    tutorials: TutorialItem[];
}
export interface AnnouncementItem {
    id: number;
    title: string;
    content: string;
    status: string;
    publishedAt: string | null;
    createdAt: string | null;
}
export interface PromotionItem {
    id: number;
    title: string;
    strategyType: string;
    description: string;
    imageUrl: string | null;
    status: string;
    createdAt: string | null;
}
export interface OrderItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    lineTotal: number;
}
export interface BuyerOrder {
    id: number;
    orderNo: string;
    status: string;
    totalAmount: number;
    shippingCarrier: string | null;
    trackingNo: string | null;
    shippingStatus: string | null;
    shippedAt: string | null;
    createdAt: string | null;
    items: OrderItem[];
}
export interface ProductReview {
    id: number;
    productId: number;
    productName: string;
    orderId: number | null;
    buyerId: number;
    buyerUsername: string;
    rating: number;
    content: string;
    createdAt: string | null;
}
export interface MyProfile {
    id: number;
    username: string;
    role: 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER';
    nickname: string | null;
    gender: string | null;
    phone: string | null;
    avatarDataUrl: string | null;
}
export interface MyAddress {
    id: number;
    userId: number;
    addressText: string;
    isDefault: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
export interface AiChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface AiChatResponse {
    content: string;
}
export declare function fetchProducts(): Promise<Product[]>;
export declare function fetchTutorials(): Promise<TutorialList>;
export declare function fetchTutorialDetail(id: number): Promise<TutorialItem>;
export declare function fetchAnnouncements(): Promise<AnnouncementItem[]>;
export declare function fetchPromotions(): Promise<PromotionItem[]>;
export declare function fetchProduct(id: number): Promise<Product>;
export declare function fetchProductReviews(productId: number): Promise<ProductReview[]>;
export declare function createOrder(items: Array<{
    productId: number;
    quantity: number;
}>): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchMyOrders(): Promise<BuyerOrder[]>;
export declare function confirmMyOrderReceived(orderId: number): Promise<BuyerOrder>;
export declare function fetchMyReviews(): Promise<ProductReview[]>;
export declare function createReview(orderId: number, payload: {
    productId: number;
    rating: number;
    content: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchMyProfile(): Promise<MyProfile>;
export declare function updateMyProfile(payload: Partial<Pick<MyProfile, 'username' | 'nickname' | 'gender' | 'phone' | 'avatarDataUrl'>>): Promise<MyProfile>;
export declare function fetchMyAddresses(): Promise<MyAddress[]>;
export declare function createMyAddress(payload: {
    addressText: string;
    isDefault: boolean;
}): Promise<MyAddress>;
export declare function updateMyAddress(id: number, payload: {
    addressText: string;
    isDefault: boolean;
}): Promise<MyAddress>;
export declare function deleteMyAddress(id: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export interface CommunityPost {
    id: number;
    topic: string;
    title: string;
    content: string;
    imageUrl: string | null;
    likes: number;
    author: string;
    authorId: number;
    mine: boolean;
    liked: boolean;
    favorited: boolean;
    time: string;
}
export interface CommunityComment {
    id: number;
    postId: number;
    parentId: number | null;
    author: string;
    authorId: number;
    content: string;
    mine: boolean;
    time: string;
}
export interface CommunityPostDetail {
    id: number;
    topic: string;
    title: string;
    content: string;
    imageUrl: string | null;
    likes: number;
    author: string;
    authorId: number;
    mine: boolean;
    liked: boolean;
    favorited: boolean;
    time: string;
    comments: CommunityComment[];
}
export declare function fetchCommunityPosts(): Promise<CommunityPost[]>;
export declare function fetchCommunityPostDetail(id: number): Promise<CommunityPostDetail>;
export declare function createCommunityPost(payload: {
    topic: string;
    title: string;
    content: string;
    imageUrl?: string | null;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function toggleLikePost(id: number): Promise<{
    liked: boolean;
    likeCount: number;
}>;
export declare function toggleFavoritePost(id: number): Promise<{
    favorited: boolean;
}>;
export declare function fetchFavoritePostIds(): Promise<number[]>;
export declare function createCommunityComment(postId: number, payload: {
    content: string;
    parentCommentId?: number | null;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function aiChat(messages: AiChatMessage[]): Promise<AiChatResponse>;
