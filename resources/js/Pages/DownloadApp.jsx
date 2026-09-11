import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import PublicNavbar from '@/Components/PublicNavbar';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function DownloadApp() {
    const { site_name } = usePage().props;
    const [downloading, setDownloading] = useState(false);

    const handleDownload = () => {
        setDownloading(true);
        setTimeout(() => setDownloading(false), 5000);
    };

    return (
        <div 
            className="landing-wrapper page-colorful-theme" 
            style={{ 
                backgroundColor: '#0b1329', 
                color: '#ffffff', 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
            <Head title={`Download Mobile App - ${site_name || 'OMSCOMPANION'}`} />

            {/* Top Navigation Bar */}
            <PublicNavbar activePage="app_download" />

            {/* Main Content Area - Centered Card */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
                <div 
                    style={{ 
                        width: '100%', 
                        maxWidth: '560px', 
                        backgroundColor: '#16223b', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '24px', 
                        padding: '40px 32px', 
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Top Glow Accent */}
                    <div 
                        style={{ 
                            position: 'absolute', 
                            top: '-60px', 
                            left: '50%', 
                            transform: 'translateX(-50%)', 
                            width: '200px', 
                            height: '120px', 
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(0,0,0,0) 70%)', 
                            pointerEvents: 'none' 
                        }} 
                    />

                    {/* App Logo / Icon */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <div 
                            style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '20px', 
                                backgroundColor: '#0f172a', 
                                border: '1px solid rgba(16, 185, 129, 0.3)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="#10b981" style={{ width: '44px', height: '44px' }}>
                                <path d="M17.523 15.3414C17.06 15.3414 16.691 14.9724 16.691 14.5094C16.691 14.0464 17.06 13.6774 17.523 13.6774C17.986 13.6774 18.355 14.0464 18.355 14.5094C18.355 14.9724 17.986 15.3414 17.523 15.3414ZM6.477 15.3414C6.014 15.3414 5.645 14.9724 5.645 14.5094C5.645 14.0464 6.014 13.6774 6.477 13.6774C6.94 13.6774 7.309 14.0464 7.309 14.5094C7.309 14.9724 6.94 15.3414 6.477 15.3414ZM17.94 10.4284L19.467 7.7834C19.615 7.5274 19.527 7.2004 19.271 7.0524C19.015 6.9044 18.688 6.9924 18.54 7.2484L16.98 9.9494C15.485 9.2674 13.805 8.8784 12 8.8784C10.195 8.8784 8.515 9.2674 7.02 9.9494L5.46 7.2484C5.312 6.9924 4.985 6.9044 4.729 7.0524C4.473 7.2004 4.385 7.5274 4.533 7.7834L6.06 10.4284C2.628 12.2944 0.285 15.7484 0 19.8244H24C23.715 15.7484 21.372 12.2944 17.94 10.4284Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Badge */}
                    <div style={{ marginBottom: '12px' }}>
                        <span 
                            style={{ 
                                display: 'inline-block', 
                                padding: '4px 14px', 
                                borderRadius: '20px', 
                                backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                                color: '#34d399', 
                                fontSize: '13px', 
                                fontWeight: '600',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            Android App v1.0 &bull; 9.1 MB
                        </span>
                    </div>

                    {/* Title & Description */}
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                        OMS Companion Mobile
                    </h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 28px 0', lineHeight: '1.6' }}>
                        Get instant push notifications for patient referrals, clinical announcements, video uploads, and account approvals directly on your phone.
                    </p>

                    {/* Large Download Button */}
                    <a
                        href="/download-apk-file"
                        onClick={handleDownload}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '16px 24px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontSize: '18px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            boxShadow: '0 12px 24px -6px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            border: 'none',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{downloading ? 'Downloading APK...' : 'Download Android App (APK)'}</span>
                    </a>

                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                        Direct Safe Download &bull; Works on Android 5.0+
                    </div>

                    {/* Simple Instructions */}
                    <div 
                        style={{ 
                            marginTop: '32px', 
                            paddingTop: '24px', 
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            textAlign: 'left'
                        }}
                    >
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', margin: '0 0 14px 0' }}>
                            Quick Installation Steps:
                        </h4>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '13px', color: '#cbd5e1' }}>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#10b981', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>1</span>
                                <span>Click <strong>Download Android App (APK)</strong> above.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#10b981', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>2</span>
                                <span>Open the downloaded file on your phone.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#10b981', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>3</span>
                                <span>Tap <strong>Install</strong>, open app, and log in!</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
