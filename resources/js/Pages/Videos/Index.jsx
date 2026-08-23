import { useState, useEffect, useMemo } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function Index({ categories, videos, settings = {} }) {
    const { auth, site_name } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);
    const [accessBlockedReason, setAccessBlockedReason] = useState(null); // 'unauthenticated' | 'unapproved' | null
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const getSetting = (key, defaultValue = '') => {
        return (settings && settings[key]) ? settings[key] : defaultValue;
    };

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

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getDashboardRoute = () => {
        if (!auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'Preview';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getVideoSrc = (video) => {
        if (!video) return '';
        if (video.storage_type === 'local') {
            return route('videos.public_stream', { video: video.id });
        }
        
        const url = video.video_path;
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            let videoId = '';
            try {
                if (url.includes('youtube.com/watch')) {
                    const urlParams = new URLSearchParams(new URL(url).search);
                    videoId = urlParams.get('v');
                } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('youtube.com/embed/')[1].split('?')[0];
                }
            } catch (err) {
                console.error("Invalid YouTube URL parsing", err);
            }
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        return url;
    };

    const handleVideoClick = (video) => {
        // Free preview videos require no login
        if (video.is_free) {
            setActiveVideo(video);
            return;
        }

        // Protected videos require auth & admin approval
        if (!auth.user) {
            setAccessBlockedReason('unauthenticated');
            return;
        }

        if (auth.user.role !== 'admin' && auth.user.status !== 'approved') {
            setAccessBlockedReason('unapproved');
            return;
        }

        setActiveVideo(video);
    };

    // Separate free videos and protected videos
    const freeVideos = useMemo(() => videos.filter(v => v.is_free), [videos]);
    const protectedVideos = useMemo(() => videos.filter(v => !v.is_free), [videos]);

    return (
        <div className="landing-wrapper page-colorful-theme">
            <Head title={`Clinical Videos & Masterclasses - ${site_name || 'DentistChamber'}`} />

            {/* Vibrant Ambient Glow Blobs */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />
            <div className="ambient-glow glow-indigo" />

            {/* Header Navigation */}
            <header className="glass-panel landing-header header-sticky">
                <Link href="/" className="landing-brand-link">
                    <ApplicationLogo />
                </Link>

                <button 
                    type="button" 
                    className="mobile-menu-toggle"
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {mobileNavOpen ? '✕' : '☰'}
                </button>

                <nav className={`landing-nav ${mobileNavOpen ? 'mobile-nav-open' : ''}`}>
                    <Link href="/" className="nav-link-item" onClick={() => setMobileNavOpen(false)}>HOME</Link>
                    <Link href={route('videos.public')} className="nav-link-item active-nav-item" onClick={() => setMobileNavOpen(false)}>ARCHIVE</Link>
                    
                    {auth.user ? (
                        <Link href={getDashboardRoute()} className="btn btn-primary nav-btn btn-glow" onClick={() => setMobileNavOpen(false)}>
                            Dashboard →
                        </Link>
                    ) : (
                        <div className="landing-auth-buttons">
                            <Link href={route('login')} className="btn btn-outline nav-btn" onClick={() => setMobileNavOpen(false)}>
                                Login
                            </Link>
                            <Link href={route('register')} className="btn btn-primary nav-btn btn-glow" onClick={() => setMobileNavOpen(false)}>
                                Registration
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="landing-section" style={{ paddingTop: '40px', paddingBottom: '30px', flex: '1 0 auto' }}>
                <div className="landing-section-container">
                    <div className="landing-section-header" style={{ marginBottom: '28px' }}>
                        <span className="badge-status badge-new section-tag">Video Library</span>
                        <h1 className="landing-section-title">Clinical Video Masterclasses</h1>
                        <p className="landing-section-subtitle">
                            Explore open preview guides as well as exclusive surgical walkthroughs for BDS Practitioners.
                        </p>
                    </div>

                    {/* SECTION 1: Free Access Videos (No Login Required) */}
                    {freeVideos.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                            <div className="section-sub-header-row">
                                <span className="badge-status badge-completed">🎥 Free Preview Streams</span>
                                <h3 className="sub-header-title">
                                    Open Access Videos <span className="sub-header-note">(No login required)</span>
                                </h3>
                            </div>

                            <div className="video-grid free-video-grid">
                                {freeVideos.map(vid => {
                                    const ytId = getYouTubeId(vid.video_path);

                                    return (
                                        <div key={vid.id} className="glass-panel video-card colorful-video-card">
                                            <div 
                                                onClick={() => handleVideoClick(vid)}
                                                className="video-thumbnail free-video-thumb"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {ytId ? (
                                                    <img 
                                                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                        alt={vid.title} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                                                    />
                                                ) : null}

                                                <div className="thumb-overlay">
                                                    <div className="play-button-glow">
                                                        <span className="play-icon">▶</span>
                                                    </div>
                                                    <span className="play-label">Watch Free Video</span>
                                                </div>
                                                <span className="video-duration">{formatDuration(vid.duration)}</span>
                                            </div>

                                            <div className="video-info free-video-info">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span className="video-tag badge-tag-glow">
                                                        Free Access
                                                    </span>
                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                                                        Public
                                                    </span>
                                                </div>
                                                <h4 className="video-title">{vid.title}</h4>
                                                <p className="video-desc">{vid.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: Member Exclusive Masterclasses (Protected) */}
                    <div>
                        <div className="section-sub-header-row">
                            <span className="badge-status badge-new">🔒 Member Exclusive</span>
                            <h3 className="sub-header-title">
                                BDS Practitioner Masterclasses <span className="sub-header-note">(Requires Registration & Admin Approval)</span>
                            </h3>
                        </div>

                        {/* Lock Access Status Alert Banner for Unauthenticated or Unapproved Users */}
                        {(!auth.user || (auth.user && auth.user.role !== 'admin' && auth.user.status !== 'approved')) && (
                            <div className="glass-panel" style={{
                                marginBottom: '28px',
                                padding: '16px 24px',
                                borderLeft: '4px solid #f59e0b',
                                background: 'rgba(245, 158, 11, 0.08)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '15px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>🔒</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>
                                            {!auth.user ? "Registration Required for Exclusive Masterclasses" : "BDS Membership Approval Pending"}
                                        </strong>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {!auth.user 
                                                ? "Registration and login are required to play clinical member masterclass streams." 
                                                : "Your BDS membership is awaiting admin approval. Full video access will unlock once approved."}
                                        </p>
                                    </div>
                                </div>

                                {!auth.user ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Link href={route('register')} className="btn btn-primary nav-btn btn-glow">
                                            Registration
                                        </Link>
                                        <Link href={route('login')} className="btn btn-outline nav-btn">
                                            Login
                                        </Link>
                                    </div>
                                ) : (
                                    <Link href={getDashboardRoute()} className="btn btn-secondary nav-btn">
                                        Check Status in Dashboard
                                    </Link>
                                )}
                            </div>
                        )}

                        <div className="video-grid free-video-grid">
                            {protectedVideos.map(vid => {
                                const ytId = getYouTubeId(vid.video_path);
                                const isLocked = !auth.user || (auth.user && auth.user.role !== 'admin' && auth.user.status !== 'approved');

                                return (
                                    <div key={vid.id} className="glass-panel video-card colorful-video-card">
                                        <div 
                                            onClick={() => handleVideoClick(vid)}
                                            className="video-thumbnail free-video-thumb"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {ytId ? (
                                                <img 
                                                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                    alt={vid.title} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                                                />
                                            ) : null}

                                            <div className="thumb-overlay">
                                                {isLocked ? (
                                                    <>
                                                        <div className="play-button-glow" style={{ background: 'rgba(239, 68, 68, 0.25)', borderColor: '#ef4444' }}>
                                                            <span className="play-icon" style={{ fontSize: '18px' }}>🔒</span>
                                                        </div>
                                                        <span className="play-label" style={{ color: '#fca5a5' }}>
                                                            {!auth.user ? "Register to Unlock" : "Approval Required"}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="play-button-glow">
                                                            <span className="play-icon">▶</span>
                                                        </div>
                                                        <span className="play-label">Watch Full Masterclass</span>
                                                    </>
                                                )}
                                            </div>
                                            <span className="video-duration">{formatDuration(vid.duration)}</span>
                                        </div>

                                        <div className="video-info free-video-info">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span className="video-tag badge-tag-glow">
                                                    {vid.category_name || 'Masterclass'}
                                                </span>
                                                {isLocked && (
                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                                                        Protected
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="video-title">{vid.title}</h4>
                                            <p className="video-desc">{vid.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* Access Blocked Modal (Unauthenticated or Unapproved) */}
            {accessBlockedReason && (
                <div className="modal-wrapper" onClick={() => setAccessBlockedReason(null)}>
                    <div className="glass-panel modal-card modal-card-colorful" style={{ maxWidth: '480px', padding: '32px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {accessBlockedReason === 'unauthenticated' ? '🔒' : '⏳'}
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
                            {accessBlockedReason === 'unauthenticated' ? 'Registration Required' : 'Approval Pending'}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                            {accessBlockedReason === 'unauthenticated'
                                ? 'Exclusive clinical video masterclasses are strictly reserved for verified BDS Practitioners. Please register or login to your account to watch.'
                                : 'Your BDS Doctor membership is currently pending admin approval. Access to full clinical video streams will unlock as soon as your account is approved.'
                            }
                        </p>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {accessBlockedReason === 'unauthenticated' ? (
                                <>
                                    <Link href={route('register')} className="btn btn-primary hero-btn btn-glow">
                                        🌟 Registration
                                    </Link>
                                    <Link href={route('login')} className="btn btn-outline hero-btn">
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={getDashboardRoute()} className="btn btn-primary hero-btn btn-glow">
                                        Go to Dashboard
                                    </Link>
                                    <button onClick={() => setAccessBlockedReason(null)} className="btn btn-outline hero-btn">
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal (For Free Videos or Approved Users) */}
            {activeVideo && (
                <div className="modal-wrapper" onClick={() => setActiveVideo(null)}>
                    <div className="glass-panel modal-card modal-card-colorful" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🎥 {activeVideo.title}</h3>
                            <button onClick={() => setActiveVideo(null)} className="btn btn-outline close-btn">
                                Close ✕
                            </button>
                        </div>
                        <div className="modal-video-frame">
                            {getYouTubeId(activeVideo.video_path) ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(activeVideo.video_path)}?autoplay=1`} 
                                    title={activeVideo.title}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video 
                                    controls 
                                    style={{ width: '100%', height: '100%', backgroundColor: '#000' }} 
                                    controlsList="nodownload" 
                                    onContextMenu={e => e.preventDefault()}
                                    autoPlay
                                >
                                    <source src={getVideoSrc(activeVideo)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Call To Action Banner */}
            <section className="cta-banner-section" style={{ paddingBottom: '60px' }}>
                <div className="landing-section-container">
                    <div className="glass-panel cta-banner-card">
                        <h2 className="cta-title">Ready to Elevate Your Dental Practice?</h2>
                        <p className="cta-desc">
                            Join hundreds of BDS Doctors using {site_name || 'DentistChamber'} for transparent referral tracking, clinical video masterclasses, and verified digital certificates.
                        </p>
                        <div className="cta-buttons">
                            {auth.user ? (
                                <Link href={getDashboardRoute()} className="btn btn-secondary hero-btn btn-gold-glow">
                                    Open Your Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="btn btn-secondary hero-btn btn-gold-glow">
                                        🌟 Registration
                                    </Link>
                                    <Link href={route('login')} className="btn btn-outline hero-btn">
                                        Member Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

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
                                {getSetting('footer_office_location', 'Dhaka, Bangladesh')}
                            </p>
                        </div>

                        {/* Contact Information Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>📞 Contact & Support</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                                {getSetting('footer_contact_phone') && (
                                    <div>
                                        <strong>Phone:</strong> <a href={`tel:${getSetting('footer_contact_phone')}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{getSetting('footer_contact_phone')}</a>
                                    </div>
                                )}
                                {getSetting('footer_contact_email') && (
                                    <div>
                                        <strong>Email:</strong> <a href={`mailto:${getSetting('footer_contact_email')}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{getSetting('footer_contact_email')}</a>
                                    </div>
                                )}
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
                    onClick={scrollToTop} 
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
