import { http } from '../../core/http/client';
export async function fetchProducts() {
    const res = await http.get('/api/products');
    return res.data;
}
export async function createOrder(items) {
    return http.post('/api/orders', { items });
}
export async function fetchMyOrders() {
    const res = await http.get('/api/orders/me');
    return res.data;
}
