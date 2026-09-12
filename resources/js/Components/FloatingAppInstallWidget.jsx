import React from 'react';
import { Link } from '@inertiajs/react';

export default function FloatingAppInstallWidget() {
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
