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

    const defaultServicesText = "THE OMS COMPANION TEAM BRINGS TOGETHER HIGHLY SKILLED SPECIALISTS IN ORAL & MAXILLOFACIAL SURGERY, ORAL MEDICINE, RECONSTRUCTIVE SURGERY, AND ONCOLOGY, WORKING COLLABORATIVELY TO DELIVER EXPERT, COMPREHENSIVE CARE AND OPTIMAL OUTCOMES FOR ORAL AND MAXILLOFACIAL DISEASES.";
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
                        <div style={{ display: 'inline-block', border: '1.5px solid #334155', borderRadius: '50px', padding: '6px 36px', marginBottom: '28px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <span style={{ textTransform: 'lowercase', fontSize: '24px', fontWeight: '500', color: '#0f172a', letterSpacing: '0.5px', textDecoration: 'underline' }}>
                                services
                            </span>
                        </div>

                        {/* Top Subtitle Text Box (Styled like screenshot with bold box outline) */}
                        <div 
                            style={{ 
                                border: '3px solid #7c3aed', 
                                borderRadius: '12px', 
                                padding: '24px 28px', 
                                maxWidth: '920px', 
                                margin: '0 auto 50px',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.08)'
                            }}
                        >
                            <h2 
                                style={{ 
                                    fontSize: '17px', 
                                    fontWeight: '800', 
                                    color: '#0f172a', 
                                    lineHeight: '1.55', 
                                    textAlign: 'center', 
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2px'
                                }}
                            >
                                {servicesSubtitle}
                            </h2>
                        </div>
                    </div>

                    {/* Circular Image Services Grid (Matching user screenshot) */}
                    <div 
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                            gap: '45px 30px',
                            justifyContent: 'center',
                            alignItems: 'start',
                            padding: '10px'
                        }}
                    >
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
                                    <div 
                                        style={{ 
                                            width: '180px', 
                                            height: '180px', 
                                            borderRadius: '50%', 
                                            position: 'relative',
                                            overflow: 'hidden',
                                            border: '4px solid #0f172a',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                                            marginBottom: '14px',
                                            backgroundColor: '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}
                                        className="service-circle-img"
                                    >
                                        {hasImage ? (
                                            <img 
                                                src={imageSrc} 
                                                alt={srv.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
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
                                                fontSize: '54px'
                                            }}
                                        >
                                            🩺
                                        </div>
                                    </div>

                                    {/* Prefix Tag in Cyan/Teal */}
                                    {srv.prefix && (
                                        <span 
                                            style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '800', 
                                                color: '#0891b2', 
                                                letterSpacing: '0.6px', 
                                                textTransform: 'uppercase', 
                                                marginBottom: '3px',
                                                display: 'block'
                                            }}
                                        >
                                            {srv.prefix}
                                        </span>
                                    )}

                                    {/* Main Service Title in Bold Uppercase */}
                                    <h3 
                                        style={{ 
                                            fontSize: '18px', 
                                            fontWeight: '900', 
                                            color: '#0f172a', 
                                            letterSpacing: '-0.2px', 
                                            margin: 0, 
                                            textTransform: 'uppercase', 
                                            lineHeight: '1.25',
                                            maxWidth: '260px'
                                        }}
                                    >
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
            <footer className="landing-footer" style={{ padding: '60px 0 30px 0', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-white)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                        
                        {/* Brand Column */}
                        <div>
                            <Link href="/" className="landing-brand-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
                                <ApplicationLogo />
                            </Link>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                                OMSCOMPANION connects BDS Practitioners with automated patient referral pipelines, live status tracking, and surgical masterclasses.
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
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>🌐 Connect With Us</h4>
                            {getSetting('footer_facebook_url') ? (
                                <a 
                                    href={getSetting('footer_facebook_url')} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-outline"
                                    style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        color: '#fff', 
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        padding: '8px 16px',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <span>🔵</span> Facebook Page
                                </a>
                            ) : (
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Official Facebook page link coming soon.</p>
                            )}
                        </div>

                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        © 2026 {site_name || 'OMSCOMPANION'} Association. All Rights Reserved. BDS Practitioner Referral & Learning Network.
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
