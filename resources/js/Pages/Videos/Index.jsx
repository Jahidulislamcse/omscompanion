import { useState, useEffect, useMemo } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

function CategoryAutoRollingColumn({ categoryTitle, videos = [], onVideoClick, onLearnMoreClick }) {
    const categoryVideos = useMemo(() => {
        if (!videos || videos.length === 0) return [];

        const targetCat = categoryTitle.toLowerCase();
        let matches = videos.filter(v => {
            const cName = (v.category_name || '').toLowerCase();
            return (cName.includes('surgical') && targetCat.includes('surgical')) ||
                   (cName.includes('clinical') && targetCat.includes('clinical')) ||
                   cName === targetCat || targetCat.includes(cName);
        });

        if (matches.length === 0) {
            if (targetCat.includes('surgical')) {
                matches = videos.filter(v => 
                    (v.title || '').toLowerCase().includes('surgical') || 
                    (v.description || '').toLowerCase().includes('surgical') ||
                    (v.title || '').toLowerCase().includes('airplane') ||
                    (v.title || '').toLowerCase().includes('molar')
                );
            } else {
                matches = videos.filter(v => 
                    (v.title || '').toLowerCase().includes('clinical') || 
                    (v.description || '').toLowerCase().includes('clinical') ||
                    (v.title || '').toLowerCase().includes('imperial') ||
                    (v.title || '').toLowerCase().includes('lecture')
                );
            }
        }

        return matches.length > 0 ? matches : videos;
    }, [videos, categoryTitle]);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (categoryVideos.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % categoryVideos.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [categoryVideos]);

    if (categoryVideos.length === 0) return null;

    const currentVid = categoryVideos[currentIndex % categoryVideos.length];
    const ytId = getYouTubeId(currentVid.video_path);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <h3 className="category-column-title">{categoryTitle}</h3>

            <div className="rolling-video-card" style={{ width: '100%', cursor: 'pointer' }} onClick={() => onVideoClick(currentVid)}>
                {ytId ? (
                    <img 
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                        alt={currentVid.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{currentVid.title}</span>
                    </div>
                )}

                <div className="thumb-overlay">
                    <div className="play-button-glow golden-play-button">
                        <span className="play-icon">▶</span>
                    </div>
                    <span className="play-label" style={{ fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>WATCH VIDEO</span>
                </div>

                <span className="video-duration" style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.85)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>
                    Preview
                </span>
            </div>

            {categoryVideos.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    {categoryVideos.map((_, idx) => (
                        <span 
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: idx === currentIndex ? '20px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: idx === currentIndex ? '#0d9488' : 'rgba(15, 23, 42, 0.25)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            )}

            <div style={{ marginTop: '18px', textAlign: 'center' }}>
                <button 
                    onClick={() => onLearnMoreClick(currentVid)}
                    className="learn-more-btn"
                >
                    <span>LEARN MORE</span>
                    <svg className="cursor-hand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 11V3.5C7 2.67157 7.67157 2 8.5 2C9.32843 2 10 2.67157 10 3.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 10.5V5.5C10 4.67157 10.6716 4 11.5 4C12.3284 4 13 4.67157 13 5.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M13 10.5V7.5C13 6.67157 13.6716 6 14.5 6C15.3284 6 16 6.67157 16 7.5V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 11.5V10.5C16 9.67157 16.6716 9 17.5 9C18.3284 9 19 9.67157 19 10.5V16C19 19.3137 22 13 22H11C8.23858 22 6 19.7614 6 17V14.5C6 13.6716 6.67157 13 7.5 13C8.32843 13 9 13.6716 9 14.5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function Index({ categories = [], videos = [], settings = {} }) {
    const { auth, site_name } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);
    const [accessBlockedReason, setAccessBlockedReason] = useState(null); // 'unauthenticated' | null
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Filter states for Logged-In Category-based view
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

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
        if (!seconds) return 'Video';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVideoClick = (video) => {
        setActiveVideo(video);
    };

    const handleLearnMoreClick = (video) => {
        if (!auth.user) {
            setAccessBlockedReason('unauthenticated');
        } else {
            setActiveVideo(video);
        }
    };

    // Filter videos for logged-in category based view
    const filteredVideos = useMemo(() => {
        return (videos || []).filter(vid => {
            const query = (searchTerm || '').toLowerCase();
            const matchesSearch = 
                (vid.title || '').toLowerCase().includes(query) || 
                (vid.description && vid.description.toLowerCase().includes(query));
                
            const matchesCategory = 
                activeCategoryFilter === 'all' || 
                (vid.category_id && vid.category_id.toString() === activeCategoryFilter.toString());

            return matchesSearch && matchesCategory;
        });
    }, [videos, searchTerm, activeCategoryFilter]);

    // Group filtered videos by category for logged-in view
    const groupedCategories = useMemo(() => {
        if (categories && categories.length > 0) {
            return categories.map(cat => {
                const catVideos = filteredVideos.filter(v => v.category_id === cat.id);
                return {
                    ...cat,
                    videos: catVideos
                };
            }).filter(cat => activeCategoryFilter === 'all' ? cat.videos.length > 0 : cat.id.toString() === activeCategoryFilter.toString());
        }

        // Fallback grouping by category_name property if categories prop is empty
        const groups = {};
        filteredVideos.forEach(v => {
            const catName = v.category_name || 'General Masterclasses';
            if (!groups[catName]) {
                groups[catName] = { id: v.category_id || catName, name: catName, videos: [] };
            }
            groups[catName].videos.push(v);
        });
        return Object.values(groups);
    }, [categories, filteredVideos, activeCategoryFilter]);

    const renderVideoCard = (video) => {
        const ytId = getYouTubeId(video.video_path);

        return (
            <div key={video.id} className="glass-panel video-card colorful-video-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div 
                    onClick={() => handleVideoClick(video)}
                    style={{ 
                        width: '100%', 
                        aspectRatio: '16/9', 
                        backgroundColor: '#0a1215', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    className="video-thumbnail free-video-thumb"
                >
                    {ytId ? (
                        <img 
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                            alt={video.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                        />
                    ) : null}

                    <div className="thumb-overlay">
                        <div className="play-button-glow golden-play-button">
                            <span className="play-icon">▶</span>
                        </div>
                        <span className="play-label" style={{ color: '#fff', fontWeight: '800' }}>
                            Stream Video
                        </span>
                    </div>
                    <span className="video-duration">{formatDuration(video.duration)}</span>
                </div>

                <div className="video-info free-video-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="video-tag badge-tag-glow" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                {video.category_name || 'Masterclass'}
                            </span>
                        </div>

                        <h4 
                            onClick={() => handleVideoClick(video)}
                            style={{ fontSize: '16px', fontWeight: '700', cursor: 'pointer', margin: '5px 0' }}
                        >
                            {video.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '4px 0 12px' }}>
                            {video.description || 'No description available.'}
                        </p>
                    </div>

                    <button 
                        onClick={() => handleVideoClick(video)}
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '13px', padding: '8px 12px' }}
                    >
                        ▶ Watch Video
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="landing-wrapper page-colorful-theme">
            <Head title={`Clinical Videos & Masterclasses - ${site_name || 'DentistChamber'}`} />

            {/* Ambient Glow Blobs */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />
            <div className="ambient-glow glow-indigo" />

            {/* Header Navigation */}
            <PublicNavbar activePage="archive" />

            {/* Main Content Area */}
            <main className="landing-section" style={{ paddingTop: '40px', paddingBottom: '30px', flex: '1 0 auto' }}>
                <div className="landing-section-container">
                    
                    {/* UNAUTHENTICATED VIEW: Same 2-Column Auto Rolling Carousel Layout as Home */}
                    {!auth.user ? (
                        <div>
                            {/* Top Archive Pill Button */}
                            <div className="video-archive-pill-wrapper">
                                <Link href={route('videos.public')} className="archive-pill-btn">
                                    archive
                                </Link>
                            </div>

                            {/* Section Header */}
                            <div className="landing-section-header" style={{ marginBottom: '16px' }}>
                                <h2 className="landing-section-title video-masterclasses-title">Video Masterclasses</h2>
                                <p className="landing-section-subtitle video-masterclasses-subtitle">
                                    Explore clinical guides, surgical techniques, and practical tips& tricks
                                </p>
                            </div>

                            {/* Two Categories Side-by-Side Grid */}
                            <div className="masterclasses-two-column-grid">
                                {/* Category 1 Column */}
                                <CategoryAutoRollingColumn 
                                    categoryTitle="Surgical approaches" 
                                    videos={videos} 
                                    onVideoClick={handleVideoClick} 
                                    onLearnMoreClick={handleLearnMoreClick}
                                />

                                {/* Category 2 Column */}
                                <CategoryAutoRollingColumn 
                                    categoryTitle="Clinical lecture/ tips tricks" 
                                    videos={videos} 
                                    onVideoClick={handleVideoClick} 
                                    onLearnMoreClick={handleLearnMoreClick}
                                />
                            </div>
                        </div>
                    ) : (
                        /* LOGGED IN VIEW: Category-Based Full Video Library */
                        <div>
                            <div className="landing-section-header" style={{ marginBottom: '24px' }}>
                                <h1 className="landing-section-title video-masterclasses-title">Clinical Video Library</h1>
                                <p className="landing-section-subtitle video-masterclasses-subtitle">
                                    Browse clinical guides, surgical approaches, and practical tips & tricks grouped by category.
                                </p>
                            </div>

                            {/* Search and Category Filter Bar */}
                            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap', marginBottom: '28px' }}>
                                <div style={{ display: 'flex', gap: '12px', flexGrow: 1, maxWidth: '650px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search video by title or description..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ flex: '1 1 220px' }}
                                    />
                                    
                                    {/* Category Filter Pills */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveCategoryFilter('all')}
                                            className={`btn ${activeCategoryFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '20px' }}
                                        >
                                            All Categories
                                        </button>
                                        {(categories || []).map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setActiveCategoryFilter(cat.id.toString())}
                                                className={`btn ${activeCategoryFilter.toString() === cat.id.toString() ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '20px' }}
                                            >
                                                📁 {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                    {filteredVideos.length} Videos Available
                                </div>
                            </div>

                            {/* Videos Grouped By Category */}
                            {groupedCategories.length > 0 ? (
                                groupedCategories.map(cat => (
                                    <div key={cat.id} style={{ marginBottom: '40px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
                                            <span style={{ fontSize: '20px' }}>📁</span>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--accent-teal)' }}>
                                                    {cat.name}
                                                </h3>
                                                {cat.description && (
                                                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        {cat.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="video-grid">
                                            {cat.videos.map(video => renderVideoCard(video))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No videos found matching your search or category filter.
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* Access Blocked / Registration Required Modal */}
            {accessBlockedReason && (
                <div className="modal-wrapper" onClick={() => setAccessBlockedReason(null)}>
                    <div 
                        className="modal-card-colorful" 
                        style={{ 
                            maxWidth: '500px', 
                            width: '92%',
                            padding: '36px 28px', 
                            textAlign: 'center',
                            backgroundColor: '#0f172a',
                            borderRadius: '20px',
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.25)',
                            position: 'relative'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setAccessBlockedReason(null)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '4px 8px'
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ 
                            width: '72px', 
                            height: '72px', 
                            borderRadius: '50%', 
                            backgroundColor: 'rgba(245, 158, 11, 0.15)', 
                            border: '2px solid rgba(245, 158, 11, 0.4)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            fontSize: '36px'
                        }}>
                            🔒
                        </div>

                        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px', color: '#ffffff', letterSpacing: '-0.3px' }}>
                            Registration Required
                        </h3>
                        
                        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
                            Clinical video masterclasses are strictly reserved for verified BDS Practitioners. Please register or login to your account to watch.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link 
                                href={route('register')} 
                                style={{ 
                                    backgroundColor: '#0d9488', 
                                    color: '#ffffff', 
                                    fontWeight: '700', 
                                    fontSize: '14px',
                                    padding: '12px 24px', 
                                    borderRadius: '30px', 
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
                                }}
                            >
                                🌟 Registration
                            </Link>
                            <Link 
                                href={route('login')} 
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    border: '2px solid #f59e0b', 
                                    color: '#fbbf24', 
                                    fontWeight: '700', 
                                    fontSize: '14px',
                                    padding: '10px 24px', 
                                    borderRadius: '30px', 
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {activeVideo && (
                <div className="modal-wrapper" onClick={() => setActiveVideo(null)}>
                    <div className="glass-panel modal-card modal-card-colorful" style={{ maxWidth: '800px', width: '90%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#0f172a' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>🎥 {activeVideo.title}</h3>
                            <button onClick={() => setActiveVideo(null)} className="btn btn-outline" style={{ padding: '4px 10px', color: '#fff' }}>
                                Close ✕
                            </button>
                        </div>
                        <div className="modal-video-frame" style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#000' }}>
                            {getYouTubeId(activeVideo.video_path) ? (
                                <iframe 
                                    style={{ width: '100%', height: '100%', border: 'none' }} 
                                    src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(activeVideo.video_path)}?autoplay=1`} 
                                    title={activeVideo.title}
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
                                    <source src={route('videos.public_stream', activeVideo.id)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                        {activeVideo.description && (
                            <div style={{ padding: '20px 24px', backgroundColor: '#0b131f' }}>
                                <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                                    {activeVideo.description}
                                </p>
                            </div>
                        )}
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
