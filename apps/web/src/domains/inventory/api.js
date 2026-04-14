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
