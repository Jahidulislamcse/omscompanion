import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PasswordInput from '@/Components/PasswordInput';

export default function Profile({ user }) {
    const [successMsg, setSuccessMsg] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSuccessMsg('');
        post(route('admin.profile.update'), {
            onSuccess: () => {
                setSuccessMsg('Admin profile and security credentials updated successfully!');
                reset('password', 'password_confirmation');
            }
        });
    };

    return (
        <AdminLayout title="Admin Profile & Security Settings">
            <Head title="Admin Profile" />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {successMsg && (
                    <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-success)', padding: '14px 20px', color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg)', marginBottom: '20px', fontWeight: '600' }}>
                        {successMsg}
                    </div>
                )}

                <div className="glass-panel">
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0 }}>Administrator Identity & Account Settings</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Update your personal contact information and admin portal credentials.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Admin Full Name</label>
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
                            <label className="form-label" htmlFor="email">Admin Email Address</label>
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

                        <div className="form-group">
                            <label className="form-label" htmlFor="phone">Phone Number (Optional)</label>
                            <input 
                                type="text"
                                id="phone"
                                className="form-control"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="Enter phone number..."
                            />
                            {errors.phone && <span className="form-error">{errors.phone}</span>}
                        </div>

                        <div style={{ margin: '30px 0 20px 0', borderTop: '1px dashed var(--border-color)', paddingTop: '20px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Security & Password Update</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                                Leave password fields blank if you do not wish to change your password.
                            </p>
                        </div>

                        <div className="grid-responsive-two-col" style={{ gap: '15px' }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">New Password</label>
                                <PasswordInput 
                                    id="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                {errors.password && <span className="form-error">{errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password_confirmation">Confirm New Password</label>
                                <PasswordInput 
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }} disabled={processing}>
                                {processing ? 'Saving Changes...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
