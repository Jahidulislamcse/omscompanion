import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
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
        <div className="auth-page">
            <Head title="Member Registration" />
            
            <div className="glass-panel auth-card" style={{ maxWidth: '600px' }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <span>&#128715;</span> Dentist<span>Chamber</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>
                        BDS Doctor Membership Registration Form
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="phone">Phone Number</label>
                            <input
                                type="text"
                                id="phone"
                                className="form-control"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                required
                            />
                            {errors.phone && <span className="form-error">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="bds_registration_number">BDS Registration No.</label>
                            <input
                                type="text"
                                id="bds_registration_number"
                                className="form-control"
                                value={data.bds_registration_number}
                                onChange={e => setData('bds_registration_number', e.target.value)}
                                required
                            />
                            {errors.bds_registration_number && <span className="form-error">{errors.bds_registration_number}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="clinic_name">Clinic / Business Name</label>
                        <input
                            type="text"
                            id="clinic_name"
                            className="form-control"
                            value={data.clinic_name}
                            onChange={e => setData('clinic_name', e.target.value)}
                            required
                        />
                        {errors.clinic_name && <span className="form-error">{errors.clinic_name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="address">Clinic Address</label>
                        <textarea
                            id="address"
                            className="form-control"
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            rows="2"
                            required
                            style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                        {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
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
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={processing}>
                            {processing ? 'Submitting request...' : 'Register'}
                        </button>
                        
                        <div style={{ textAlign: 'center', fontSize: '13px' }}>
                            Already have an account?{' '}
                            <Link href={route('login')} style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                                Login Here
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
