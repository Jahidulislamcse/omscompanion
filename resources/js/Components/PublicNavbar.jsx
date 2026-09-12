import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import WhatsAppWidget from '@/Components/WhatsAppWidget';

export default function PublicNavbar({ activePage = '', onReferralClick }) {
    const { auth } = usePage().props;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const getDashboardRoute = () => {
        if (!auth || !auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const handleReferClick = (e) => {
        if (onReferralClick) {
            e.preventDefault();
            onReferralClick();
        } else {
            // If on a sub-page without referral modal, redirect to homepage with referral trigger
            window.location.href = '/?referral=open';
        }
    };

    return (
        <>
            <header className="glass-panel landing-header header-sticky">
                <Link href="/" className="landing-brand-link">
                    <ApplicationLogo />
                </Link>

                <button 
                    type="button" 
                    className="mobile-menu-toggle"
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {mobileNavOpen ? (
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', lineHeight: 1 }}>✕</span>
                    ) : (
                        <>
                            <span className="hamburger-bar" />
                            <span className="hamburger-bar" />
                            <span className="hamburger-bar" />
                        </>
                    )}
                </button>

                <nav className={`landing-nav ${mobileNavOpen ? 'mobile-nav-open' : ''}`}>
                    <div className="landing-nav-links">
                        <Link 
                            href="/" 
                            className={`nav-link-item ${activePage === 'home' ? 'active-nav-item' : ''}`} 
                            onClick={() => setMobileNavOpen(false)}
                        >
                            Home
                        </Link>
                        <Link 
                            href={route('videos.public')} 
                            className={`nav-link-item ${activePage === 'archive' ? 'active-nav-item' : ''}`} 
                            onClick={() => setMobileNavOpen(false)}
                        >
                            Archive
                        </Link>
                        <Link 
                            href={route('about')} 
                            className={`nav-link-item ${activePage === 'about' ? 'active-nav-item' : ''}`} 
                            onClick={() => setMobileNavOpen(false)}
                        >
                            About
                        </Link>
                        <Link 
                            href={route('services')} 
                            className={`nav-link-item ${activePage === 'services' ? 'active-nav-item' : ''}`} 
                            onClick={() => setMobileNavOpen(false)}
                        >
                            Services
                        </Link>
                        <Link 
                            href={route('contact')} 
                            className={`nav-link-item ${activePage === 'contact' ? 'active-nav-item' : ''}`} 
                            onClick={() => setMobileNavOpen(false)}
                        >
                            Contact
                        </Link>
                        <Link 
                            href={route('app.download')} 
                            className={`nav-link-item ${activePage === 'app_download' ? 'active-nav-item' : ''}`} 
                            onClick={() => setMobileNavOpen(false)}
                        >
                            📱 Install Mobile App
                        </Link>
                    </div>
                    
                    <div className="landing-nav-actions">
                        {/* Refer Patient Glossy Button */}
                        <button 
                            type="button" 
                            onClick={handleReferClick}
                            className="refer-patient-glossy-btn nav-refer-btn"
                            aria-label="Refer Patient"
                        >
                            <div className="refer-patient-icon-circle">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="4" y="4" width="16" height="17" rx="2" fill="#0891b2" fillOpacity="0.12" stroke="#0e7490" strokeWidth="2"/>
                                    <path d="M9 3H15V6H9V3Z" fill="#0891b2" stroke="#0e7490" strokeWidth="1.5"/>
                                    <circle cx="12" cy="4.5" r="1" fill="#ffffff"/>
                                    <circle cx="12" cy="10.5" r="2" fill="#0e7490"/>
                                    <path d="M8.5 15C8.5 13.5 10 13 12 13C14 13 15.5 15" stroke="#0e7490" strokeWidth="1.8" strokeLinecap="round"/>
                                    <path d="M12 17.5V20.5M10.5 19H13.5" stroke="#0891b2" strokeWidth="2.2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <span className="refer-patient-text">Refer Patient</span>
                            <div className="refer-patient-arrow-circle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" y1="12" x2="20" y2="12" />
                                    <polyline points="13 5 20 12 13 19" />
                                </svg>
                            </div>
                        </button>

                        {auth && auth.user ? (
                            <Link href={getDashboardRoute()} className="btn btn-primary nav-btn btn-glow" onClick={() => setMobileNavOpen(false)}>
                                Dashboard →
                            </Link>
                        ) : (
                            <div className="landing-auth-buttons">
                                <Link href={route('login')} className="btn btn-outline nav-btn" onClick={() => setMobileNavOpen(false)}>
                                    Login
                                </Link>
                                <Link href={route('register')} className="btn btn-primary nav-btn btn-glow" onClick={() => setMobileNavOpen(false)}>
                                    Registration
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            {/* Bumping Floating WhatsApp Widget for Front Pages */}
            <WhatsAppWidget />
        </>
    );
}
