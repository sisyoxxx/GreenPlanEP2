import { http } from '../../core/http/client';
export async function fetchSalesOverview() {
    const res = await http.get('/api/admin/reports/sales/overview');
    return res.data;
}
export async function fetchAnnouncements() {
    const res = await http.get('/api/announcements');
    return res.data;
}
export async function createAnnouncement(payload) {
    return http.post('/api/admin/announcements', payload);
}
export async function createProduct(payload) {
    return http.post('/api/admin/products', payload);
}
export async function createPromotion(payload) {
    return http.post('/api/admin/promotions', payload);
}
export async function createPromotionPost(payload) {
    return http.post('/api/admin/promotion-posts', payload);
}
export async function fetchPromotions() {
    const res = await http.get('/api/promotions');
    return res.data;
}
