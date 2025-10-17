import { useEffect } from 'react';

export function useAdminPermissionSync() {
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const roleId = localStorage.getItem('adminRoleId');
                if (!roleId) {
                    return;
                }
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/permissions/role/${roleId}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    const names = Array.isArray(data) ? data.map((p) => p.name) : [];
                    localStorage.setItem(`adminPermissions_${roleId}`, JSON.stringify(names));
                }
            } catch (err) {
                console.error('[useAdminPermissionSync] Exception:', err);
            }
        };
        fetchPermissions();
            const interval = setInterval(fetchPermissions, 5 * 1000);
        return () => clearInterval(interval);
    }, []);
}
