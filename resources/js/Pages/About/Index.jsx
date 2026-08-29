import React, { useState, useEffect } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';

export default function Index({ settings = {}, teamMembers = [] }) {
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

    const aboutTitle = getSetting('about_title', 'About Us');
    const aboutDesc = getSetting('about_description', `OMS Companion is a professional platform connecting Oral & Maxillofacial Surgeons, Oral Medicine specialists, and Oncologists to provide coordinated, expert care for patients with complex oral and maxillofacial conditions.

We promote specialist collaboration, timely referral, accurate diagnosis, and comprehensive treatment planning—helping dental surgeons manage more patients with greater confidence and better outcomes.

OMS Companion — Connecting Expertise, Enhancing Practice.`);

    // Group team members by level (1: Founder, 2: Row 2, 3: Row 3, 4: Bottom Center)
    const level1 = (teamMembers || []).filter(m => Number(m.level) === 1);
    const level2 = (teamMembers || []).filter(m => Number(m.level) === 2);
    const level3 = (teamMembers || []).filter(m => Number(m.level) === 3);
    const level4 = (teamMembers || []).filter(m => Number(m.level) === 4);

    const renderAvatarCircle = (member, size = 110) => {
        const initial = (member.name || 'D').replace(/^(DR|DR\.)\s*/i, '').charAt(0) || 'D';
        const isDefaultLandscape = member.image_path && member.image_path.includes('default_landscape');

        return (
            <div key={member.id} className="team-member-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: `${size + 70}px` }}>
                <div 
                    style={{ 
                        width: `${size}px`, 
                        height: `${size}px`, 
                        borderRadius: '50%', 
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.25)',
                        padding: '4px',
                        overflow: 'hidden'
                    }}
                >
                    {/* Inner SVG Pattern / Image */}
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e0f2fe', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {member.image_path && !isDefaultLandscape ? (
                            <img 
                                src={`/${member.image_path}`} 
                                alt={member.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #cff4fc 0%, #a5f3fc 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {/* Geometric grid background overlay */}
                                <svg style={{ position: 'absolute', inset: 0, opacity: 0.35, width: '100%', height: '100%' }} viewBox="0 0 100 100" fill="none">
                                    <path d="M0 20H100M0 40H100M0 60H100M0 80H100M20 0V100M40 0V100M60 0V100M80 0V100" stroke="#0891b2" strokeWidth="0.5" />
                                    <circle cx="50" cy="50" r="40" stroke="#0e7490" strokeWidth="1" strokeDasharray="3 3" />
                                </svg>
                                <span style={{ fontSize: `${Math.max(18, size * 0.35)}px`, fontWeight: '900', color: '#0e7490', textShadow: '0 2px 4px rgba(255,255,255,0.8)', zIndex: 2 }}>
                                    {initial}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <h4 style={{ fontSize: `${size >= 160 ? 17 : size >= 130 ? 15 : 13}px`, fontWeight: '800', color: '#0f172a', margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>
                    {member.name}
                </h4>

                {member.title && (
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', lineHeight: '1.3' }}>
                        {member.title}
                    </div>
                )}

                {member.specialization && (
                    <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', marginTop: '2px', lineHeight: '1.3' }}>
                        {member.specialization}
                    </div>
                )}

                {member.designation && (
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0d9488', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>
                        {member.designation}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="landing-wrapper page-colorful-theme" style={{ backgroundColor: '#ffffff' }}>
            <Head title={`About Us - ${site_name || 'OMSCOMPANION'}`} />

            {/* Header Navigation */}
            <PublicNavbar activePage="about" />

            {/* Main About Us Content */}
            <main style={{ padding: '60px 20px 80px', flex: '1 0 auto' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    
                    {/* About Us Heading & Description (Styled same as Services page) */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'inline-block', border: '1.5px solid #334155', borderRadius: '50px', padding: '6px 36px', marginBottom: '28px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <span style={{ textTransform: 'lowercase', fontSize: '24px', fontWeight: '500', color: '#0f172a', letterSpacing: '0.5px', textDecoration: 'underline' }}>
                                about us
                            </span>
                        </div>

                        {/* Description Box with purple border box outline matching Services page */}
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
                                    lineHeight: '1.65', 
                                    textAlign: 'center', 
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2px',
                                    whiteSpace: 'pre-line'
                                }}
                            >
                                {aboutDesc}
                            </h2>
                        </div>
                    </div>

                    {/* Team Hierarchy Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>

                        {/* Level 1: Founder (Top Center) */}
                        {level1.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                {level1.map(member => renderAvatarCircle(member, 160))}
                            </div>
                        )}

                        {/* Level 2: Row 2 (5 Members) */}
                        {level2.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px 24px', flexWrap: 'wrap', width: '100%' }}>
                                {level2.map(member => renderAvatarCircle(member, 110))}
                            </div>
                        )}

                        {/* Level 3: Row 3 (4 Members) */}
                        {level3.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px 28px', flexWrap: 'wrap', width: '100%' }}>
                                {level3.map(member => renderAvatarCircle(member, 115))}
                            </div>
                        )}

                        {/* Level 4: Bottom Center Specialist */}
                        {level4.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '10px' }}>
                                {level4.map(member => renderAvatarCircle(member, 140))}
                            </div>
                        )}

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
