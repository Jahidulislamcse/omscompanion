import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function Profile({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        phone: user.phone || '',
        clinic_name: user.clinic_name || '',
        address: user.address || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('member.profile.update'), {
            onSuccess: () => {
                alert('Profile updated successfully!');
            }
        });
    };

    return (
        <MemberLayout title="My Profile Settings">
            <Head title="My Profile" />

            <div className="grid-responsive-two-col">
                {/* Account Details Cards */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0 }}>Membership Identity</h3>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}></div>
                    
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unique Member ID</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-gold)' }}>{user.member_id}</div>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BDS Registration Number</div>
                        <code style={{ background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', fontSize: '13px', marginTop: '4px' }}>
                            {user.bds_registration_number}
                        </code>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Email</div>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{user.email}</div>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approval Date</div>
                        <div style={{ fontSize: '14px' }}>
                            {user.approved_at ? new Date(user.approved_at).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Edit Form Card */}
                <div className="glass-panel">
                    <h3 style={{ marginBottom: '20px' }}>Update Clinic Information</h3>

                    <form onSubmit={handleSubmit}>
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
                            <label className="form-label" htmlFor="clinic_name">Clinic / Practice Name</label>
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
                                rows="4"
                                required
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                            />
                            {errors.address && <span className="form-error">{errors.address}</span>}
                        </div>

                        <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} disabled={processing}>
                            {processing ? 'Saving changes...' : 'Save Clinic Information'}
                        </button>
                    </form>
                </div>
            </div>
        </MemberLayout>
    );
}
