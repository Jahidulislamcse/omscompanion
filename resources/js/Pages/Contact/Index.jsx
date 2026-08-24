import React, { useState, useEffect } from 'react';
import { Link, Head, usePage, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';

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

            {/* Footer */}
            <footer className="landing-footer" style={{ padding: '60px 0 30px 0', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-white)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                        
                        {/* Brand Column */}
                        <div>
                            <Link href="/" className="landing-brand-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
                                <ApplicationLogo />
                            </Link>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                                OMSCOMPANION connects BDS Practitioners with automated patient referral pipelines, live status tracking, and surgical masterclasses.
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
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>🌐 Connect With Us</h4>
                            {getSetting('footer_facebook_url') ? (
                                <a 
                                    href={getSetting('footer_facebook_url')} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-outline"
                                    style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        color: '#fff', 
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        padding: '8px 16px',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <span>🔵</span> Facebook Page
                                </a>
                            ) : (
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Official Facebook page link coming soon.</p>
                            )}
                        </div>

                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        © 2026 {site_name || 'OMSCOMPANION'} Association. All Rights Reserved. BDS Practitioner Referral & Learning Network.
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
