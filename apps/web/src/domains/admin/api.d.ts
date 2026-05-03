export interface AdminAnnouncement {
    id: number;
    title: string;
    content: string;
    status: string;
    publishedAt: string | null;
    createdAt: string | null;
}
export interface AdminPromotion {
    id: number;
    title: string;
    strategyType: string;
    description: string;
    imageUrl: string | null;
    status: string;
    createdAt: string | null;
}
export interface AdminPromotionPost {
    id: number;
    promotionId: number;
    channel: string;
    content: string;
    imageUrl: string | null;
    postStatus: string;
    publishedAt: string | null;
    createdAt: string | null;
}
export interface AdminTutorial {
    id: number;
    displayArea: string;
    displayOrder: number;
    tag: string;
    categoryCode: string | null;
    title: string;
    description: string;
    difficulty: string | null;
    durationMinutes: number | null;
    backgroundStyle: string | null;
    mediaUrl: string | null;
    mediaType: 'IMAGE' | 'VIDEO' | null;
    detailVideoUrl: string | null;
    favoriteDefault: boolean;
    published: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
export interface AdminProduct {
    id: number;
    sku: string;
    name: string;
    description: string;
    price: number;
    status: string;
    category: string;
    variety: string;
    plantingMonth: string;
    suitableRegion: string;
    origin: string;
    germinationRate: number;
    imageUrl: string;
    onlineStock: number;
}
export interface AdminOrderListItem {
    id: number;
    orderNo: string;
    status: string;
    totalAmount: number;
    buyerId: number;
    buyerUsername: string | null;
    shippingStatus: string | null;
    createdAt: string | null;
    shippedAt: string | null;
}
export interface AdminOrderDetailItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    lineTotal: number;
}
export interface AdminOrderReviewItem {
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
export interface AdminOrderDetail {
    id: number;
    orderNo: string;
    status: string;
    totalAmount: number;
    buyerId: number;
    buyerUsername: string | null;
    shippingStatus: string | null;
    createdAt: string | null;
    shippedAt: string | null;
    items: AdminOrderDetailItem[];
    reviews: AdminOrderReviewItem[];
}
export interface StaffProfile {
    id: number;
    username: string;
    role: 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER';
    nickname: string | null;
    gender: string | null;
    phone: string | null;
    avatarDataUrl: string | null;
}
export interface SalesOverviewRow {
    productId: number;
    name: string;
    category: string;
    sales: number;
}
export interface SalesOverview {
    totalOrders: number;
    totalUnits: number;
    grossSales: number;
    avgOrder: number;
    topCategory: string;
    totalProducts: number;
    top10: SalesOverviewRow[];
    slowMoving: SalesOverviewRow[];
}
export declare function fetchSalesOverview(): Promise<SalesOverview>;
export declare function fetchAnnouncements(): Promise<AdminAnnouncement[]>;
export declare function createAnnouncement(payload: {
    title: string;
    content: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function updateAnnouncement(id: number, payload: {
    title: string;
    content: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function deleteAnnouncement(id: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function createProduct(payload: {
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
    initialStock: number;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchAdminProducts(): Promise<AdminProduct[]>;
export declare function updateProduct(id: number, payload: {
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
    initialStock: number;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function updateProductStatus(id: number, status: string): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchPromotions(): Promise<AdminPromotion[]>;
export declare function createPromotion(payload: {
    title: string;
    strategyType: string;
    description: string;
    imageUrl: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function updatePromotion(id: number, payload: {
    title: string;
    strategyType: string;
    description: string;
    imageUrl: string;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function deletePromotion(id: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchPromotionPosts(): Promise<AdminPromotionPost[]>;
export declare function createPromotionPost(payload: {
    promotionId: number;
    channel: string;
    content: string;
    imageUrl?: string | null;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function updatePromotionPost(id: number, payload: {
    promotionId: number;
    channel: string;
    content: string;
    imageUrl?: string | null;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function deletePromotionPost(id: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchAdminTutorials(): Promise<AdminTutorial[]>;
export declare function createTutorial(payload: {
    displayArea: string;
    displayOrder: number;
    tag: string;
    categoryCode: string;
    title: string;
    description: string;
    difficulty: string;
    durationMinutes: number | null;
    backgroundStyle: string;
    mediaUrl: string | null;
    mediaType: 'IMAGE' | 'VIDEO' | null;
    detailVideoUrl: string | null;
    favoriteDefault: boolean;
    published: boolean;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function updateTutorial(id: number, payload: {
    displayArea: string;
    displayOrder: number;
    tag: string;
    categoryCode: string;
    title: string;
    description: string;
    difficulty: string;
    durationMinutes: number | null;
    backgroundStyle: string;
    mediaUrl: string | null;
    mediaType: 'IMAGE' | 'VIDEO' | null;
    detailVideoUrl: string | null;
    favoriteDefault: boolean;
    published: boolean;
}): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function deleteTutorial(id: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function swapTutorialOrder(id: number, direction: 'UP' | 'DOWN'): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchAdminReviews(): Promise<AdminOrderReviewItem[]>;
export declare function deleteAdminReview(id: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function fetchAdminOrders(): Promise<AdminOrderListItem[]>;
export declare function fetchAdminOrderDetail(orderId: number): Promise<AdminOrderDetail>;
export declare function fetchMyProfile(): Promise<StaffProfile>;
export declare function updateMyProfile(payload: Partial<Pick<StaffProfile, 'username' | 'gender' | 'phone' | 'avatarDataUrl'>>): Promise<StaffProfile>;
