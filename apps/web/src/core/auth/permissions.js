export function hasPermission(role, required) {
    if (!required)
        return true;
    if (!role)
        return false;
    if (required === 'BUYER_ONLY')
        return role === 'BUYER';
    if (required === 'ADMIN_ONLY')
        return role === 'ADMIN';
    if (required === 'INVENTORY_ONLY')
        return role === 'INVENTORY_MANAGER';
    return false;
}
