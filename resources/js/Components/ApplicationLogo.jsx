import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function ApplicationLogo({ className = '', style = {}, height = '32px' }) {
    const { site_logo, site_name } = usePage().props;
    const displayName = site_name || 'OMSCOMPANION';
    const [imgError, setImgError] = useState(false);

    if (site_logo && !imgError) {
        return (
            <div className={`sidebar-logo ${className}`} style={{ marginBottom: 0, display: 'flex', alignItems: 'center', ...style }}>
                <img 
                    src={site_logo} 
                    alt={displayName} 
                    onError={() => setImgError(true)}
                    style={{ maxHeight: height, maxWidth: '200px', objectFit: 'contain' }} 
                />
            </div>
        );
    }

    return (
        <div className={`sidebar-logo ${className}`} style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
            <span style={{ fontSize: '1.2em' }}>🦷</span>
            <div style={{ fontWeight: 800, letterSpacing: '0.5px' }}>
                {displayName}
            </div>
        </div>
    );
}
