import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function Profile({ user }) {
    const [photoPreview, setPhotoPreview] = React.useState(user.avatar_url || null);
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        phone: user.phone || '',
        clinic_name: user.clinic_name || '',
        address: user.address || '',
        avatar: null,
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024) {
                alert('Profile photo must be less than 500 KB.');
                e.target.value = null;
                setData('avatar', null);
                setPhotoPreview(user.avatar_url || null);
                return;
            }
            setData('avatar', file);
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setData('avatar', null);
            setPhotoPreview(user.avatar_url || null);
        }
    };

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
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                        {photoPreview ? (
                            <img src={photoPreview} alt={user.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }} />
                        ) : (
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                            </div>
                        )}
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: '800' }}>
                                {user.bds_registration_number ? `Dr. ${user.name}` : user.name}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                                Member ID: {user.member_id}
                            </div>
                        </div>
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
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" htmlFor="avatar" style={{ fontWeight: '600', fontSize: '13px' }}>Profile Photo (Max 500 KB)</label>
                            <input 
                                type="file"
                                id="avatar"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={handleAvatarChange}
                                className="form-control"
                                style={{ padding: '6px 12px' }}
                            />
                            {errors.avatar && <span className="form-error">{errors.avatar}</span>}
                        </div>

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
