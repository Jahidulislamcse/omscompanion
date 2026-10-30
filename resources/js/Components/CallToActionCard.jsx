import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function CallToActionCard({ onReferralClick }) {
    const { auth, site_name } = usePage().props;

    const handleReferClick = (e) => {
        if (e) e.preventDefault();
        if (auth && auth.user) {
            router.visit(auth.user.role === 'admin' ? route('admin.referrals') : route('member.referrals'));
            return;
        }
        if (onReferralClick) {
            onReferralClick();
            return;
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-referral-modal'));
        }
    };

    const getDashboardRoute = () => {
        if (!auth || !auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    return (
        <section className="cta-banner-section" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '30px 20px 60px', boxSizing: 'border-box' }}>
            <div className="landing-section-container" style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
                <div className="glass-panel cta-banner-card" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <h2 className="cta-title">Ready to Elevate Your Dental Practice?</h2>
                    <p className="cta-desc">
                        Join hundreds of BDS Doctors using {site_name || 'OMS COMPANION'} for transparent referral tracking, clinical video masterclasses, and verified digital certificates.
                    </p>
                    
                    <div className="cta-buttons" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '440px', margin: '0 auto' }}>
                        {auth && auth.user ? (
                            <Link href={getDashboardRoute()} className="btn btn-secondary hero-btn btn-gold-glow" style={{ width: '100%', textAlign: 'center' }}>
                                Open Your Dashboard
                            </Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Link href={route('register')} className="btn btn-secondary hero-btn btn-gold-glow" style={{ flex: '1 1 180px', textAlign: 'center', padding: '12px 20px', fontSize: '15px', fontWeight: '700' }}>
                                    🌟 Registration
                                </Link>
                                <Link href={route('login')} className="btn btn-outline hero-btn" style={{ flex: '1 1 140px', textAlign: 'center', borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff', padding: '12px 20px', fontSize: '15px', fontWeight: '700' }}>
                                    Member Login
                                </Link>
                            </div>
                        )}

                        {/* Refer Patient Button (Under card buttons) */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                            <button 
                                type="button" 
                                onClick={handleReferClick}
                                className="refer-patient-glossy-btn"
                                aria-label="Refer Patient"
                                style={{ padding: '6px 12px 6px 6px' }}
                            >
                                <div className="refer-patient-icon-circle" style={{ width: '36px', height: '36px' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="4" y="4" width="16" height="17" rx="2" fill="#0891b2" fillOpacity="0.12" stroke="#0e7490" strokeWidth="2"/>
                                        <path d="M9 3H15V6H9V3Z" fill="#0891b2" stroke="#0e7490" strokeWidth="1.5"/>
                                        <circle cx="12" cy="4.5" r="1" fill="#ffffff"/>
                                        <circle cx="12" cy="10.5" r="2" fill="#0e7490"/>
                                        <path d="M8.5 15C8.5 13.5 10 13 12 13C14 13 15.5 13.5 15.5 15" stroke="#0e7490" strokeWidth="1.8" strokeLinecap="round"/>
                                        <path d="M12 17.5V20.5M10.5 19H13.5" stroke="#0891b2" strokeWidth="2.2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <span className="refer-patient-text" style={{ fontSize: '16px', margin: '0 16px 0 12px' }}>Refer Patient</span>
                                <div className="refer-patient-arrow-circle" style={{ width: '32px', height: '32px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="4" y1="12" x2="20" y2="12" />
                                        <polyline points="13 5 20 12 13 19" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
