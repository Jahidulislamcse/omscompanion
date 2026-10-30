import React, { useState, useEffect } from 'react';
import { Link, Head, usePage, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';
import CallToActionCard from '@/Components/CallToActionCard';

export default function Index({ settings = {} }) {
    const { auth, site_name, flash } = usePage().props;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getDashboardRoute = () => {
        if (!auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const getSetting = (key, defaultValue = '') => {
        return (settings && settings[key]) ? settings[key] : defaultValue;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contact.store'), {
            onSuccess: () => {
                reset('name', 'email', 'phone', 'subject', 'message');
            }
        });
    };

    const officeAddress = getSetting('footer_office_location', 'Dhaka, Bangladesh');
    const contactPhone = getSetting('footer_contact_phone', '+880 1700-000000');
    const contactEmail = getSetting('footer_contact_email', 'info@omscompanion.com');
    const contactSubtitle = getSetting('contact_subtitle', 'Feel free to reach out to us for any inquiries, patient referral guidance, or specialist collaboration. Our team is here to assist you.');

    return (
        <div className="landing-wrapper page-colorful-theme" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <Head title={`Contact Us - ${site_name || 'OMSCOMPANION'}`} />

            {/* Header Navigation */}
            <PublicNavbar activePage="contact" />

            {/* Main Contact Us Content Section */}
            <main 
                style={{ 
                    position: 'relative',
                    padding: '80px 24px 100px', 
                    minHeight: 'calc(100vh - 200px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.94)), radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 100%)',
                }}
            >
                <div style={{ maxWidth: '1050px', width: '100%', margin: '0 auto' }}>
                    
                    {/* Header Title & Subtitle */}
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.3px' }}>
                            Contact Us
                        </h1>
                        <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.7', maxWidth: '720px', margin: '0 auto' }}>
                            {contactSubtitle}
                        </p>
                    </div>

                    {/* Flash Message Banner */}
                    {(recentlySuccessful || flash?.success) && (
                        <div style={{ backgroundColor: 'rgba(13, 148, 136, 0.2)', border: '1px solid #0d9488', color: '#2dd4bf', padding: '16px 20px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center', fontWeight: '600' }}>
                            ✓ {flash?.success || 'Thank you! Your message has been sent successfully. We will get back to you shortly.'}
                        </div>
                    )}

                    {/* Responsive Two Column Grid */}
                    <div 
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                            gap: '50px 40px',
                            alignItems: 'center'
                        }}
                    >
                        
                        {/* Left Column: Contact Details with Circular Icon Badges */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* Address Item */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div 
                                    style={{ 
                                        width: '56px', 
                                        height: '56px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                        fontSize: '22px'
                                    }}
                                >
                                    📍
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', margin: '0 0 6px 0', letterSpacing: '0.3px' }}>
                                        Address
                                    </h4>
                                    <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                        {officeAddress}
                                    </p>
                                </div>
                            </div>

                            {/* Phone Item */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div 
                                    style={{ 
                                        width: '56px', 
                                        height: '56px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                        fontSize: '22px'
                                    }}
                                >
                                    📞
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', margin: '0 0 6px 0', letterSpacing: '0.3px' }}>
                                        Phone
                                    </h4>
                                    <a href={`tel:${contactPhone}`} style={{ fontSize: '14px', color: '#e2e8f0', textDecoration: 'none', lineHeight: '1.6' }}>
                                        {contactPhone}
                                    </a>
                                </div>
                            </div>

                            {/* Email Item */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div 
                                    style={{ 
                                        width: '56px', 
                                        height: '56px', 
                                        borderRadius: '50%', 
                                        backgroundColor: '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                        fontSize: '22px'
                                    }}
                                >
                                    ✉️
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', margin: '0 0 6px 0', letterSpacing: '0.3px' }}>
                                        Email
                                    </h4>
                                    <a href={`mailto:${contactEmail}`} style={{ fontSize: '14px', color: '#e2e8f0', textDecoration: 'none', lineHeight: '1.6', wordBreak: 'break-all' }}>
                                        {contactEmail}
                                    </a>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Clean White Form Box */}
                        <div 
                            style={{ 
                                backgroundColor: '#ffffff', 
                                borderRadius: '14px', 
                                padding: '42px 36px', 
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                color: '#0f172a'
                            }}
                        >
                            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '28px', color: '#0f172a' }}>
                                Send Message
                            </h3>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                
                                {/* Full Name Field */}
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="Full Name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            borderBottom: '2px solid #334155',
                                            backgroundColor: 'transparent',
                                            padding: '10px 4px',
                                            fontSize: '14px',
                                            color: '#0f172a',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#00bcd4'}
                                        onBlur={e => e.target.style.borderColor = '#334155'}
                                    />
                                    {errors.name && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <input 
                                        type="email" 
                                        placeholder="Email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            borderBottom: '2px solid #334155',
                                            backgroundColor: 'transparent',
                                            padding: '10px 4px',
                                            fontSize: '14px',
                                            color: '#0f172a',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#00bcd4'}
                                        onBlur={e => e.target.style.borderColor = '#334155'}
                                    />
                                    {errors.email && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                                </div>

                                {/* Phone Field (Optional) */}
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="Phone Number (Optional)"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            borderBottom: '2px solid #cbd5e1',
                                            backgroundColor: 'transparent',
                                            padding: '10px 4px',
                                            fontSize: '14px',
                                            color: '#0f172a',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#00bcd4'}
                                        onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                                    />
                                </div>

                                {/* Message Field */}
                                <div>
                                    <textarea 
                                        placeholder="Type your Message..."
                                        rows="3"
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            borderBottom: '2px solid #334155',
                                            backgroundColor: 'transparent',
                                            padding: '10px 4px',
                                            fontSize: '14px',
                                            color: '#0f172a',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#00bcd4'}
                                        onBlur={e => e.target.style.borderColor = '#334155'}
                                    />
                                    {errors.message && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.message}</span>}
                                </div>

                                {/* Send Button */}
                                <div style={{ marginTop: '10px' }}>
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        style={{
                                            backgroundColor: '#00bcd4',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '12px 34px',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 4px 12px rgba(0, 188, 212, 0.35)'
                                        }}
                                        onMouseOver={e => e.target.style.backgroundColor = '#00acc1'}
                                        onMouseOut={e => e.target.style.backgroundColor = '#00bcd4'}
                                    >
                                        {processing ? 'Sending...' : 'Send'}
                                    </button>
                                </div>

                            </form>
                        </div>

                    </div>

                </div>
            </main>

            {/* Call To Action Banner */}
            <CallToActionCard />

            {/* Footer */}
            <footer className="landing-footer" style={{ width: '100%', alignSelf: 'stretch', boxSizing: 'border-box', padding: '60px 0 30px 0', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-white)' }}>
                <div className="container" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px', textAlign: 'left' }}>
                        
                        {/* Brand Column */}
                        <div>
                            <Link href="/" className="landing-brand-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
                                <ApplicationLogo />
                            </Link>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                                OMS COMPANION connects doctors to enhance practice through learning and patient care
                            </p>
                        </div>

                        {/* Office Location Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>📍 Office Location</h4>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                                {officeAddress}
                            </p>
                        </div>

                        {/* Contact Information Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>📞 Contact & Support</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                                <div>
                                    <strong>Phone:</strong> <a href={`tel:${contactPhone}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{contactPhone}</a>
                                </div>
                                <div>
                                    <strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{contactEmail}</a>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700', textAlign: 'left' }}>🌐 Connect With Us</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                                {/* Facebook Page Link */}
                                <a 
                                    href={getSetting('footer_facebook_url') || 'https://facebook.com'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="footer-social-btn footer-btn-facebook"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span>Facebook Page</span>
                                </a>

                                {/* YouTube Channel Link */}
                                <a 
                                    href={getSetting('footer_youtube_url') || 'https://youtube.com'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="footer-social-btn footer-btn-youtube"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                    <span>YouTube Channel</span>
                                </a>
                            </div>
                        </div>

                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        © 2026 {site_name || 'OMSCOMPANION'} Association. All Rights Reserved.
                    </div>
                </div>
            </footer>

            {/* Floating Back-to-Top Button */}
            {showScrollTop && (
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                    className="floating-back-to-top"
                    title="Back to Top"
                    aria-label="Back to Top"
                >
                    ↑
                </button>
            )}
        </div>
    );
}
