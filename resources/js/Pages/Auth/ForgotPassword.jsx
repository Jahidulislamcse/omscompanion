import { useForm, Head, Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ForgotPassword({ status }) {
    const { site_name, flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const successMessage = status || flash?.status;

    return (
        <div className="auth-page page-colorful-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 15px' }}>
            <Head title={`Forgot Password - ${site_name || 'OMSCOMPANION'}`} />

            {/* Ambient Glow Spheres */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />

            <div className="auth-container" style={{ width: '100%', maxWidth: '480px', margin: '0 auto', zIndex: 1, position: 'relative' }}>
                
                {/* Back to Login Button */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                    <Link href={route('login')} className="btn btn-outline nav-btn back-home-btn" style={{
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
                        ← Back to Login
                    </Link>
                </div>

                <div className="glass-panel modal-card-colorful" style={{ padding: '32px 28px', borderRadius: '20px' }}>
                    <div style={{ marginBottom: '22px', textAlign: 'center' }}>
                        <Link href="/" style={{ display: 'inline-block' }}>
                            <ApplicationLogo height="42px" />
                        </Link>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '14px', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                            Forgot Password?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                            Enter your registered email address and we'll send you a secure link to reset your password.
                        </p>
                    </div>

                    {successMessage && (
                        <div style={{
                            padding: '14px 16px',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '20px',
                            lineHeight: '1.5',
                            textAlign: 'center'
                        }}>
                            ✉️ {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '18px' }}>
                            <label className="form-label" htmlFor="email" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
                                Registered Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="doctor@example.com"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                autoFocus
                                style={{ padding: '11px 14px', borderRadius: '10px' }}
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-glow hero-btn"
                                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', borderRadius: '10px' }}
                                disabled={processing}
                            >
                                {processing ? 'Sending Reset Link...' : 'Email Password Reset Link'}
                            </button>
                            
                            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Remembered your password?{' '}
                                <Link href={route('login')} style={{ color: 'var(--color-cyan, #06b6d4)', fontWeight: 'bold' }}>
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
