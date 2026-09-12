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
                <title>{`Download Mobile App - ${site_name || 'OMS COMPANION'}`}</title>
                <meta name="description" content={`Download the official ${site_name || 'OMS Companion'} Mobile App for Android. Get instant push notifications for clinical announcements and surgical video masterclasses.`} />
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
                <div className="landing-section-container" style={{ maxWidth: '640px', width: '100%' }}>
                    
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
                        {/* Genuine App Icon Preview */}
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                            <div 
                                style={{ 
                                    width: '90px', 
                                    height: '90px', 
                                    borderRadius: '22px', 
                                    backgroundColor: 'var(--bg-sidebar, #0f2b35)', 
                                    border: '2px solid var(--accent-teal, #0d9488)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    boxShadow: '0 12px 28px rgba(13, 148, 136, 0.3)',
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
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>
                                Official App Icon Preview
                            </span>
                        </div>

                        {/* Version & Specs Badge */}
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span 
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 14px', 
                                    borderRadius: '20px', 
                                    backgroundColor: 'var(--color-emerald-light, rgba(16, 185, 129, 0.12))', 
                                    color: 'var(--color-emerald, #10b981)', 
                                    fontSize: '12.5px', 
                                    fontWeight: '700',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                📱 Android App v1.0 &bull; 9.1 MB
                            </span>
                            <span 
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 14px', 
                                    borderRadius: '20px', 
                                    backgroundColor: 'var(--color-cyan-light, rgba(6, 182, 212, 0.12))', 
                                    color: 'var(--color-cyan, #06b6d4)', 
                                    fontSize: '12.5px', 
                                    fontWeight: '700',
                                    border: '1px solid rgba(6, 182, 212, 0.3)'
                                }}
                            >
                                🛡️ Verified & Safe
                            </span>
                        </div>

                        {/* Title & Headline */}
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                            {site_name || 'OMS Companion'} Mobile App
                        </h1>
                        <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                            Get real-time push notifications for clinical announcements, surgical video uploads, masterclass releases, and account updates directly on your phone.
                        </p>

                        {/* Primary Action Button */}
                        <a
                            href="/download-apk-file"
                            onClick={handleDownload}
                            className="btn btn-primary btn-glow"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '16px 24px',
                                borderRadius: '14px',
                                backgroundColor: 'var(--color-emerald, #10b981)',
                                color: '#ffffff',
                                fontSize: '18px',
                                fontWeight: '800',
                                textDecoration: 'none',
                                boxShadow: '0 12px 24px -6px rgba(16, 185, 129, 0.4)',
                                transition: 'var(--transition-smooth)',
                                border: 'none',
                                boxSizing: 'border-box'
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>{downloading ? 'Downloading App...' : 'Download Android App'}</span>
                        </a>

                        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            Direct Safe Download &bull; Compatible with Android 5.0+
                        </div>

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

                        {/* Why Use the App (Usefulness Highlights) */}
                        <div style={{ marginTop: '28px', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                🌟 Why Install the Mobile App?
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                <div style={{ padding: '12px 14px', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-teal)', marginBottom: '4px' }}>
                                        🔔 Instant Clinical Alerts
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                        Get real-time push alerts as soon as new clinical announcements, surgical masterclasses, or account approvals are published.
                                    </div>
                                </div>

                                <div style={{ padding: '12px 14px', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                                        🎥 Surgical Masterclass Alerts
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                        Be notified immediately when new clinical impaction, surgical videos, or guidelines are published.
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
                                    <span>Click <strong style={{ color: 'var(--text-main)' }}>Download Android App</strong> button above.</span>
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
