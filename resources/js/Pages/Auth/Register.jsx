import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

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
        <div className="auth-page page-colorful-theme">
            <Head title={`Register - ${site_name || 'DentistChamber'}`} />
            
            {/* Ambient Glow Spheres */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />

            <div className="auth-container" style={{ width: '100%', maxWidth: '640px', margin: '0 auto', zIndex: 1, position: 'relative' }}>
                
                {/* Back to Home Button */}
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                    <Link href="/" className="btn btn-outline nav-btn back-home-btn" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--color-cyan, #06b6d4)',
                        borderColor: 'rgba(6, 182, 212, 0.4)',
                        background: 'rgba(6, 182, 212, 0.08)',
                        padding: '6px 14px',
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
                            <ApplicationLogo height="36px" />
                        </Link>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px', margin: 0 }}>
                            BDS Doctor & Chamber Member Registration
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Row 1: Name & Phone */}
                        <div className="grid-responsive-2col-equal">
                            <div className="form-group">
                                <label className="form-label" htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-control"
                                    placeholder="Dr. Full Name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <span className="form-error">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="phone">Phone Number</label>
                                <input
                                    type="text"
                                    id="phone"
                                    className="form-control"
                                    placeholder="017XXXXXXXX"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    required
                                />
                                {errors.phone && <span className="form-error">{errors.phone}</span>}
                            </div>
                        </div>

                        {/* Row 2: Email & BDS Reg No */}
                        <div className="grid-responsive-2col-equal">
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">
                                    Email <span style={{ fontWeight: 'normal', fontSize: '11px', color: 'var(--text-muted)' }}>(Optional)</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="Optional email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                />
                                {errors.email && <span className="form-error">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="bds_registration_number">
                                    BDS Reg No. <span style={{ fontWeight: 'normal', fontSize: '11px', color: 'var(--text-muted)' }}>(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="bds_registration_number"
                                    className="form-control"
                                    placeholder="BDS Reg No."
                                    value={data.bds_registration_number}
                                    onChange={e => setData('bds_registration_number', e.target.value)}
                                />
                                {errors.bds_registration_number && <span className="form-error">{errors.bds_registration_number}</span>}
                            </div>
                        </div>

                        {/* Row 3: Clinic Name & Address */}
                        <div className="grid-responsive-2col-equal">
                            <div className="form-group">
                                <label className="form-label" htmlFor="clinic_name">Clinic / Chamber Name</label>
                                <input
                                    type="text"
                                    id="clinic_name"
                                    className="form-control"
                                    placeholder="Chamber Name"
                                    value={data.clinic_name}
                                    onChange={e => setData('clinic_name', e.target.value)}
                                    required
                                />
                                {errors.clinic_name && <span className="form-error">{errors.clinic_name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="address">Clinic Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    className="form-control"
                                    placeholder="City / Area Address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    required
                                />
                                {errors.address && <span className="form-error">{errors.address}</span>}
                            </div>
                        </div>

                        {/* Row 4: Password & Confirm */}
                        <div className="grid-responsive-2col-equal">
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <span className="form-error">{errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password_confirmation">Confirm Password</label>
                                <input
                                    type="password"
                                    id="password_confirmation"
                                    className="form-control"
                                    placeholder="Confirm"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary btn-glow hero-btn" style={{ width: '100%', padding: '10px' }} disabled={processing}>
                                {processing ? 'Submitting request...' : 'Register'}
                            </button>
                            
                            <div style={{ textAlign: 'center', fontSize: '12px' }}>
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
