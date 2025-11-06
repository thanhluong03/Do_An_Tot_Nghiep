declare global {
    interface Window {
        reloadCartCount?: () => void;
        __forceCartUpdate?: boolean;
    }
}
export { };