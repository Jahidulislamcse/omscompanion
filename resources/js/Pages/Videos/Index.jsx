import { useState, useEffect, useMemo } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function Index({ categories, videos }) {
    const { auth, site_name } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);
    const [videoFilter, setVideoFilter] = useState('all');
    const [accessBlockedReason, setAccessBlockedReason] = useState(null); // 'unauthenticated' | 'unapproved' | null
    const [showScrollTop, setShowScrollTop] = useState(false);

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
        // Access Control Verification:
        // 1. Must be logged in (registered)
        // 2. If logged in, account status must be 'approved' (or user is admin)
        if (!auth.user) {
            setAccessBlockedReason('unauthenticated');
            return;
        }

        if (auth.user.role !== 'admin' && auth.user.status !== 'approved') {
            setAccessBlockedReason('unapproved');
            return;
        }

        // Allowed to watch video
        setActiveVideo(video);
    };

    const filteredVideos = useMemo(() => {
        if (videoFilter === 'all') return videos;
        if (videoFilter === 'clinical') {
            return videos.filter(v => 
                v.category_name.toLowerCase().includes('clinical') || 
                v.title.toLowerCase().includes('clinical') || 
                v.title.toLowerCase().includes('tutorial') || 
                v.title.toLowerCase().includes('surgical')
            );
        }
        if (videoFilter === 'platform') {
            return videos.filter(v => 
                v.category_name.toLowerCase().includes('platform') || 
                v.title.toLowerCase().includes('system') || 
                v.title.toLowerCase().includes('overview') || 
                v.title.toLowerCase().includes('referral')
            );
        }
        return videos;
    }, [videos, videoFilter]);

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

                <nav className="landing-nav">
                    <Link href="/" className="nav-link-item">Home</Link>
                    <Link href={route('videos.public')} className="nav-link-item active-nav-item">Videos</Link>
                    
                    {auth.user ? (
                        <Link href={getDashboardRoute()} className="btn btn-primary nav-btn btn-glow">
                            Dashboard →
                        </Link>
                    ) : (
                        <div className="landing-auth-buttons">
                            <Link href={route('login')} className="btn btn-outline nav-btn">
                                Login
                            </Link>
                            <Link href={route('register')} className="btn btn-primary nav-btn btn-glow">
                                Registration
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="landing-section" style={{ paddingTop: '120px', minHeight: '80vh' }}>
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-new section-tag">Exclusive Video Library</span>
                        <h1 className="landing-section-title">Clinical Video Masterclasses</h1>
                        <p className="landing-section-subtitle">
                            High-definition surgical technique walkthroughs, clinical protocols, and platform operational guides for BDS Practitioners.
                        </p>

                        {/* Interactive Filter Tabs */}
                        <div className="video-filter-tabs" style={{ marginTop: '20px' }}>
                            <button 
                                onClick={() => setVideoFilter('all')} 
                                className={`filter-tab ${videoFilter === 'all' ? 'active' : ''}`}
                            >
                                All Videos ({videos.length})
                            </button>
                            <button 
                                onClick={() => setVideoFilter('clinical')} 
                                className={`filter-tab ${videoFilter === 'clinical' ? 'active' : ''}`}
                            >
                                💉 Clinical Tutorials
                            </button>
                            <button 
                                onClick={() => setVideoFilter('platform')} 
                                className={`filter-tab ${videoFilter === 'platform' ? 'active' : ''}`}
                            >
                                💻 Platform Guides
                            </button>
                        </div>
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
                                        {!auth.user ? "Registration Required for Video Access" : "BDS Membership Approval Pending"}
                                    </strong>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        {!auth.user 
                                            ? "Registration and login are required to play clinical masterclass streams." 
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

                    {/* Video Cards Grid */}
                    <div className="video-grid free-video-grid">
                        {filteredVideos.map(vid => {
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
                                ? 'Clinical video masterclasses are strictly reserved for verified BDS Practitioners. Please register or login to your account to watch.'
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

            {/* Video Player Modal (For Approved Users) */}
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

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <Link href="/" className="landing-brand-link">
                        <ApplicationLogo />
                    </Link>
                    <p>
                        © 2026 {site_name || 'DentistChamber'} Association. All Rights Reserved. BDS Practitioner Referral & Learning Network.
                    </p>
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
