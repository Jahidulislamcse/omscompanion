import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login() {
    const { site_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="auth-page page-colorful-theme">
            <Head title={`Login - ${site_name || 'OMSCOMPANION'}`} />
            
            {/* Ambient Glow Spheres */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />

            <div className="auth-container" style={{ width: '100%', maxWidth: '480px', margin: '0 auto', zIndex: 1, position: 'relative' }}>
                
                {/* Back to Home Button */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
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

                <div className="glass-panel auth-card">
                    <div className="auth-header">
                        <Link href="/" style={{ display: 'inline-block' }}>
                            <ApplicationLogo height="40px" />
                        </Link>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                            Referral & Membership Management System
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login">Phone Number or Email Address</label>
                            <input
                                type="text"
                                id="login"
                                className="form-control"
                                placeholder="Enter phone number or email"
                                value={data.login}
                                onChange={e => setData('login', e.target.value)}
                                required
                                autoComplete="username"
                            />
                            {errors.login && <span className="form-error">{errors.login}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </div>

                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            <label className="form-label" htmlFor="remember" style={{ cursor: 'pointer', margin: 0, fontSize: '13px' }}>
                                Remember me
                            </label>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary btn-glow hero-btn" style={{ width: '100%', padding: '12px' }} disabled={processing}>
                                {processing ? 'Logging in...' : 'Login'}
                            </button>
                            
                            <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '4px' }}>
                                Don't have a membership?{' '}
                                <Link href={route('register')} style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                                    Register Here
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
