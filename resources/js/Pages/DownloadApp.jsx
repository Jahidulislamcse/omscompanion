import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import PublicNavbar from '@/Components/PublicNavbar';

export default function DownloadApp() {
    const { site_name, site_logo } = usePage().props;
    const [downloading, setDownloading] = useState(false);
    const [logoSrc, setLogoSrc] = useState(site_logo || '/app-logo.png');

    const handleDownload = () => {
        setDownloading(true);
        setTimeout(() => setDownloading(false), 5000);
    };

    const handleImgError = () => {
        if (logoSrc !== '/app-logo.png') {
            setLogoSrc('/app-logo.png');
        }
    };

    return (
        <div className="landing-wrapper page-colorful-theme">
            <Head>
                <title>{`Install Mobile App - ${site_name || 'OMS COMPANION'}`}</title>
                <meta name="description" content={`Install the official ${site_name || 'OMS Companion'} Mobile App. Get instant push notifications for clinical announcements and surgical video masterclasses.`} />
            </Head>

            {/* Vibrant Ambient Glow Blobs */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />
            <div className="ambient-glow glow-indigo" />

            {/* Header Navigation */}
            <PublicNavbar activePage="app_download" />

            {/* Main Download App Section */}
            <section className="landing-section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
                <div className="landing-section-container" style={{ maxWidth: '860px', width: '100%' }}>
                    
                    <div 
                        className="glass-panel" 
                        style={{ 
                            borderRadius: '24px', 
                            padding: '40px 32px', 
                            textAlign: 'center',
                            boxShadow: 'var(--shadow-glass)',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        {/* Genuine App Icon */}
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                            <div 
                                style={{ 
                                    width: '96px', 
                                    height: '96px', 
                                    borderRadius: '24px', 
                                    backgroundColor: 'var(--bg-sidebar, #0f2b35)', 
                                    border: '2px solid var(--accent-teal, #0d9488)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    boxShadow: '0 14px 32px rgba(13, 148, 136, 0.35)',
                                    overflow: 'hidden',
                                    padding: '8px'
                                }}
                            >
                                <img 
                                    src={logoSrc} 
                                    alt={`${site_name || 'OMS Companion'} App Icon`}
                                    onError={handleImgError}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        </div>

                        {/* Version & Specs Badges */}
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span 
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 16px', 
                                    borderRadius: '20px', 
                                    backgroundColor: 'var(--color-emerald-light, rgba(16, 185, 129, 0.12))', 
                                    color: 'var(--color-emerald, #10b981)', 
                                    fontSize: '13px', 
                                    fontWeight: '700',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                📱 Mobile App v1.0 &bull; 9.1 MB
                            </span>
                            <span 
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 16px', 
                                    borderRadius: '20px', 
                                    backgroundColor: 'var(--color-cyan-light, rgba(6, 182, 212, 0.12))', 
                                    color: 'var(--color-cyan, #06b6d4)', 
                                    fontSize: '13px', 
                                    fontWeight: '700',
                                    border: '1px solid rgba(6, 182, 212, 0.3)'
                                }}
                            >
                                🛡️ Verified & Safe
                            </span>
                        </div>

                        {/* Primary Action Button - Attractive & Glossy */}
                        <a
                            href="/download-apk-file"
                            onClick={handleDownload}
                            className="download-app-glossy-btn"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '14px',
                                width: '100%',
                                padding: '18px 28px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #059669 100%)',
                                color: '#ffffff',
                                fontSize: '18px',
                                fontWeight: '900',
                                textDecoration: 'none',
                                boxShadow: '0 14px 32px -4px rgba(13, 148, 136, 0.5), 0 0 20px rgba(6, 182, 212, 0.35)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                                boxSizing: 'border-box',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div 
                                style={{ 
                                    width: '42px', 
                                    height: '42px', 
                                    borderRadius: '12px', 
                                    background: 'rgba(255, 255, 255, 0.22)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(4px)',
                                    flexShrink: 0 
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: '1.25' }}>
                                <span style={{ fontSize: '17px', fontWeight: '900', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                                    {downloading ? 'Installing App...' : 'INSTALL MOBILE APP'}
                                </span>
                                <span style={{ fontSize: '11px', opacity: 0.95, fontWeight: '600', letterSpacing: '0.2px' }}>
                                    Instant Direct Download &bull; 9.1 MB
                                </span>
                            </div>
                        </a>

                        {/* Security & Safety Badges Bar */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '20px', padding: '12px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🛡️ 100% Virus-Free & Safe
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🔒 Official Direct Build
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                ⚡ Free for Doctors & Partners
                            </div>
                        </div>

                        {/* Why Use the App (3 Benefits on Single Row) */}
                        <div style={{ marginTop: '28px', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                🌟 Why Install the Mobile App?
                            </h3>
                            <div className="download-benefits-grid">
                                <div style={{ padding: '14px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-teal)', marginBottom: '6px' }}>
                                        🔔 Instant Clinical Alerts
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                                        Get real-time push alerts as soon as new clinical announcements, surgical masterclasses, or account approvals are published.
                                    </div>
                                </div>

                                <div style={{ padding: '14px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '6px' }}>
                                        🎥 Surgical Masterclass Alerts
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                                        Be notified immediately when new clinical impaction, surgical videos, or guidelines are published.
                                    </div>
                                </div>

                                <div style={{ padding: '14px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-emerald, #10b981)', marginBottom: '6px' }}>
                                        ⚡ Easy Access
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                                        Open directly with one tap from your phone screen — no need to search for the site or open web browsers.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Simple Installation Steps */}
                        <div 
                            style={{ 
                                marginTop: '28px', 
                                paddingTop: '20px', 
                                borderTop: '1px solid var(--border-color)',
                                textAlign: 'left'
                            }}
                        >
                            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 14px 0' }}>
                                📲 Quick 3-Step Installation:
                            </h4>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-emerald, #10b981)', color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>1</span>
                                    <span>Click <strong style={{ color: 'var(--text-main)' }}>Install Mobile App</strong> button above.</span>
                                </li>
                                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-emerald, #10b981)', color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>2</span>
                                    <span>Open the downloaded file on your mobile phone.</span>
                                </li>
                                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-emerald, #10b981)', color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>3</span>
                                    <span>Tap <strong style={{ color: 'var(--text-main)' }}>Install</strong>, open app, and log in to your account!</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
