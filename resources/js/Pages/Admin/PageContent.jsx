import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PageContent({ settings }) {
    const { site_logo: currentLogo } = usePage().props;
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [loginPreview, setLoginPreview] = useState(null);

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

                    {/* Dynamic Hero Banner & Section Config */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            🖼️ Dynamic Hero Banner & Section Config
                        </h3>
                        
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Active Hero Banner Preview</label>
                            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px' }} />
                                ) : (!data.remove_banner && settings.hero_banner) ? (
                                    <img src={`${route('site.banner.stream')}?v=${settings.hero_banner_updated_at || Date.now()}`} alt="Hero Banner" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px' }} />
                                ) : (
                                    <div style={{ padding: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        No custom banner image active. The default dynamic hero text section will display on the homepage.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Upload Custom Dynamic Hero Banner Image (PNG, JPG, WebP)</label>
                            <input 
                                type="file" 
                                className="form-control"
                                accept="image/*"
                                onChange={handleBannerChange}
                            />
                            {errors.hero_banner && <span className="form-error">{errors.hero_banner}</span>}
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Uploading a banner image will display the dynamic hero banner on the top of the homepage.
                            </p>
                        </div>

                        {((settings && settings.hero_banner && !data.remove_banner) || bannerPreview) && (
                            <button 
                                type="button" 
                                className="btn btn-outline"
                                style={{ marginBottom: '24px', color: '#ef4444', borderColor: '#ef4444' }}
                                onClick={handleRemoveBanner}
                            >
                                🗑️ Remove Custom Hero Banner Image
                            </button>
                        )}

                        <div className="form-group">
                            <label className="form-label">Hero Section Title (Dynamic Text)</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={data.hero_title}
                                onChange={e => setData('hero_title', e.target.value)}
                                required
                            />
                            {errors.hero_title && <span className="form-error">{errors.hero_title}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Hero Section Description (Dynamic Text)</label>
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

                    {/* Login Page Side Image & Text Config */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            🖼️ Login Page Side Image & Banner Config
                        </h3>
                        
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Active Login Side Image Preview</label>
                            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                {loginPreview ? (
                                    <img src={loginPreview} alt="Login Side Preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '6px' }} />
                                ) : (!data.remove_login_image && settings.login_side_image) ? (
                                    <img src={`${route('site.login_image.stream')}?v=${settings.login_side_image_updated_at || Date.now()}`} alt="Login Side Image" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '6px' }} />
                                ) : (
                                    <div style={{ padding: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        No custom login image uploaded. Default themed side banner will display on the login page.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Upload Custom Login Page Side Image (PNG, JPG, WebP)</label>
                            <input 
                                type="file" 
                                className="form-control"
                                accept="image/*"
                                onChange={handleLoginImageChange}
                            />
                            {errors.login_side_image && <span className="form-error">{errors.login_side_image}</span>}
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Uploading an image will render the side banner image beside the login form.
                            </p>
                        </div>

                        {((settings && settings.login_side_image && !data.remove_login_image) || loginPreview) && (
                            <button 
                                type="button" 
                                className="btn btn-outline"
                                style={{ marginBottom: '24px', color: '#ef4444', borderColor: '#ef4444' }}
                                onClick={handleRemoveLoginImage}
                            >
                                🗑️ Remove Custom Login Side Image
                            </button>
                        )}

                        <div className="form-group">
                            <label className="form-label">Login Side Overlay Title</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={data.login_side_title}
                                onChange={e => setData('login_side_title', e.target.value)}
                                placeholder="e.g. Discover your next journey"
                            />
                            {errors.login_side_title && <span className="form-error">{errors.login_side_title}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Login Side Overlay Subtitle / Description</label>
                            <textarea 
                                className="form-control"
                                value={data.login_side_subtitle}
                                onChange={e => setData('login_side_subtitle', e.target.value)}
                                rows="3"
                                placeholder="e.g. Explore ideas, stories, and experiences designed to inspire your everyday practice."
                            />
                            {errors.login_side_subtitle && <span className="form-error">{errors.login_side_subtitle}</span>}
                        </div>
                    </div>
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

                    {/* Footer & Contact Info Config */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            📌 Footer & Contact Information Config
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">Office Location</label>
                                <textarea 
                                    className="form-control"
                                    value={data.footer_office_location}
                                    onChange={e => setData('footer_office_location', e.target.value)}
                                    rows="2"
                                    placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka, Bangladesh"
                                />
                                {errors.footer_office_location && <span className="form-error">{errors.footer_office_location}</span>}
                            </div>

                            <div className="grid-responsive-two-col" style={{ gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Contact Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={data.footer_contact_phone}
                                        onChange={e => setData('footer_contact_phone', e.target.value)}
                                        placeholder="e.g. +880 1712-345678"
                                    />
                                    {errors.footer_contact_phone && <span className="form-error">{errors.footer_contact_phone}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Contact Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        value={data.footer_contact_email}
                                        onChange={e => setData('footer_contact_email', e.target.value)}
                                        placeholder="e.g. info@omscompanion.com"
                                    />
                                    {errors.footer_contact_email && <span className="form-error">{errors.footer_contact_email}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Facebook Page Link / URL</label>
                                <input 
                                    type="url" 
                                    className="form-control"
                                    value={data.footer_facebook_url}
                                    onChange={e => setData('footer_facebook_url', e.target.value)}
                                    placeholder="e.g. https://facebook.com/omscompanion"
                                />
                                {errors.footer_facebook_url && <span className="form-error">{errors.footer_facebook_url}</span>}
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
