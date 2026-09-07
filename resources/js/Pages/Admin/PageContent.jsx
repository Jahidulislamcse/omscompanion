import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PageContent({ settings = {}, teamMembers = [], services = [], reviews = [], newsItems = [] }) {
    const { site_logo: currentLogo } = usePage().props;
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [loginPreview, setLoginPreview] = useState(null);

    // Modal state for Team Member add/edit
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [memberImagePreview, setMemberImagePreview] = useState(null);

    // Modal state for Services item add/edit
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceImagePreview, setServiceImagePreview] = useState(null);

    // Modal state for Doctor Reviews add/edit
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    // Modal state for Clinical News add/edit
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);

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
        whatsapp_number: settings.whatsapp_number || '+8801700000000',
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
        services_subtitle: settings.services_subtitle || '',
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

    const serviceForm = useForm({
        prefix: 'MANAGEMENT OF',
        title: '',
        description: '',
        order_index: 0,
        image: null,
        remove_image: false,
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

    // Team Member Handlers
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

    // Service Handlers
    const openAddServiceModal = () => {
        setEditingService(null);
        setServiceImagePreview(null);
        serviceForm.setData({
            prefix: 'MANAGEMENT OF',
            title: '',
            description: '',
            order_index: services.length + 1,
            image: null,
            remove_image: false,
        });
        setServiceModalOpen(true);
    };

    const openEditServiceModal = (srv) => {
        setEditingService(srv);
        setServiceImagePreview(srv.image_path ? '/' + srv.image_path : null);
        serviceForm.setData({
            prefix: srv.prefix || '',
            title: srv.title || '',
            description: srv.description || '',
            order_index: srv.order_index || 0,
            image: null,
            remove_image: false,
        });
        setServiceModalOpen(true);
    };

    const handleServiceSubmit = (e) => {
        e.preventDefault();
        if (editingService) {
            serviceForm.post(route('admin.services.update_post', editingService.id), {
                onSuccess: () => {
                    setServiceModalOpen(false);
                    alert('Service updated successfully!');
                }
            });
        } else {
            serviceForm.post(route('admin.services.store'), {
                onSuccess: () => {
                    setServiceModalOpen(false);
                    alert('Service added successfully!');
                }
            });
        }
    };

    const handleDeleteService = (srv) => {
        if (confirm(`Are you sure you want to delete service "${srv.title}"?`)) {
            router.delete(route('admin.services.destroy', srv.id));
        }
    };

    const reviewForm = useForm({
        name: '',
        role: '',
        location: '',
        quote: '',
        rating: 5,
        tag: 'Verified Member',
        order_index: 0,
        is_published: true,
    });

    const openAddReviewModal = () => {
        setEditingReview(null);
        reviewForm.setData({
            name: '',
            role: '',
            location: '',
            quote: '',
            rating: 5,
            tag: 'Verified Member',
            order_index: reviews.length + 1,
            is_published: true,
        });
        setReviewModalOpen(true);
    };

    const openEditReviewModal = (rev) => {
        setEditingReview(rev);
        reviewForm.setData({
            name: rev.name || '',
            role: rev.role || '',
            location: rev.location || '',
            quote: rev.quote || '',
            rating: rev.rating || 5,
            tag: rev.tag || '',
            order_index: rev.order_index || 0,
            is_published: rev.is_published !== false,
        });
        setReviewModalOpen(true);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (editingReview) {
            reviewForm.post(route('admin.reviews.update_post', editingReview.id), {
                onSuccess: () => {
                    setReviewModalOpen(false);
                    alert('Doctor review updated successfully!');
                }
            });
        } else {
            reviewForm.post(route('admin.reviews.store'), {
                onSuccess: () => {
                    setReviewModalOpen(false);
                    alert('Doctor review added successfully!');
                }
            });
        }
    };

    const handleDeleteReview = (rev) => {
        if (confirm(`Are you sure you want to delete review by "${rev.name}"?`)) {
            router.delete(route('admin.reviews.destroy', rev.id));
        }
    };

    const handleToggleReviewPublish = (rev) => {
        router.post(route('admin.reviews.toggle', rev.id));
    };

    const newsForm = useForm({
        badge_text: '',
        sub_badge_text: '',
        title: '',
        description: '',
        button_text: 'View Details →',
        button_url: '/videos',
        button_type: 'outline',
        theme_color: 'indigo',
        order_index: 0,
        is_published: true,
    });

    const openAddNewsModal = () => {
        setEditingNews(null);
        newsForm.setData({
            badge_text: 'Workshop',
            sub_badge_text: 'Upcoming Training',
            title: '',
            description: '',
            button_text: 'View Related Masterclass Videos →',
            button_url: '/videos',
            button_type: 'outline',
            theme_color: 'indigo',
            order_index: newsItems.length + 1,
            is_published: true,
        });
        setNewsModalOpen(true);
    };

    const openEditNewsModal = (news) => {
        setEditingNews(news);
        newsForm.setData({
            badge_text: news.badge_text || '',
            sub_badge_text: news.sub_badge_text || '',
            title: news.title || '',
            description: news.description || '',
            button_text: news.button_text || 'View Details →',
            button_url: news.button_url || '',
            button_type: news.button_type || 'outline',
            theme_color: news.theme_color || 'indigo',
            order_index: news.order_index || 0,
            is_published: news.is_published !== false,
        });
        setNewsModalOpen(true);
    };

    const handleNewsSubmit = (e) => {
        e.preventDefault();
        if (editingNews) {
            newsForm.post(route('admin.news.update_post', editingNews.id), {
                onSuccess: () => {
                    setNewsModalOpen(false);
                    alert('Clinical news item updated successfully!');
                }
            });
        } else {
            newsForm.post(route('admin.news.store'), {
                onSuccess: () => {
                    setNewsModalOpen(false);
                    alert('Clinical news item added successfully!');
                }
            });
        }
    };

    const handleDeleteNews = (news) => {
        if (confirm(`Are you sure you want to delete news item "${news.title}"?`)) {
            router.delete(route('admin.news.destroy', news.id));
        }
    };

    const handleToggleNewsPublish = (news) => {
        router.post(route('admin.news.toggle', news.id));
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
        <AdminLayout title="Manage Landing Page, About & Services">
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

                        {(currentLogo || logoPreview) && (
                            <button 
                                type="button" 
                                className="btn btn-outline"
                                style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-danger, #ef4444)' }}
                                onClick={handleRemoveLogo}
                            >
                                🗑️ Remove Custom Logo & Reset to Default Text Logo
                            </button>
                        )}
                    </div>

                    {/* Hero Section Banner & Text */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            🌟 Homepage Hero Banner & Text Configuration
                        </h3>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Homepage Hero Main Title</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={data.hero_title}
                                onChange={e => setData('hero_title', e.target.value)}
                                placeholder="e.g. Bridging Dental Practices with Live Referral Intelligence"
                                required
                            />
                            {errors.hero_title && <span className="form-error">{errors.hero_title}</span>}
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Homepage Hero Subtitle / Description</label>
                            <textarea 
                                className="form-control"
                                value={data.hero_subtitle}
                                onChange={e => setData('hero_subtitle', e.target.value)}
                                rows="3"
                                placeholder="Enter hero subtitle text..."
                                required
                            />
                            {errors.hero_subtitle && <span className="form-error">{errors.hero_subtitle}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Hero Top Banner Image (Optional)</label>
                            {bannerPreview ? (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={bannerPreview} alt="Banner Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }} />
                                </div>
                            ) : settings.hero_banner && !data.remove_banner ? (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={`${route('site.banner.stream')}?v=${settings.hero_banner_updated_at || 1}`} alt="Current Banner" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }} />
                                </div>
                            ) : null}

                            <input 
                                type="file" 
                                className="form-control"
                                accept="image/*"
                                onChange={handleBannerChange}
                            />
                            {errors.hero_banner && <span className="form-error">{errors.hero_banner}</span>}

                            {(settings.hero_banner || bannerPreview) && !data.remove_banner && (
                                <button 
                                    type="button" 
                                    className="btn btn-outline"
                                    style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-danger, #ef4444)' }}
                                    onClick={handleRemoveBanner}
                                >
                                    🗑️ Remove Hero Banner Image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Login Page Side Image Configuration */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            🔐 Login Page Side Banner Image & Text Configuration
                        </h3>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Login Side Title</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={data.login_side_title}
                                onChange={e => setData('login_side_title', e.target.value)}
                                placeholder="e.g. Specialist Oral & Maxillofacial Network"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Login Side Subtitle</label>
                            <textarea 
                                className="form-control"
                                value={data.login_side_subtitle}
                                onChange={e => setData('login_side_subtitle', e.target.value)}
                                rows="2"
                                placeholder="Enter login side text..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Login Side Image (Left Panel on /login)</label>
                            {loginPreview ? (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={loginPreview} alt="Login Side Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }} />
                                </div>
                            ) : settings.login_side_image && !data.remove_login_image ? (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={`${route('site.login_image.stream')}?v=${settings.login_side_image_updated_at || 1}`} alt="Current Login Side Image" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }} />
                                </div>
                            ) : null}

                            <input 
                                type="file" 
                                className="form-control"
                                accept="image/*"
                                onChange={handleLoginImageChange}
                            />
                            {errors.login_side_image && <span className="form-error">{errors.login_side_image}</span>}

                            {(settings.login_side_image || loginPreview) && !data.remove_login_image && (
                                <button 
                                    type="button" 
                                    className="btn btn-outline"
                                    style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-danger, #ef4444)' }}
                                    onClick={handleRemoveLoginImage}
                                >
                                    🗑️ Remove Custom Login Side Image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Member Advantages / 4 Goals Section */}
                    <div className="glass-panel">
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                            🎯 Homepage Goal Cards (Member Advantages)
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                        <label className="form-label">Description</label>
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
                                        <label className="form-label">Description</label>
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
                                        <label className="form-label">Description</label>
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
                                        <label className="form-label">Description</label>
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
                                    <label className="form-label">WhatsApp Number (Floating Bumping Widget)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={data.whatsapp_number}
                                        onChange={e => setData('whatsapp_number', e.target.value)}
                                        placeholder="e.g. +8801700000000"
                                    />
                                    {errors.whatsapp_number && <span className="form-error">{errors.whatsapp_number}</span>}
                                    <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                                        Floating bumping WhatsApp button on front pages will direct chat to this number.
                                    </small>
                                </div>
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
                                rows="5"
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

                    {/* Services Page Config & Items Section */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent-teal)' }}>
                                🛠️ Services Page Config & Items ({services.length})
                            </h3>
                            <button 
                                type="button" 
                                onClick={openAddServiceModal} 
                                className="btn btn-primary"
                                style={{ padding: '6px 16px', fontSize: '13px' }}
                            >
                                ➕ Add Service Item
                            </button>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Services Page Intro Subtitle</label>
                            <textarea 
                                className="form-control"
                                value={data.services_subtitle}
                                onChange={e => setData('services_subtitle', e.target.value)}
                                rows="3"
                                placeholder="Enter introduction subtitle paragraph for /services page..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                            {services.length > 0 ? (
                                services.map(srv => (
                                    <div key={srv.id} style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {srv.image_path ? (
                                                <img src={'/' + srv.image_path} alt={srv.title} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal)' }} />
                                            ) : (
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#0d9488' }}>
                                                    🩺
                                                </div>
                                            )}
                                            <div>
                                                {srv.prefix && (
                                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-teal)', display: 'block', marginBottom: '2px' }}>
                                                        {srv.prefix}
                                                    </span>
                                                )}
                                                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>
                                                    {srv.title}
                                                </h4>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => openEditServiceModal(srv)} 
                                                className="btn btn-outline" 
                                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleDeleteService(srv)} 
                                                className="btn btn-outline" 
                                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--color-danger, #ef4444)', borderColor: 'rgba(239,68,68,0.4)' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                    No services added yet. Click "Add Service Item" to create one.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Doctor Reviews / Testimonials Management Section */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent-gold)' }}>
                                ⭐ Doctor Reviews / Testimonials
                            </h3>
                            <button 
                                type="button" 
                                onClick={openAddReviewModal} 
                                className="btn btn-primary" 
                                style={{ padding: '6px 16px', fontSize: '13px' }}
                            >
                                ➕ Add Review
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {reviews.length > 0 ? (
                                reviews.map(rev => (
                                    <div key={rev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', gap: '14px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{rev.name}</h4>
                                            </div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                "{rev.quote}"
                                            </p>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {rev.role}{rev.location ? ` • ${rev.location}` : ''}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleReviewPublish(rev)}
                                                className="btn btn-outline"
                                                style={{
                                                    padding: '4px 10px',
                                                    fontSize: '11px',
                                                    color: rev.is_published ? '#10b981' : 'var(--text-muted)',
                                                    borderColor: rev.is_published ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                                                }}
                                            >
                                                {rev.is_published ? '✓ Published' : 'Hidden'}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => openEditReviewModal(rev)} 
                                                className="btn btn-outline" 
                                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleDeleteReview(rev)} 
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
                                    No reviews added yet. Click "+ Add Review" to create one.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clinical News & Professional Training Management Section */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent-gold)' }}>
                                📰 Clinical News & Updates Management
                            </h3>
                            <button 
                                type="button" 
                                onClick={openAddNewsModal} 
                                className="btn btn-primary" 
                                style={{ padding: '6px 16px', fontSize: '13px' }}
                            >
                                ➕ Add News / Training Item
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {newsItems.length > 0 ? (
                                newsItems.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', gap: '14px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
                                                    {item.badge_text}
                                                </span>
                                                {item.sub_badge_text && (
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        • {item.sub_badge_text}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: '700' }}>{item.title}</h4>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {item.description}
                                            </p>
                                            <span style={{ fontSize: '11px', color: 'var(--accent-teal)' }}>
                                                Button: "{item.button_text}" ({item.button_type})
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleNewsPublish(item)}
                                                className="btn btn-outline"
                                                style={{
                                                    padding: '4px 10px',
                                                    fontSize: '11px',
                                                    color: item.is_published ? '#10b981' : 'var(--text-muted)',
                                                    borderColor: item.is_published ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                                                }}
                                            >
                                                {item.is_published ? '✓ Published' : 'Hidden'}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => openEditNewsModal(item)} 
                                                className="btn btn-outline" 
                                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleDeleteNews(item)} 
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
                                    No news or training items added yet. Click "+ Add News / Training Item" to create one.
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
                        {processing ? 'Saving Changes...' : 'Save All Settings & Update Website'}
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

            {/* Service Add / Edit Modal */}
            {serviceModalOpen && (
                <div className="modal-wrapper" onClick={() => setServiceModalOpen(false)}>
                    <div className="glass-panel modal-card" style={{ maxWidth: '500px', width: '92%', padding: '28px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            {editingService ? '✏️ Edit Service Item' : '➕ Add New Service Item'}
                        </h3>

                        <form onSubmit={handleServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Service Top Prefix (e.g. MANAGEMENT OF, SURGICAL, GTR &)</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={serviceForm.data.prefix}
                                    onChange={e => serviceForm.setData('prefix', e.target.value)}
                                    placeholder="e.g. MANAGEMENT OF"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Service Main Title *</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={serviceForm.data.title}
                                    onChange={e => serviceForm.setData('title', e.target.value)}
                                    placeholder="e.g. JAW CYSTS"
                                    required
                                />
                                {serviceForm.errors.title && <span className="form-error">{serviceForm.errors.title}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Optional Short Description</label>
                                <textarea 
                                    className="form-control"
                                    value={serviceForm.data.description}
                                    onChange={e => serviceForm.setData('description', e.target.value)}
                                    rows="2"
                                    placeholder="Enter optional description..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Service Image (Circular Badge Display)</label>
                                {serviceImagePreview && (
                                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={serviceImagePreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal)' }} />
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }}
                                            onClick={() => {
                                                serviceForm.setData(d => ({ ...d, image: null, remove_image: true }));
                                                setServiceImagePreview(null);
                                            }}
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    className="form-control"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            serviceForm.setData(d => ({ ...d, image: file, remove_image: false }));
                                            setServiceImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setServiceModalOpen(false)} 
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={serviceForm.processing}
                                >
                                    {serviceForm.processing ? 'Saving...' : editingService ? 'Update Service' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Doctor Review Modal */}
            {reviewModalOpen && (
                <div className="modal-wrapper" onClick={() => setReviewModalOpen(false)}>
                    <div className="glass-panel modal-card" style={{ maxWidth: '600px', width: '92%', padding: '28px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--accent-gold)' }}>
                            {editingReview ? '✏️ Edit Doctor Review' : '⭐ Add New Doctor Review'}
                        </h3>

                        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Doctor Name *</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={reviewForm.data.name}
                                        onChange={e => reviewForm.setData('name', e.target.value)}
                                        placeholder="e.g. Dr. Farhana Yasmin, BDS"
                                        required
                                    />
                                    {reviewForm.errors.name && <span className="form-error">{reviewForm.errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tag Badge (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={reviewForm.data.tag}
                                        onChange={e => reviewForm.setData('tag', e.target.value)}
                                        placeholder="e.g. Verified Member"
                                    />
                                </div>
                            </div>

                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Specialization / Role</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={reviewForm.data.role}
                                        onChange={e => reviewForm.setData('role', e.target.value)}
                                        placeholder="e.g. General Dental Practitioner"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location / Chamber City</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={reviewForm.data.location}
                                        onChange={e => reviewForm.setData('location', e.target.value)}
                                        placeholder="e.g. Dhaka"
                                    />
                                </div>
                            </div>

                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Star Rating (1 to 5) *</label>
                                    <select 
                                        className="form-control"
                                        value={reviewForm.data.rating}
                                        onChange={e => reviewForm.setData('rating', Number(e.target.value))}
                                    >
                                        <option value={5}>5 Stars (★★★★★)</option>
                                        <option value={4}>4 Stars (★★★★☆)</option>
                                        <option value={3}>3 Stars (★★★☆☆)</option>
                                        <option value={2}>2 Stars (★★☆☆☆)</option>
                                        <option value={1}>1 Star (★☆☆☆☆)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Display Order</label>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        value={reviewForm.data.order_index}
                                        onChange={e => reviewForm.setData('order_index', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Review Quote / Content *</label>
                                <textarea 
                                    className="form-control"
                                    value={reviewForm.data.quote}
                                    onChange={e => reviewForm.setData('quote', e.target.value)}
                                    rows="3"
                                    placeholder="Write doctor's feedback/review text..."
                                    required
                                />
                                {reviewForm.errors.quote && <span className="form-error">{reviewForm.errors.quote}</span>}
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    id="review_is_published"
                                    checked={reviewForm.data.is_published}
                                    onChange={e => reviewForm.setData('is_published', e.target.checked)}
                                />
                                <label htmlFor="review_is_published" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                                    Publish on website landing page immediately
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setReviewModalOpen(false)} 
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={reviewForm.processing}
                                >
                                    {reviewForm.processing ? 'Saving...' : editingReview ? 'Update Review' : 'Save Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Clinical News Item Modal */}
            {newsModalOpen && (
                <div className="modal-wrapper" onClick={() => setNewsModalOpen(false)}>
                    <div className="glass-panel modal-card" style={{ maxWidth: '600px', width: '92%', padding: '28px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--accent-gold)' }}>
                            {editingNews ? '✏️ Edit News & Training Card' : '📰 Add New News & Training Card'}
                        </h3>

                        <form onSubmit={handleNewsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Category Badge Text *</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={newsForm.data.badge_text}
                                        onChange={e => newsForm.setData('badge_text', e.target.value)}
                                        placeholder="e.g. Workshop or Clinical Guide"
                                        required
                                    />
                                    {newsForm.errors.badge_text && <span className="form-error">{newsForm.errors.badge_text}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Secondary Sub-badge (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={newsForm.data.sub_badge_text}
                                        onChange={e => newsForm.setData('sub_badge_text', e.target.value)}
                                        placeholder="e.g. Upcoming Training or Live Support"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Main Card Title *</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={newsForm.data.title}
                                    onChange={e => newsForm.setData('title', e.target.value)}
                                    placeholder="e.g. Advanced Maxillofacial Impaction & Surgical Masterclass"
                                    required
                                />
                                {newsForm.errors.title && <span className="form-error">{newsForm.errors.title}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description Paragraph *</label>
                                <textarea 
                                    className="form-control"
                                    value={newsForm.data.description}
                                    onChange={e => newsForm.setData('description', e.target.value)}
                                    rows="3"
                                    placeholder="Write card description text..."
                                    required
                                />
                                {newsForm.errors.description && <span className="form-error">{newsForm.errors.description}</span>}
                            </div>

                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Button Label Text *</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={newsForm.data.button_text}
                                        onChange={e => newsForm.setData('button_text', e.target.value)}
                                        placeholder="e.g. View Related Masterclass Videos →"
                                        required
                                    />
                                    {newsForm.errors.button_text && <span className="form-error">{newsForm.errors.button_text}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Button Target Link / URL</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={newsForm.data.button_url}
                                        onChange={e => newsForm.setData('button_url', e.target.value)}
                                        placeholder="e.g. /videos or whatsapp"
                                    />
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        Use <b>/videos</b> for Videos page, or <b>whatsapp</b> for WhatsApp link.
                                    </span>
                                </div>
                            </div>

                            <div className="grid-responsive-two-col" style={{ gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Button Style Type</label>
                                    <select 
                                        className="form-control"
                                        value={newsForm.data.button_type}
                                        onChange={e => newsForm.setData('button_type', e.target.value)}
                                    >
                                        <option value="outline">Standard Outline Button</option>
                                        <option value="whatsapp">WhatsApp Green Button (Join WhatsApp)</option>
                                        <option value="primary">Solid Primary Button</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Display Order</label>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        value={newsForm.data.order_index}
                                        onChange={e => newsForm.setData('order_index', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type="checkbox" 
                                    id="news_is_published"
                                    checked={newsForm.data.is_published}
                                    onChange={e => newsForm.setData('is_published', e.target.checked)}
                                />
                                <label htmlFor="news_is_published" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                                    Publish card on website landing page immediately
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setNewsModalOpen(false)} 
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={newsForm.processing}
                                >
                                    {newsForm.processing ? 'Saving...' : editingNews ? 'Update News Card' : 'Save News Card'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
