import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

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
                
                {/* Refer a Patient Button */}
                <button 
                    type="button"
                    onClick={handleReferClick} 
                    className="btn btn-secondary nav-btn btn-gold-glow"
                    style={{ marginRight: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                    <span>📋</span> Refer a Patient
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
            </nav>
        </header>
    );
}
