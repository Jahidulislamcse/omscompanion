import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="auth-page">
            <Head title="Login" />
            
            <div className="glass-panel auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span>&#128715;</span> Dentist<span>Chamber</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>
                        Referral & Membership Management System
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
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
                        <label className="form-label" htmlFor="remember" style={{ cursor: 'pointer', margin: 0 }}>
                            Remember me
                        </label>
                    </div>

                    <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={processing}>
                            {processing ? 'Logging in...' : 'Login'}
                        </button>
                        
                        <div style={{ textAlign: 'center', fontSize: '13px' }}>
                            Don't have a membership?{' '}
                            <Link href={route('register')} style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                                Register Here
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
