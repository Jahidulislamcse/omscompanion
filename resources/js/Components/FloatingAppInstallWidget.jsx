import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useAppInstalled } from '@/utils/appDetection';

export default function FloatingAppInstallWidget() {
    const isInstalled = useAppInstalled();
    const { is_app_installed } = usePage().props;

    // Do not show widget if user is running inside the app or has installed it
    if (isInstalled || is_app_installed) {
        return null;
    }

    // Also avoid cluttering the dedicated download page
    if (typeof window !== 'undefined' && window.location.pathname === '/download-app') {
        return null;
    }

    return (
        <Link 
            href={route('app.download')} 
            className="app-floating-widget"
            aria-label="Download Mobile App"
            title="Download Mobile App"
        >
            <div className="app-floating-icon-wrap">
                <img 
                    src="/app-logo.png" 
                    alt="Mobile App" 
                    className="app-floating-icon-img"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.parentNode && !e.target.parentNode.querySelector('.fallback-icon')) {
                            const icon = document.createElement('span');
                            icon.className = 'fallback-icon';
                            icon.style.fontSize = '18px';
                            icon.textContent = '📱';
                            e.target.parentNode.appendChild(icon);
                        }
                    }}
                />
            </div>
            <div className="app-floating-text-box">
                <span className="app-floating-title">Mobile App</span>
                <span className="app-floating-subtitle">Install Now ↓</span>
            </div>
        </Link>
    );
}
