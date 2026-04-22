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
export async function updateAnnouncement(id, payload) {
    return http.put(`/api/admin/announcements/${id}`, payload);
}
export async function deleteAnnouncement(id) {
    return http.delete(`/api/admin/announcements/${id}`);
}
export async function createProduct(payload) {
    return http.post('/api/admin/products', payload);
}
export async function fetchAdminProducts() {
    const res = await http.get('/api/admin/products');
    return res.data;
}
export async function updateProduct(id, payload) {
    return http.put(`/api/admin/products/${id}`, payload);
}
export async function updateProductStatus(id, status) {
    return http.patch(`/api/admin/products/${id}/status`, { status });
}
export async function fetchPromotions() {
    const res = await http.get('/api/promotions');
    return res.data;
}
export async function createPromotion(payload) {
    return http.post('/api/admin/promotions', payload);
}
export async function updatePromotion(id, payload) {
    return http.put(`/api/admin/promotions/${id}`, payload);
}
export async function deletePromotion(id) {
    return http.delete(`/api/admin/promotions/${id}`);
}
export async function fetchPromotionPosts() {
    const res = await http.get('/api/promotion-posts');
    return res.data;
}
export async function createPromotionPost(payload) {
    return http.post('/api/admin/promotion-posts', payload);
}
export async function updatePromotionPost(id, payload) {
    return http.put(`/api/admin/promotion-posts/${id}`, payload);
}
export async function deletePromotionPost(id) {
    return http.delete(`/api/admin/promotion-posts/${id}`);
}
export async function fetchAdminTutorials() {
    const res = await http.get('/api/admin/tutorials');
    return res.data;
}
export async function createTutorial(payload) {
    return http.post('/api/admin/tutorials', payload);
}
export async function updateTutorial(id, payload) {
    return http.put(`/api/admin/tutorials/${id}`, payload);
}
export async function deleteTutorial(id) {
    return http.delete(`/api/admin/tutorials/${id}`);
}
export async function fetchAdminOrders() {
    const res = await http.get('/api/admin/orders');
    return res.data;
}
export async function fetchAdminOrderDetail(orderId) {
    const res = await http.get(`/api/admin/orders/${orderId}`);
    return res.data;
}
export async function fetchMyProfile() {
    const res = await http.get('/api/profile/me');
    return res.data;
}
export async function updateMyProfile(payload) {
    const res = await http.put('/api/profile/me', payload);
    return res.data;
}
