import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PageContent({ settings }) {
    const { site_logo: currentLogo } = usePage().props;
    const [logoPreview, setLogoPreview] = useState(null);

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
        site_logo: null,
        remove_logo: false,
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

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.page_content.update'), {
            forceFormData: true,
            onSuccess: () => {
                alert('Site settings & logo updated successfully!');
            }
        });
    };

    return (
        <AdminLayout title="Manage Landing Page & Branding">
            <Head title="Site Branding & Content" />

            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
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
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Uploading a logo will replace the text logo across the website, navigation bar, sidebars, and login pages.
                            </p>
                        </div>

                        {(currentLogo || logoPreview) && (
                            <button 
                                type="button" 
                                className="btn btn-outline"
                                style={{ marginTop: '10px', color: '#ef4444', borderColor: '#ef4444' }}
                                onClick={handleRemoveLogo}
                            >
                                🗑️ Remove Custom Logo (Use Default OMSCOMPANION)
                            </button>
                        )}
                    </div>

                    {/* Hero Section settings */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            ✨ Hero Section Config
                        </h3>
                        
                        <div className="form-group">
                            <label className="form-label">Hero Banner Title</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={data.hero_title}
                                onChange={e => setData('hero_title', e.target.value)}
                                required
                            />
                            {errors.hero_title && <span className="form-error">{errors.hero_title}</span>}
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Highlight key features by wrapping text inside class stylings on the homepage.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Hero Description Sub-title</label>
                            <textarea 
                                className="form-control"
                                value={data.hero_subtitle}
                                onChange={e => setData('hero_subtitle', e.target.value)}
                                rows="3"
                                required
                            />
                            {errors.hero_subtitle && <span className="form-error">{errors.hero_subtitle}</span>}
                        </div>
                    </div>

                    {/* Goals Config Grid */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            📋 Chamber Goals & Mission Config
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Goal 1 */}
                            <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', marginBottom: '10px' }}>Goal Card #1</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={data.goal_1_title}
                                            onChange={e => setData('goal_1_title', e.target.value)}
                                            required
                                        />
                                        {errors.goal_1_title && <span className="form-error">{errors.goal_1_title}</span>}
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Description Description</label>
                                        <textarea 
                                            className="form-control" 
                                            value={data.goal_1_desc}
                                            onChange={e => setData('goal_1_desc', e.target.value)}
                                            rows="2"
                                            required
                                        />
                                        {errors.goal_1_desc && <span className="form-error">{errors.goal_1_desc}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Goal 2 */}
                            <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', marginBottom: '10px' }}>Goal Card #2</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={data.goal_2_title}
                                            onChange={e => setData('goal_2_title', e.target.value)}
                                            required
                                        />
                                        {errors.goal_2_title && <span className="form-error">{errors.goal_2_title}</span>}
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Description Description</label>
                                        <textarea 
                                            className="form-control" 
                                            value={data.goal_2_desc}
                                            onChange={e => setData('goal_2_desc', e.target.value)}
                                            rows="2"
                                            required
                                        />
                                        {errors.goal_2_desc && <span className="form-error">{errors.goal_2_desc}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Goal 3 */}
                            <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', marginBottom: '10px' }}>Goal Card #3</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={data.goal_3_title}
                                            onChange={e => setData('goal_3_title', e.target.value)}
                                            required
                                        />
                                        {errors.goal_3_title && <span className="form-error">{errors.goal_3_title}</span>}
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Description Description</label>
                                        <textarea 
                                            className="form-control" 
                                            value={data.goal_3_desc}
                                            onChange={e => setData('goal_3_desc', e.target.value)}
                                            rows="2"
                                            required
                                        />
                                        {errors.goal_3_desc && <span className="form-error">{errors.goal_3_desc}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Goal 4 */}
                            <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', marginBottom: '10px' }}>Goal Card #4</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={data.goal_4_title}
                                            onChange={e => setData('goal_4_title', e.target.value)}
                                            required
                                        />
                                        {errors.goal_4_title && <span className="form-error">{errors.goal_4_title}</span>}
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Description Description</label>
                                        <textarea 
                                            className="form-control" 
                                            value={data.goal_4_desc}
                                            onChange={e => setData('goal_4_desc', e.target.value)}
                                            rows="2"
                                            required
                                        />
                                        {errors.goal_4_desc && <span className="form-error">{errors.goal_4_desc}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg" 
                        style={{ width: '100%', padding: '15px', fontWeight: 'bold' }}
                        disabled={processing}
                    >
                        {processing ? 'Saving Changes...' : 'Save Settings & Update Homepage'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
