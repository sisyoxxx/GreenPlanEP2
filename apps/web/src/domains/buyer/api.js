import { http } from '../../core/http/client';
export async function fetchProducts() {
    const res = await http.get('/api/products');
    return res.data;
}
export async function fetchTutorials() {
    const res = await http.get('/api/tutorials');
    return res.data;
}
export async function fetchTutorialDetail(id) {
    const res = await http.get(`/api/tutorials/${id}`);
    return res.data;
}
export async function fetchAnnouncements() {
    const res = await http.get('/api/announcements');
    return res.data;
}
export async function fetchPromotions() {
    const res = await http.get('/api/promotions');
    return res.data;
}
export async function fetchProduct(id) {
    const res = await http.get(`/api/products/${id}`);
    return res.data;
}
export async function fetchProductReviews(productId) {
    const res = await http.get(`/api/products/${productId}/reviews`);
    return res.data;
}
export async function createOrder(items) {
    return http.post('/api/orders', { items });
}
export async function fetchMyOrders() {
    const res = await http.get('/api/orders/me');
    return res.data;
}
export async function confirmMyOrderReceived(orderId) {
    const res = await http.patch(`/api/orders/${orderId}/received`);
    return res.data;
}
export async function fetchMyReviews() {
    const res = await http.get('/api/reviews/me');
    return res.data;
}
export async function createReview(orderId, payload) {
    return http.post(`/api/orders/${orderId}/reviews`, payload);
}
export async function fetchMyProfile() {
    const res = await http.get('/api/profile/me');
    return res.data;
}
export async function updateMyProfile(payload) {
    const res = await http.put('/api/profile/me', payload);
    return res.data;
}
export async function fetchMyAddresses() {
    const res = await http.get('/api/profile/me/addresses');
    return res.data;
}
export async function createMyAddress(payload) {
    const res = await http.post('/api/profile/me/addresses', payload);
    return res.data;
}
export async function updateMyAddress(id, payload) {
    const res = await http.put(`/api/profile/me/addresses/${id}`, payload);
    return res.data;
}
export async function deleteMyAddress(id) {
    return http.delete(`/api/profile/me/addresses/${id}`);
}
export async function aiChat(messages) {
    const res = await http.post('/api/ai/chat', { messages });
    return res.data;
}
