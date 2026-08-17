import React, { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function MemberLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const isCurrent = (name) => {
        return window.location.pathname.startsWith(name);
    };

    return (
        <div className="app-container">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <Link href={route('member.dashboard')}>
                            <ApplicationLogo />
                        </Link>
                        <button 
                            className="mobile-close-btn"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <nav>
                        <ul className="sidebar-menu">
                            <li>
                                <Link 
                                    href={route('member.dashboard')} 
                                    className={`sidebar-link ${window.location.pathname === '/member/dashboard' ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#128187;</span> Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={route('member.referrals')} 
                                    className={`sidebar-link ${window.location.pathname === '/member/referrals' ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#128100;</span> Patient Referral
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={route('member.videos')} 
                                    className={`sidebar-link ${isCurrent('/member/videos') ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#127916;</span> Premium Videos
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={route('member.notifications')} 
                                    className={`sidebar-link ${isCurrent('/member/notifications') ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#128276;</span> Notifications
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={route('member.profile')} 
                                    className={`sidebar-link ${isCurrent('/member/profile') ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#128101;</span> My Profile
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="sidebar-user">
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {auth.user.bds_registration_number ? `Dr. ${auth.user.name}` : auth.user.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '700', marginBottom: '4px' }}>
                        ID: {auth.user.member_id}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '15px' }}>
                        {auth.user.clinic_name}
                    </div>
                    <a href="#" onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', fontSize: '13px' }}>
                        Logout
                    </a>
                </div>
            </aside>

            {/* Main Area */}
            <main className="app-main">
                <header className="app-navbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Hamburger Button */}
                        <button 
                            className="hamburger-btn"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            ☰
                        </button>
                        <div>
                            <h1 style={{ fontSize: '24px', margin: 0 }}>{title}</h1>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>BDS Doctor Portal</p>
                        </div>
                    </div>

                    <div className="navbar-user-info">
                        <button onClick={toggleTheme} className="btn btn-outline" style={{ padding: '8px 12px' }}>
                            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                        </button>
                    </div>
                </header>

                {flash?.success && (
                    <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-success)', padding: '12px 20px', color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg)' }}>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-danger)', padding: '12px 20px', color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-bg)' }}>
                        {flash.error}
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
