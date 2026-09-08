import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PasswordInput from '@/Components/PasswordInput';

export default function Register() {
    const { site_name } = usePage().props;
    const [photoPreview, setPhotoPreview] = React.useState(null);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        avatar: null,
        doctor_type: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        bds_registration_number: '',
        clinic_name: '',
        address: '',
        password: '',
        password_confirmation: '',
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024) {
                alert('Profile photo must be less than 500 KB.');
                e.target.value = null;
                setData('avatar', null);
                setPhotoPreview(null);
                return;
            }
            setData('avatar', file);
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setData('avatar', null);
            setPhotoPreview(null);
        }
    };

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
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <Link href="/" style={{ display: 'inline-block' }}>
                            <ApplicationLogo height="36px" />
                        </Link>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '8px', marginBottom: '0px', letterSpacing: '-0.5px' }}>
                            Member Registration
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Profile Photo Upload */}
                        <div className="form-group" style={{ marginBottom: '14px', textAlign: 'center' }}>
                            <label className="form-label" htmlFor="avatar" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                                Profile Photo (Max 500 KB, Optional)
                            </label>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                                <div style={{ 
                                    width: '64px', 
                                    height: '64px', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'rgba(255,255,255,0.1)', 
                                    border: '2px dashed var(--color-cyan, #06b6d4)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '24px' }}>📷</span>
                                    )}
                                </div>

                                <div style={{ textAlign: 'left' }}>
                                    <input
                                        type="file"
                                        id="avatar"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handleAvatarChange}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '4px' }}>
                                        JPG, PNG or WEBP under 500 KB
                                    </div>
                                    {errors.avatar && <div className="form-error" style={{ fontSize: '11px', color: '#ef4444' }}>{errors.avatar}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="name" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Full Name *</label>
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

                        {/* Email Address */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="email" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Email Address *</label>
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

                        {/* Phone Number & WhatsApp Number */}
                        <div className="grid-2col-fixed-row" style={{ marginBottom: '10px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="phone" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Phone Number *</label>
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
                                <label className="form-label" htmlFor="whatsapp_number" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>WhatsApp Number</label>
                                <input
                                    type="text"
                                    id="whatsapp_number"
                                    className="form-control"
                                    placeholder="017XXXXXXXX"
                                    value={data.whatsapp_number}
                                    onChange={e => setData('whatsapp_number', e.target.value)}
                                    style={{ padding: '9px 12px', borderRadius: '8px' }}
                                />
                                {errors.whatsapp_number && <span className="form-error">{errors.whatsapp_number}</span>}
                            </div>
                        </div>

                        {/* Doctor Type Dropdown (just before Reg No) & Registration Number */}
                        <div className="grid-2col-fixed-row" style={{ marginBottom: '10px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="doctor_type" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>
                                    Doctor Type *
                                </label>
                                <select
                                    id="doctor_type"
                                    className="form-control"
                                    value={data.doctor_type}
                                    onChange={e => setData('doctor_type', e.target.value)}
                                    required
                                    style={{ padding: '9px 12px', borderRadius: '8px' }}
                                >
                                    <option value="">-- Select Type --</option>
                                    <option value="BDS">BDS Doctor</option>
                                    <option value="MBBS">MBBS Doctor</option>
                                </select>
                                {errors.doctor_type && <span className="form-error">{errors.doctor_type}</span>}
                            </div>

                            {data.doctor_type ? (
                                <div className="form-group" style={{ marginBottom: 0, animation: 'fadeIn 0.25s ease-in-out' }}>
                                    <label className="form-label" htmlFor="bds_registration_number" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>
                                        {data.doctor_type === 'BDS' ? 'BDS Reg No. *' : 'MBBS Reg No. *'}
                                    </label>
                                    <input
                                        type="text"
                                        id="bds_registration_number"
                                        className="form-control"
                                        placeholder={data.doctor_type === 'BDS' ? 'BDS Reg No.' : 'MBBS Reg No.'}
                                        value={data.bds_registration_number}
                                        onChange={e => setData('bds_registration_number', e.target.value)}
                                        required
                                        style={{ padding: '9px 12px', borderRadius: '8px' }}
                                    />
                                    {errors.bds_registration_number && <span className="form-error">{errors.bds_registration_number}</span>}
                                </div>
                            ) : (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px', color: 'var(--text-muted)' }}>
                                        Reg No.
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        className="form-control"
                                        placeholder="Select Doctor Type first"
                                        style={{ padding: '9px 12px', borderRadius: '8px', opacity: 0.6, cursor: 'not-allowed' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Clinic Name */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="clinic_name" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Clinic / Chamber Name *</label>
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

                        {/* Address */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" htmlFor="address" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Clinic Address *</label>
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

                        {/* Password & Confirm */}
                        <div className="grid-2col-fixed-row" style={{ marginBottom: '14px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="password" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Password *</label>
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
                                <label className="form-label" htmlFor="password_confirmation" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '3px' }}>Confirm Password *</label>
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
