import { useState, useEffect } from 'react';

// Clean up any historical browser flags so standard browsers never hide install buttons
if (typeof window !== 'undefined') {
    try {
        if (localStorage.getItem('oms_app_installed')) {
            localStorage.removeItem('oms_app_installed');
        }
        if (document.cookie && document.cookie.includes('oms_app_installed')) {
            document.cookie = 'oms_app_installed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
    } catch (e) {
        // Ignore
    }
}

/**
 * Checks strictly whether the user is inside the APK (Android native WebView).
 * In normal browsers (desktop or mobile Chrome/Safari/Edge), this ALWAYS returns false
 * so install app buttons/widgets are never hidden in browser view.
 */
export function isAppInstalled() {
    if (typeof window === 'undefined') return false;

    try {
        // 1. Android WebView native JavascriptInterface injected by MainActivity.java
        if (typeof window.OMSCompanionNative !== 'undefined') {
            return true;
        }

        // 2. Explicit window flag set by mobile app WebView evaluateJavascript
        if (window.isOMSCompanionApp === true) {
            return true;
        }

        // 3. User-Agent containing OMSCompanionAndroidApp or OMSCompanionApp
        if (window.navigator && window.navigator.userAgent) {
            const ua = window.navigator.userAgent;
            if (ua.includes('OMSCompanionAndroidApp') || ua.includes('OMSCompanionApp')) {
                return true;
            }
        }
    } catch (e) {
        // Ignore cross-origin / storage disabled errors
    }

    return false;
}

export const isInsideApk = isAppInstalled;

/**
 * Kept for backwards compatibility; does not disable browser view buttons.
 */
export function markAppAsInstalled() {
    // Intentionally no-op so browser view does not hide install buttons
}

/**
 * React hook to reactively track whether running inside the APK.
 */
export function useAppInstalled() {
    const [installed, setInstalled] = useState(() => isAppInstalled());

    useEffect(() => {
        // Ensure browser storage/cookies are clean
        try {
            if (localStorage.getItem('oms_app_installed')) {
                localStorage.removeItem('oms_app_installed');
            }
            if (document.cookie && document.cookie.includes('oms_app_installed')) {
                document.cookie = 'oms_app_installed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
            }
        } catch (e) {}

        // Update in case window.OMSCompanionNative was injected after script evaluation
        setInstalled(isAppInstalled());

        const handleStatusChange = () => {
            setInstalled(isAppInstalled());
        };

        window.addEventListener('app-installed-status-changed', handleStatusChange);

        // Retry check in case WebView injects interface asynchronously
        const t1 = setTimeout(() => setInstalled(isAppInstalled()), 150);
        const t2 = setTimeout(() => setInstalled(isAppInstalled()), 600);

        return () => {
            window.removeEventListener('app-installed-status-changed', handleStatusChange);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return installed;
}
