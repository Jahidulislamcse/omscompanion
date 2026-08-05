import React, { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

export default function AdminLayout({ children, title }) {
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
                        <div className="sidebar-logo" style={{ marginBottom: 0 }}>
                            <span>&#128715;</span>
                            <div>Dentist<span>Chamber</span></div>
                        </div>
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
                                    href={route('admin.dashboard')} 
                                    className={`sidebar-link ${window.location.pathname === '/admin/dashboard' ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#128202;</span> Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={route('admin.members')} 
                                    className={`sidebar-link ${isCurrent('/admin/members') ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#128101;</span> Members
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={route('admin.referrals')} 
                                    className={`sidebar-link ${isCurrent('/admin/referrals') ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#128100;</span> Referrals
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={route('admin.videos')} 
                                    className={`sidebar-link ${isCurrent('/admin/videos') ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span>&#127916;</span> Video Library
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="sidebar-user">
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {auth.user.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '15px' }}>
                        Administrator
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
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Admin Portal</p>
                        </div>
                    </div>

                    <div className="navbar-user-info">
                        <button onClick={toggleTheme} className="btn btn-outline" style={{ padding: '8px 12px' }}>
                            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                        </button>
                        <div className="glass-panel online-badge" style={{ padding: '10px 18px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Admin Online</span>
                        </div>
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
