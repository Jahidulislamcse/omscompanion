import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PageContent({ settings = {}, teamMembers = [] }) {
    const { site_logo: currentLogo } = usePage().props;
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [loginPreview, setLoginPreview] = useState(null);

    // Modal state for Team Member add/edit
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [memberImagePreview, setMemberImagePreview] = useState(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        site_name: settings.site_name || 'OMSCOMPANION',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        goal_1_title: settings.goal_1_title || '',
        goal_1_desc: settings.goal_1_desc || '',
        goal_2_title: settings.goal_2_title || '',
        goal_2_desc: settings.goal_2_desc || '',
        goal_3_title: settings.goal_3_title || '',
        goal_3_desc: settings.goal_3_desc || '',
        goal_4_title: settings.goal_4_title || '',
        goal_4_desc: settings.goal_4_desc || '',
        footer_office_location: settings.footer_office_location || '',
        footer_contact_phone: settings.footer_contact_phone || '',
        footer_contact_email: settings.footer_contact_email || '',
        footer_facebook_url: settings.footer_facebook_url || '',
        site_logo: null,
        remove_logo: false,
        hero_banner: null,
        remove_banner: false,
        login_side_title: settings.login_side_title || '',
        login_side_subtitle: settings.login_side_subtitle || '',
        login_side_image: null,
        remove_login_image: false,
        about_title: settings.about_title || 'About Us',
        about_description: settings.about_description || '',
    });

    const memberForm = useForm({
        name: '',
        title: '',
        specialization: '',
        designation: '',
        level: 2,
        order_index: 0,
        image: null,
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData(data => ({ ...data, site_logo: file, remove_logo: false }));
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        setData(data => ({ ...data, site_logo: null, remove_logo: true }));
        setLogoPreview(null);
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData(data => ({ ...data, hero_banner: file, remove_banner: false }));
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveBanner = () => {
        setData(data => ({ ...data, hero_banner: null, remove_banner: true }));
        setBannerPreview(null);
    };

    const handleLoginImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData(data => ({ ...data, login_side_image: file, remove_login_image: false }));
            setLoginPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLoginImage = () => {
        setData(data => ({ ...data, login_side_image: null, remove_login_image: true }));
        setLoginPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.page_content.update'), {
            forceFormData: true,
            onSuccess: () => {
                alert('Site settings & page content updated successfully!');
            }
        });
    };

    const openAddMemberModal = () => {
        setEditingMember(null);
        setMemberImagePreview(null);
        memberForm.setData({
            name: '',
            title: '',
            specialization: '',
            designation: '',
            level: 2,
            order_index: teamMembers.length + 1,
            image: null,
        });
        setTeamModalOpen(true);
    };

    const openEditMemberModal = (member) => {
        setEditingMember(member);
        setMemberImagePreview(member.image_path ? `/${member.image_path}` : null);
        memberForm.setData({
            name: member.name || '',
            title: member.title || '',
            specialization: member.specialization || '',
            designation: member.designation || '',
            level: member.level || 2,
            order_index: member.order_index || 0,
            image: null,
        });
        setTeamModalOpen(true);
    };

    const handleMemberSubmit = (e) => {
        e.preventDefault();
        if (editingMember) {
            memberForm.post(route('admin.team.update', editingMember.id), {
                forceFormData: true,
                onSuccess: () => {
                    setTeamModalOpen(false);
                    alert('Team member updated successfully!');
                }
            });
        } else {
            memberForm.post(route('admin.team.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setTeamModalOpen(false);
                    alert('Team member added successfully!');
                }
            });
        }
    };

    const handleDeleteMember = (member) => {
        if (confirm(`Are you sure you want to delete ${member.name}?`)) {
            router.delete(route('admin.team.destroy', member.id));
        }
    };

    const getLevelName = (lvl) => {
        switch (Number(lvl)) {
            case 1: return 'Level 1: Founder (Top Center)';
            case 2: return 'Level 2: Core Team (Row 2)';
            case 3: return 'Level 3: Specialists (Row 3)';
            case 4: return 'Level 4: Bottom Specialist';
            default: return `Level ${lvl}`;
        }
    };

    return (
        <AdminLayout title="Manage Landing Page & About Us">
            <Head title="Site Branding & Content" />

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {recentlySuccessful && (
                    <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-success)', color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg)', padding: '12px 20px', marginBottom: '20px' }}>
                        ✓ Settings updated successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Site Branding / Logo Section */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            🖼️ Site Logo & Branding
                        </h3>
                        
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Site Brand Title / Name</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={data.site_name}
                                onChange={e => setData('site_name', e.target.value)}
                                placeholder="e.g. OMSCOMPANION"
                            />
                            {errors.site_name && <span className="form-error">{errors.site_name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Current Active Logo Preview</label>
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', minWidth: '220px' }}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Preview" style={{ maxHeight: '45px', objectFit: 'contain' }} />
                                ) : data.remove_logo ? (
                                    <div style={{ fontWeight: 800, fontSize: '18px' }}>
                                        🦷 OMS<span style={{ color: 'var(--accent-gold, #f59e0b)' }}>COMPANION</span> (Default)
                                    </div>
                                ) : (
                                    <ApplicationLogo height="45px" />
                                )}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label className="form-label">Upload Custom Site Logo (PNG, JPG, SVG, WebP)</label>
                            <input 
                                type="file" 
                                className="form-control"
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                            {errors.site_logo && <span className="form-error">{errors.site_logo}</span>}
                        </div>
                    </div>

                    {/* About Us Page Config Section */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-teal)' }}>
                            📖 About Us Page Configuration
                        </h3>

                        <div className="form-group" style={{ marginBottom: '18px' }}>
                            <label className="form-label">About Page Title</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={data.about_title}
                                onChange={e => setData('about_title', e.target.value)}
                                placeholder="e.g. About Us"
                            />
                            {errors.about_title && <span className="form-error">{errors.about_title}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">About Page Description & Introduction</label>
                            <textarea 
                                className="form-control"
                                value={data.about_description}
                                onChange={e => setData('about_description', e.target.value)}
                                rows="6"
                                placeholder="Enter full platform description for the /about page..."
                            />
                            {errors.about_description && <span className="form-error">{errors.about_description}</span>}
                        </div>
                    </div>

                    {/* Team Members Management */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent-teal)' }}>
                                👨‍⚕️ About Us Team Members ({teamMembers.length})
                            </h3>
                            <button 
                                type="button" 
                                onClick={openAddMemberModal} 
                                className="btn btn-primary"
                                style={{ padding: '6px 16px', fontSize: '13px' }}
                            >
                                ➕ Add Team Member
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {teamMembers.length > 0 ? (
                                teamMembers.map((member) => (
                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#0e7490', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', overflow: 'hidden' }}>
                                                {member.image_path ? (
                                                    <img src={`/${member.image_path}`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    (member.name || 'D').charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{member.name}</h4>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {member.title ? `${member.title} • ` : ''}{member.specialization || 'Specialist'} {member.designation ? `(${member.designation})` : ''}
                                                </span>
                                                <div style={{ fontSize: '11px', color: 'var(--accent-gold)', marginTop: '2px' }}>
                                                    {getLevelName(member.level)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => openEditMemberModal(member)} 
                                                className="btn btn-outline" 
                                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleDeleteMember(member)} 
                                                className="btn btn-outline" 
                                                style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-danger, #ef4444)', borderColor: 'rgba(239,68,68,0.4)' }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                    No team members added yet. Click "Add Team Member" to create one.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg" 
                        style={{ width: '100%', padding: '15px', fontWeight: 'bold' }}
                        disabled={processing}
                    >
                        {processing ? 'Saving Changes...' : 'Save Settings & Update Website'}
                    </button>
                </form>
            </div>

            {/* Team Member Add / Edit Modal */}
            {teamModalOpen && (
                <div className="modal-wrapper" onClick={() => setTeamModalOpen(false)}>
                    <div className="glass-panel modal-card" style={{ maxWidth: '540px', width: '92%', padding: '28px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            {editingMember ? '✏️ Edit Team Member' : '➕ Add New Team Member'}
                        </h3>

                        <form onSubmit={handleMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={memberForm.data.name}
                                    onChange={e => memberForm.setData('name', e.target.value)}
                                    placeholder="e.g. DR SAJID HASAN"
                                    required
                                />
                                {memberForm.errors.name && <span className="form-error">{memberForm.errors.name}</span>}
                            </div>

                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Title / Position</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={memberForm.data.title}
                                        onChange={e => memberForm.setData('title', e.target.value)}
                                        placeholder="e.g. ASSOCIATE PROFESSOR"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Specialization</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={memberForm.data.specialization}
                                        onChange={e => memberForm.setData('specialization', e.target.value)}
                                        placeholder="e.g. ORAL & MAXILLOFACIAL SURGERY"
                                    />
                                </div>
                            </div>

                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Designation / Role (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={memberForm.data.designation}
                                        onChange={e => memberForm.setData('designation', e.target.value)}
                                        placeholder="e.g. FOUNDER"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Display Level Hierarchy *</label>
                                    <select 
                                        className="form-control"
                                        value={memberForm.data.level}
                                        onChange={e => memberForm.setData('level', e.target.value)}
                                    >
                                        <option value={1}>Level 1: Founder (Top Center)</option>
                                        <option value={2}>Level 2: Core Team (Row 2)</option>
                                        <option value={3}>Level 3: Specialists (Row 3)</option>
                                        <option value={4}>Level 4: Bottom Specialist</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Profile Image / Photo</label>
                                {memberImagePreview && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <img src={memberImagePreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    className="form-control"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            memberForm.setData('image', file);
                                            setMemberImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setTeamModalOpen(false)} 
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={memberForm.processing}
                                >
                                    {memberForm.processing ? 'Saving...' : editingMember ? 'Update Member' : 'Save Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
