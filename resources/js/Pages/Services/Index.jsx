import React, { useState, useEffect } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';

export default function Index({ settings = {}, services = [] }) {
    const { auth, site_name } = usePage().props;
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getSetting = (key, defaultValue = '') => {
        return (settings && settings[key]) ? settings[key] : defaultValue;
    };

    const defaultServicesText = "The OMS Companion team is a group of highly skilled specialists working collaboratively to deliver the highest standard of care and achieve optimal outcomes for a wide range of oral and maxillofacial diseases";
    const servicesSubtitle = getSetting('services_subtitle', defaultServicesText);

    return (
        <div className="landing-wrapper page-colorful-theme" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head title={`Services - ${site_name || 'OMSCOMPANION'}`} />

            {/* Header Navigation */}
            <PublicNavbar activePage="services" />

            {/* Main Services Page Content */}
            <main style={{ padding: '40px 20px 80px', flex: '1 0 auto' }}>
                <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                    
                    {/* Top Services Outline Pill Badge */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div className="page-top-pill-badge">
                            <span className="page-top-pill-text">
                                Services
                            </span>
                        </div>

                        {/* Top Subtitle Text Box (Styled like screenshot with bold box outline) */}
                        <div className="purple-banner-box">
                            <h2 className="purple-banner-text">
                                {servicesSubtitle}
                            </h2>
                        </div>
                    </div>

                    {/* Circular Image Services Grid (Matching user screenshot) */}
                    <div className="services-responsive-grid">
                        {(services || []).map((srv, idx) => {
                            const hasImage = Boolean(srv.image_path);
                            const imageSrc = hasImage ? '/' + srv.image_path : null;

                            return (
                                <div 
                                    key={srv.id || idx} 
                                    onClick={() => srv.description && setSelectedService(srv)}
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        cursor: srv.description ? 'pointer' : 'default',
                                        transition: 'transform 0.3s ease, filter 0.3s ease',
                                    }}
                                    className="service-card-item"
                                >
                                    {/* Circular Image Badge */}
                                    <div className="service-circle-img">
                                        {hasImage ? (
                                            <img 
                                                src={imageSrc} 
                                                alt={srv.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        
                                        {/* Fallback Icon Badge if no image */}
                                        <div 
                                            style={{ 
                                                display: hasImage ? 'none' : 'flex', 
                                                width: '100%', 
                                                height: '100%', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                                color: '#38bdf8',
                                                fontSize: '36px'
                                            }}
                                        >
                                            🩺
                                        </div>
                                    </div>

                                    {/* Prefix Tag in Cyan/Teal */}
                                    {srv.prefix && (
                                        <span className="service-prefix-text">
                                            {srv.prefix}
                                        </span>
                                    )}

                                    {/* Main Service Title in Bold Uppercase */}
                                    <h3 className="service-title-text">
                                        {srv.title}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </main>

            {/* Optional Service Details Popup Modal */}
            {selectedService && (
                <div 
                    className="modal-wrapper" 
                    onClick={() => setSelectedService(null)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                >
                    <div 
                        className="glass-panel" 
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '520px', width: '100%', padding: '30px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            {selectedService.image_path ? (
                                <img src={'/' + selectedService.image_path} alt={selectedService.title} style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0891b2', margin: '0 auto 12px' }} />
                            ) : null}

                            {selectedService.prefix && (
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0891b2', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                    {selectedService.prefix}
                                </span>
                            )}
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', margin: 0 }}>
                                {selectedService.title}
                            </h3>
                        </div>

                        {selectedService.description && (
                            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px', textAlign: 'center' }}>
                                {selectedService.description}
                            </p>
                        )}

                        <div style={{ textAlign: 'center' }}>
                            <button 
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setSelectedService(null)}
                                style={{ padding: '8px 24px', borderRadius: '8px' }}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="landing-footer" style={{ width: '100%', alignSelf: 'stretch', boxSizing: 'border-box', padding: '60px 0 30px 0', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-white)' }}>
                <div className="container" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px', textAlign: 'left' }}>
                        
                        {/* Brand Column */}
                        <div>
                            <Link href="/" className="landing-brand-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
                                <ApplicationLogo />
                            </Link>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                                OMS COMPANION connects doctors to enhance practice through learning and patient care
                            </p>
                        </div>

                        {/* Office Location Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>📍 Office Location</h4>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                                {getSetting('footer_office_location', 'Dhaka, Bangladesh')}
                            </p>
                        </div>

                        {/* Contact Information Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>📞 Contact & Support</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                                {getSetting('footer_contact_phone') && (
                                    <div>
                                        <strong>Phone:</strong> <a href={`tel:${getSetting('footer_contact_phone')}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{getSetting('footer_contact_phone')}</a>
                                    </div>
                                )}
                                {getSetting('footer_contact_email') && (
                                    <div>
                                        <strong>Email:</strong> <a href={`mailto:${getSetting('footer_contact_email')}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{getSetting('footer_contact_email')}</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Links Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700', textAlign: 'left' }}>🌐 Connect With Us</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                                {/* Facebook Page Link */}
                                <a 
                                    href={getSetting('footer_facebook_url') || 'https://facebook.com'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="footer-social-btn footer-btn-facebook"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span>Facebook Page</span>
                                </a>

                                {/* YouTube Channel Link */}
                                <a 
                                    href={getSetting('footer_youtube_url') || 'https://youtube.com'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="footer-social-btn footer-btn-youtube"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                    <span>YouTube Channel</span>
                                </a>
                            </div>
                        </div>

                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        © 2026 {site_name || 'OMSCOMPANION'} Association. All Rights Reserved.
                    </div>
                </div>
            </footer>

            {/* Floating Back-to-Top Button */}
            {showScrollTop && (
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                    className="floating-back-to-top"
                    title="Back to Top"
                    aria-label="Back to Top"
                >
                    ↑
                </button>
            )}
        </div>
    );
}
