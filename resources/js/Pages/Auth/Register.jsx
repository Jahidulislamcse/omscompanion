import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PasswordInput from '@/Components/PasswordInput';

export default function Register() {
    const { site_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        bds_registration_number: '',
        clinic_name: '',
        address: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="auth-page page-colorful-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px 10px' }}>
            <Head title={`Register - ${site_name || 'OMSCOMPANION'}`} />
            
            {/* Ambient Glow Spheres */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />

            <div className="auth-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', zIndex: 1, position: 'relative' }}>
                
                {/* Back to Home Button */}
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-start' }}>
                    <Link href="/" className="btn btn-outline nav-btn back-home-btn" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--color-cyan, #06b6d4)',
                        borderColor: 'rgba(6, 182, 212, 0.4)',
                        background: 'rgba(6, 182, 212, 0.08)',
                        padding: '5px 14px',
                        borderRadius: '9999px',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s ease'
                    }}>
                        ← Back to Home
                    </Link>
                </div>

                <div className="glass-panel auth-card" style={{ padding: '24px 24px' }}>
                    <div style={{ marginBottom: '14px', textAlign: 'center' }}>
                        <Link href="/" style={{ display: 'inline-block' }}>
                            <ApplicationLogo height="36px" />
                        </Link>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '8px', marginBottom: '2px', letterSpacing: '-0.5px' }}>
                            Member Registration
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
                            BDS Doctor & Chamber Referral Network
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Row 1: Name (single row) */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="name" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Full Name</label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                placeholder="Dr. Full Name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                                style={{ padding: '9px 12px', borderRadius: '8px' }}
                            />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>

                        {/* Row 2: Email (single row, required) */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="email" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="doctor@example.com"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                                style={{ padding: '9px 12px', borderRadius: '8px' }}
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        {/* Row 3: Phone and BDS Number (in a row on all screen sizes including mobile) */}
                        <div className="grid-2col-fixed-row" style={{ marginBottom: '10px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="phone" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Phone Number</label>
                                <input
                                    type="text"
                                    id="phone"
                                    className="form-control"
                                    placeholder="017XXXXXXXX"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    required
                                    style={{ padding: '9px 12px', borderRadius: '8px' }}
                                />
                                {errors.phone && <span className="form-error">{errors.phone}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="bds_registration_number" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>BDS Reg No.</label>
                                <input
                                    type="text"
                                    id="bds_registration_number"
                                    className="form-control"
                                    placeholder="BDS Reg No."
                                    value={data.bds_registration_number}
                                    onChange={e => setData('bds_registration_number', e.target.value)}
                                    required
                                    style={{ padding: '9px 12px', borderRadius: '8px' }}
                                />
                                {errors.bds_registration_number && <span className="form-error">{errors.bds_registration_number}</span>}
                            </div>
                        </div>

                        {/* Row 4: Clinic Name (single row) */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="clinic_name" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Clinic / Chamber Name</label>
                            <input
                                type="text"
                                id="clinic_name"
                                className="form-control"
                                placeholder="Chamber Name"
                                value={data.clinic_name}
                                onChange={e => setData('clinic_name', e.target.value)}
                                required
                                style={{ padding: '9px 12px', borderRadius: '8px' }}
                            />
                            {errors.clinic_name && <span className="form-error">{errors.clinic_name}</span>}
                        </div>

                        {/* Row 5: Address (single row) */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="address" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Clinic Address</label>
                            <input
                                type="text"
                                id="address"
                                className="form-control"
                                placeholder="City / Area Address"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                required
                                style={{ padding: '9px 12px', borderRadius: '8px' }}
                            />
                            {errors.address && <span className="form-error">{errors.address}</span>}
                        </div>

                        {/* Row 6: Password & Confirm (in a row on all screen sizes including mobile) */}
                        <div className="grid-2col-fixed-row" style={{ marginBottom: '14px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="password" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Password</label>
                                <PasswordInput
                                    id="password"
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                    style={{ padding: '9px 12px', borderRadius: '8px' }}
                                />
                                {errors.password && <span className="form-error">{errors.password}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="password_confirmation" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Confirm Password</label>
                                <PasswordInput
                                    id="password_confirmation"
                                    placeholder="Confirm"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    required
                                    style={{ padding: '9px 12px', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button type="submit" className="btn btn-primary btn-glow hero-btn" style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: '700', borderRadius: '8px' }} disabled={processing}>
                                {processing ? 'Submitting request...' : 'Register'}
                            </button>
                            
                            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                                Already have an account?{' '}
                                <Link href={route('login')} style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                                    Login Here
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
