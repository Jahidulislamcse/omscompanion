import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Register() {
    const { site_name, login_side_image, login_side_title, login_side_subtitle } = usePage().props;
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

    const sideImgSrc = login_side_image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200';

    return (
        <div className="auth-page page-colorful-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 15px' }}>
            <Head title={`Register - ${site_name || 'OMSCOMPANION'}`} />
            
            {/* Ambient Glow Spheres */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />

            <div className="auth-split-wrapper" style={{ maxWidth: '1040px' }}>
                
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

                <div className="glass-panel auth-split-card">
                    
                    {/* Left Column: Form */}
                    <div className="auth-form-column" style={{ padding: '36px 32px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <Link href="/" style={{ display: 'inline-block' }}>
                                <ApplicationLogo height="40px" />
                            </Link>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                                Member Registration
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                                BDS Doctor & Chamber Referral Network
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Row 1: Name (single row) */}
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" htmlFor="name" style={{ fontWeight: '600', fontSize: '13px' }}>Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-control"
                                    placeholder="Dr. Full Name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    style={{ padding: '10px 14px', borderRadius: '8px' }}
                                />
                                {errors.name && <span className="form-error">{errors.name}</span>}
                            </div>

                            {/* Row 2: Email (single row, required) */}
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" htmlFor="email" style={{ fontWeight: '600', fontSize: '13px' }}>Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="doctor@example.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                    style={{ padding: '10px 14px', borderRadius: '8px' }}
                                />
                                {errors.email && <span className="form-error">{errors.email}</span>}
                            </div>

                            {/* Row 3: Phone and BDS Number (in a row) */}
                            <div className="grid-responsive-2col-equal" style={{ gap: '14px', marginBottom: '14px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" htmlFor="phone" style={{ fontWeight: '600', fontSize: '13px' }}>Phone Number</label>
                                    <input
                                        type="text"
                                        id="phone"
                                        className="form-control"
                                        placeholder="017XXXXXXXX"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        required
                                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                                    />
                                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" htmlFor="bds_registration_number" style={{ fontWeight: '600', fontSize: '13px' }}>BDS Reg No.</label>
                                    <input
                                        type="text"
                                        id="bds_registration_number"
                                        className="form-control"
                                        placeholder="BDS Reg No."
                                        value={data.bds_registration_number}
                                        onChange={e => setData('bds_registration_number', e.target.value)}
                                        required
                                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                                    />
                                    {errors.bds_registration_number && <span className="form-error">{errors.bds_registration_number}</span>}
                                </div>
                            </div>

                            {/* Row 4: Clinic Name (single row) */}
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" htmlFor="clinic_name" style={{ fontWeight: '600', fontSize: '13px' }}>Clinic / Chamber Name</label>
                                <input
                                    type="text"
                                    id="clinic_name"
                                    className="form-control"
                                    placeholder="Chamber Name"
                                    value={data.clinic_name}
                                    onChange={e => setData('clinic_name', e.target.value)}
                                    required
                                    style={{ padding: '10px 14px', borderRadius: '8px' }}
                                />
                                {errors.clinic_name && <span className="form-error">{errors.clinic_name}</span>}
                            </div>

                            {/* Row 5: Address (single row) */}
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" htmlFor="address" style={{ fontWeight: '600', fontSize: '13px' }}>Clinic Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    className="form-control"
                                    placeholder="City / Area Address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    required
                                    style={{ padding: '10px 14px', borderRadius: '8px' }}
                                />
                                {errors.address && <span className="form-error">{errors.address}</span>}
                            </div>

                            {/* Row 6: Password & Confirm (in a row) */}
                            <div className="grid-responsive-2col-equal" style={{ gap: '14px', marginBottom: '18px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" htmlFor="password" style={{ fontWeight: '600', fontSize: '13px' }}>Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                                    />
                                    {errors.password && <span className="form-error">{errors.password}</span>}
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" htmlFor="password_confirmation" style={{ fontWeight: '600', fontSize: '13px' }}>Confirm Password</label>
                                    <input
                                        type="password"
                                        id="password_confirmation"
                                        className="form-control"
                                        placeholder="Confirm"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        required
                                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary btn-glow hero-btn" style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', borderRadius: '8px' }} disabled={processing}>
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

                    {/* Right Column: Dynamic Side Image & Banner Overlay */}
                    <div className="auth-image-column">
                        <img 
                            src={sideImgSrc} 
                            alt={login_side_title || "Registration Side Image"} 
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
                                {login_side_title || 'Join the BDS Doctor Network'}
                            </h3>
                            <p className="auth-side-subtitle">
                                {login_side_subtitle || 'Gain free access to surgical video archives, online consultations, expert opinions, and referral pipelines.'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
