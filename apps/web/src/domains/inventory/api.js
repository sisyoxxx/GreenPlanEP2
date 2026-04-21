import { http } from '../../core/http/client';
export async function fetchInventoryItems() {
    const res = await http.get('/api/inventory/items');
    return res.data;
}
export async function fetchInventoryWarnings() {
    const res = await http.get('/api/inventory/warnings');
    return res.data;
}
export async function updateWarningThreshold(productId, warningThreshold) {
    return http.patch('/api/inventory/warnings', { productId, warningThreshold });
}
export async function inboundStock(payload) {
    return http.post('/api/inventory/inbound', payload);
}
export async function fetchInventoryMovements() {
    const res = await http.get('/api/inventory/movements');
    return res.data;
}
export async function fetchInventoryOrders() {
    const res = await http.get('/api/inventory/orders');
    return res.data;
}
export async function shipInventoryOrder(orderId, payload) {
    return http.patch(`/api/inventory/orders/${orderId}/ship`, payload);
}
export async function batchShipInventoryOrders(payload) {
    return http.patch('/api/inventory/orders/batch-ship', payload);
}
export async function updateInventoryOrderLogistics(orderId, payload) {
    return http.patch(`/api/inventory/orders/${orderId}/logistics`, payload);
}
export async function fetchMyProfile() {
    const res = await http.get('/api/profile/me');
    return res.data;
}
export async function updateMyProfile(payload) {
    const res = await http.put('/api/profile/me', payload);
    return res.data;
}
