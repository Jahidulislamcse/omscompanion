import React, { useState, useEffect } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';

export default function Index({ settings = {}, services = [] }) {
    const { auth, site_name } = usePage().props;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

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

    const getDashboardRoute = () => {
        if (!auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const getSetting = (key, defaultValue = '') => {
        return (settings && settings[key]) ? settings[key] : defaultValue;
    };

    const servicesSubtitle = getSetting('services_subtitle', "The OMS Companion team is a group of highly skilled specialists in Oral & Maxillofacial Surgery, Oral Medicine, Reconstructive Surgery, and Oncology, working collaboratively to deliver the highest standard of care and achieve optimal outcomes for a wide range of oral and maxillofacial diseases");

    return (
        <div className="landing-wrapper page-colorful-theme" style={{ backgroundColor: '#ffffff' }}>
            <Head title={`Services - ${site_name || 'OMSCOMPANION'}`} />

            {/* Header Navigation */}
            <PublicNavbar activePage="services" />

            {/* Main Services Page Content */}
            <main style={{ padding: '60px 24px 100px', flex: '1 0 auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    
                    {/* Top Services Outline Pill Badge */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div className="outline-pill-wrapper" style={{ marginBottom: '24px' }}>
                            <span className="outline-pill-badge" style={{ textTransform: 'lowercase', padding: '8px 40px', fontSize: '22px' }}>
                                services
                            </span>
                        </div>

                        {/* Subtitle Paragraph */}
                        <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.75', maxWidth: '780px', margin: '0 auto 65px', textAlign: 'center' }}>
                            {servicesSubtitle}
                        </p>
                    </div>

                    {/* Staggered Floating Services Tag Cloud / Grid */}
                    <div 
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                            gap: '40px 32px',
                            justifyContent: 'center',
                            alignItems: 'start',
                            padding: '10px'
                        }}
                    >
                        {(services || []).map((srv, idx) => (
                            <div 
                                key={srv.id || idx} 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: idx % 3 === 1 ? 'center' : idx % 3 === 2 ? 'flex-end' : 'flex-start',
                                    textAlign: idx % 3 === 1 ? 'center' : idx % 3 === 2 ? 'right' : 'left',
                                    padding: '8px 12px',
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                {srv.prefix && (
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0891b2', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
                                        {srv.prefix}
                                    </span>
                                )}
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px', margin: 0, textTransform: 'uppercase', lineHeight: '1.25' }}>
                                    {srv.title}
                                </h3>
                                {srv.description && (
                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', margin: '6px 0 0', lineHeight: '1.4' }}>
                                        {srv.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </main>

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
