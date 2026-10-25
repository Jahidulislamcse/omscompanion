import { useState, useEffect } from 'react';

/**
 * Checks synchronously whether the user is inside the installed mobile app
 * or has already marked the app as installed on this browser.
 */
export function isAppInstalled() {
    if (typeof window === 'undefined') return false;

    try {
        // 1. Android WebView native JavascriptInterface
        if (typeof window.OMSCompanionNative !== 'undefined') {
            return true;
        }

        // 2. Explicit window flag set by mobile app
        if (window.isOMSCompanionApp === true) {
            return true;
        }

        // 3. User-Agent containing OMSCompanion
        if (window.navigator && window.navigator.userAgent) {
            const ua = window.navigator.userAgent;
            if (ua.includes('OMSCompanionAndroidApp') || ua.includes('OMSCompanionApp')) {
                return true;
            }
        }

        // 4. Standalone PWA / display-mode standalone
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        if (window.navigator && window.navigator.standalone === true) {
            return true;
        }

        // 5. LocalStorage flag
        const stored = localStorage.getItem('oms_app_installed');
        if (stored === 'true' || stored === '1') {
            return true;
        }

        // 6. Cookie flag
        if (document.cookie && (document.cookie.includes('oms_app_installed=true') || document.cookie.includes('oms_app_installed=1'))) {
            return true;
        }
    } catch (e) {
        // Ignore cross-origin / storage disabled errors
    }

    return false;
}

/**
 * Marks the app as installed in LocalStorage and cookie, and dispatches an event.
 */
export function markAppAsInstalled() {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('oms_app_installed', 'true');
        document.cookie = 'oms_app_installed=true;path=/;max-age=31536000;SameSite=Lax';
        window.dispatchEvent(new Event('app-installed-status-changed'));
    } catch (e) {
        // Ignore
    }

    try {
        // Also fire background beacon/request to set server cookie
        if (typeof window.fetch === 'function') {
            fetch('/mark-app-installed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            }).catch(() => {});
        }
    } catch (e) {
        // Ignore
    }
}

/**
 * React hook to reactively track whether the app is installed.
 */
export function useAppInstalled() {
    const [installed, setInstalled] = useState(() => isAppInstalled());

    useEffect(() => {
        // Update in case window.OMSCompanionNative was injected after script evaluation
        setInstalled(isAppInstalled());

        const handleStatusChange = () => {
            setInstalled(isAppInstalled());
        };

        window.addEventListener('app-installed-status-changed', handleStatusChange);
        window.addEventListener('storage', handleStatusChange);

        // Retry check a few times in case WebView injects interface asynchronously
        const t1 = setTimeout(() => setInstalled(isAppInstalled()), 150);
        const t2 = setTimeout(() => setInstalled(isAppInstalled()), 600);

        return () => {
            window.removeEventListener('app-installed-status-changed', handleStatusChange);
            window.removeEventListener('storage', handleStatusChange);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return installed;
}
