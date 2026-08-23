import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login() {
    const { site_name, login_side_image, login_side_title, login_side_subtitle } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const sideImgSrc = login_side_image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200';

    return (
        <div className="auth-page page-colorful-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 15px' }}>
            <Head title={`Login - ${site_name || 'OMSCOMPANION'}`} />
            
            {/* Ambient Glow Spheres */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />

            <div className="auth-split-wrapper">
                
                {/* Top Navigation Bar */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" className="btn btn-outline nav-btn back-home-btn" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'var(--color-cyan, #06b6d4)',
                        borderColor: 'rgba(6, 182, 212, 0.4)',
                        background: 'rgba(6, 182, 212, 0.08)',
                        padding: '7px 16px',
                        borderRadius: '9999px',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s ease'
                    }}>
                        ← Back to Home
                    </Link>
                </div>

                <div className="glass-panel auth-split-card">
                    
                    {/* Left Column: Form */}
                    <div className="auth-form-column">
                        <div style={{ marginBottom: '16px' }}>
                            <Link href="/" style={{ display: 'inline-block' }}>
                                <ApplicationLogo height="38px" />
                            </Link>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '10px', marginBottom: '2px', letterSpacing: '-0.5px' }}>
                                Welcome Back!
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                                Referral & Membership Management System
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" htmlFor="login" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                                    Phone Number or Email Address
                                </label>
                                <input
                                    type="text"
                                    id="login"
                                    className="form-control"
                                    placeholder="Enter phone number or email"
                                    value={data.login}
                                    onChange={e => setData('login', e.target.value)}
                                    required
                                    autoComplete="username"
                                    style={{ padding: '10px 12px', borderRadius: '8px' }}
                                />
                                {errors.login && <span className="form-error">{errors.login}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" htmlFor="password" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    style={{ padding: '10px 12px', borderRadius: '8px' }}
                                />
                                {errors.password && <span className="form-error">{errors.password}</span>}
                            </div>

                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    style={{ width: 'auto', cursor: 'pointer' }}
                                />
                                <label className="form-label" htmlFor="remember" style={{ cursor: 'pointer', margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Remember me
                                </label>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary btn-glow hero-btn" style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', borderRadius: '8px' }} disabled={processing}>
                                    {processing ? 'Logging in...' : 'Login'}
                                </button>
                                
                                <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Don't have a membership?{' '}
                                    <Link href={route('register')} style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                                        Register Here
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Dynamic Side Image & Banner Overlay */}
                    <div className="auth-image-column">
                        <img 
                            src={sideImgSrc} 
                            alt={login_side_title || "Login Side Image"} 
                            className="auth-side-img"
                        />
                        <div className="auth-image-overlay">
                            <div className="auth-slider-dots">
                                <span className="auth-dot active" />
                                <span className="auth-dot" />
                                <span className="auth-dot" />
                                <span className="auth-dot" />
                            </div>
                            <h3 className="auth-side-title">
                                {login_side_title || 'Discover your next journey'}
                            </h3>
                            <p className="auth-side-subtitle">
                                {login_side_subtitle || 'Explore ideas, stories, and experiences designed to inspire your everyday life, guiding you through meaningful moments and fresh insights every day.'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
