import { useForm, Head, Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PasswordInput from '@/Components/PasswordInput';

export default function ResetPassword({ token, email }) {
    const { site_name } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('password.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="auth-page page-colorful-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 15px' }}>
            <Head title={`Reset Password - ${site_name || 'OMSCOMPANION'}`} />

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
                            Reset Your Password
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                            Choose a strong new password for your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="token" value={data.token} />

                        {/* Email Address (Pre-filled / Readonly) */}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" htmlFor="email" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                                readOnly={Boolean(email)}
                                style={{
                                    padding: '11px 14px',
                                    borderRadius: '10px',
                                    backgroundColor: email ? 'rgba(255, 255, 255, 0.04)' : undefined,
                                    cursor: email ? 'not-allowed' : 'text',
                                }}
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        {/* New Password */}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" htmlFor="password" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
                                New Password (min 8 characters)
                            </label>
                            <PasswordInput
                                id="password"
                                placeholder="Enter new password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                required
                                autoComplete="new-password"
                                autoFocus
                                style={{ padding: '11px 14px', borderRadius: '10px' }}
                            />
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group" style={{ marginBottom: '22px' }}>
                            <label className="form-label" htmlFor="password_confirmation" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
                                Confirm New Password
                            </label>
                            <PasswordInput
                                id="password_confirmation"
                                placeholder="Re-enter new password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                required
                                autoComplete="new-password"
                                style={{ padding: '11px 14px', borderRadius: '10px' }}
                            />
                            {errors.password_confirmation && <span className="form-error">{errors.password_confirmation}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-glow hero-btn"
                                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', borderRadius: '10px' }}
                                disabled={processing}
                            >
                                {processing ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
