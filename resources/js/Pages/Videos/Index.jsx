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

export default function Index({ categories = [], videos = [], settings = {} }) {
    const { auth, site_name } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);
    const [accessBlockedReason, setAccessBlockedReason] = useState(null); // 'unauthenticated' | null
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
    const [activeAccessFilter, setActiveAccessFilter] = useState('all'); // 'all' | 'free' | 'premium'
    const [viewLayout, setViewLayout] = useState('list'); // Default to list manner

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
        if (!auth || !auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'Video';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVideoClick = (video) => {
        if (!video.is_free && (!auth || !auth.user)) {
            setAccessBlockedReason('unauthenticated');
        } else {
            setActiveVideo(video);
        }
    };

    // Filter videos based on search, category, and access status
    const filteredVideos = useMemo(() => {
        return (videos || []).filter(vid => {
            const query = (searchTerm || '').toLowerCase();
            const matchesSearch = 
                (vid.title || '').toLowerCase().includes(query) || 
                (vid.description && vid.description.toLowerCase().includes(query));
                
            const matchesCategory = 
                activeCategoryFilter === 'all' || 
                (vid.category_id && vid.category_id.toString() === activeCategoryFilter.toString());

            const isFree = Boolean(vid.is_free);
            const matchesAccess = 
                activeAccessFilter === 'all' ||
                (activeAccessFilter === 'free' && isFree) ||
                (activeAccessFilter === 'premium' && !isFree);

            return matchesSearch && matchesCategory && matchesAccess;
        });
    }, [videos, searchTerm, activeCategoryFilter, activeAccessFilter]);

    // Render Video Item in List Manner
    const renderVideoListItem = (video) => {
        const ytId = getYouTubeId(video.video_path);
        const isFree = Boolean(video.is_free);

        return (
            <div 
                key={video.id} 
                className="glass-panel video-list-item"
                style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '18px',
                    borderRadius: '16px',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '14px'
                }}
            >
                {/* Preview / Thumbnail */}
                <div 
                    onClick={() => handleVideoClick(video)}
                    style={{
                        flexShrink: 0,
                        width: '240px',
                        aspectRatio: '16/9',
                        backgroundColor: '#0a1215',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                    }}
                    className="video-thumbnail-list free-video-thumb"
                >
                    {ytId ? (
                        <img 
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                            alt={video.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', padding: '10px', textAlign: 'center' }}>
                            {video.title}
                        </div>
                    )}

                    <div className="thumb-overlay" style={{ borderRadius: '12px' }}>
                        <div className="play-button-glow golden-play-button" style={{ width: '42px', height: '42px', fontSize: '16px' }}>
                            <span className="play-icon">▶</span>
                        </div>
                    </div>

                    <span className="video-duration" style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: '#ffffff' }}>
                        {formatDuration(video.duration)}
                    </span>
                </div>

                {/* Content Info (Category Tag, Free/Premium, Title, Short Description) */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Free / Premium Badge */}
                        {isFree ? (
                            <span className="video-badge-free">
                                🔓 FREE
                            </span>
                        ) : (
                            <span className="video-badge-premium">
                                👑 PREMIUM
                            </span>
                        )}

                        {/* Category Tag */}
                        <span style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-muted)',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600'
                        }}>
                            📁 {video.category_name || 'General'}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 
                        onClick={() => handleVideoClick(video)}
                        className="video-list-title"
                        style={{ 
                            fontSize: '17px', 
                            fontWeight: '700', 
                            cursor: 'pointer', 
                            margin: 0,
                            lineHeight: '1.3'
                        }}
                    >
                        {video.title}
                    </h3>

                    {/* Short Description */}
                    <p style={{ 
                        fontSize: '13px', 
                        color: 'var(--text-muted)', 
                        margin: 0,
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {video.description || 'No detailed description available.'}
                    </p>
                </div>

                {/* Watch Action Button */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} className="video-list-action">
                    <button 
                        onClick={() => handleVideoClick(video)}
                        className={`btn ${isFree ? 'btn-primary' : 'btn-secondary btn-gold-glow'}`}
                        style={{ 
                            padding: '10px 18px', 
                            fontSize: '13px', 
                            fontWeight: '700',
                            borderRadius: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {isFree ? '▶ Watch Free Video' : '🔒 Watch Premium Video'}
                    </button>
                </div>
            </div>
        );
    };

    // Render Video Card in Grid Manner
    const renderVideoCard = (video) => {
        const ytId = getYouTubeId(video.video_path);
        const isFree = Boolean(video.is_free);

        return (
            <div key={video.id} className="glass-panel video-card colorful-video-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
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
                                📁 {video.category_name || 'Masterclass'}
                            </span>
                            {isFree ? (
                                <span className="video-badge-free">
                                    🔓 FREE
                                </span>
                            ) : (
                                <span className="video-badge-premium">
                                    👑 PREMIUM
                                </span>
                            )}
                        </div>

                        <h4 
                            onClick={() => handleVideoClick(video)}
                            style={{ fontSize: '16px', fontWeight: '700', cursor: 'pointer', margin: '5px 0', lineHeight: '1.3' }}
                        >
                            {video.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '4px 0 12px' }}>
                            {video.description || 'No description available.'}
                        </p>
                    </div>

                    <button 
                        onClick={() => handleVideoClick(video)}
                        className={`btn ${isFree ? 'btn-primary' : 'btn-secondary btn-gold-glow'}`}
                        style={{ width: '100%', fontSize: '13px', padding: '8px 12px', fontWeight: '700' }}
                    >
                        {isFree ? '▶ Watch Free Video' : '🔒 Watch Premium Video'}
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
            <main className="landing-section" style={{ paddingTop: '40px', paddingBottom: '40px', flex: '1 0 auto' }}>
                <div className="landing-section-container">
                    
                    {/* Page Section Header */}
                    <div className="landing-section-header" style={{ marginBottom: '28px', textAlign: 'center' }}>
                        <div className="video-archive-pill-wrapper" style={{ marginBottom: '10px' }}>
                            <Link href={route('videos.public')} className="archive-pill-btn">
                                Clinical Archive
                            </Link>
                        </div>
                        <h1 className="landing-section-title video-masterclasses-title" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
                            Clinical Videos & Masterclasses
                        </h1>
                        <p className="landing-section-subtitle video-masterclasses-subtitle" style={{ maxWidth: '650px', margin: '0 auto' }}>
                            Explore surgical guides, clinical lectures, and practical tips & tricks for BDS practitioners.
                        </p>
                    </div>

                    {/* Search, Filter & Layout Toolbar */}
                    <div className="glass-panel" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', flexWrap: 'wrap', marginBottom: '24px', borderRadius: '16px' }}>
                        {/* Search Bar */}
                        <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="🔍 Search by title or keyword..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Access Filter Pills (All / Free / Premium) */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setActiveAccessFilter('all')}
                                className={`btn ${activeAccessFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                            >
                                All Access
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveAccessFilter('free')}
                                className={`btn ${activeAccessFilter === 'free' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                            >
                                🔓 Free Only
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveAccessFilter('premium')}
                                className={`btn ${activeAccessFilter === 'premium' ? 'btn-secondary btn-gold-glow' : 'btn-outline'}`}
                                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                            >
                                👑 Premium Only
                            </button>
                        </div>

                        {/* Category Filter Pills */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setActiveCategoryFilter('all')}
                                className={`btn ${activeCategoryFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                            >
                                All Categories
                            </button>
                            {(categories || []).map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveCategoryFilter(cat.id.toString())}
                                    className={`btn ${activeCategoryFilter.toString() === cat.id.toString() ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                                >
                                    📁 {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* View Manner Switcher & Results Count */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                {filteredVideos.length} Videos
                            </span>

                            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setViewLayout('list')}
                                    className={`btn ${viewLayout === 'list' ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                                    title="List View"
                                >
                                    ☰ List
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewLayout('grid')}
                                    className={`btn ${viewLayout === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                                    title="Grid View"
                                >
                                    ⣿ Grid
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Videos Container */}
                    {filteredVideos.length > 0 ? (
                        viewLayout === 'list' ? (
                            /* LIST MANNER DISPLAY */
                            <div className="video-list-container">
                                {filteredVideos.map(video => renderVideoListItem(video))}
                            </div>
                        ) : (
                            /* GRID MANNER DISPLAY */
                            <div className="video-grid">
                                {filteredVideos.map(video => renderVideoCard(video))}
                            </div>
                        )
                    ) : (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)', borderRadius: '16px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>No videos found</h3>
                            <p style={{ fontSize: '14px', margin: 0 }}>Try clearing your search query or choosing another category/access filter.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setActiveCategoryFilter('all'); setActiveAccessFilter('all'); }} 
                                className="btn btn-outline" 
                                style={{ marginTop: '16px', fontSize: '13px' }}
                            >
                                Reset Filters
                            </button>
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
                            Premium clinical video masterclasses are strictly reserved for verified BDS Practitioners. Please register or login to your account to watch.
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
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>🎥 {activeVideo.title}</h3>
                                {activeVideo.is_free ? (
                                    <span className="video-badge-free">🔓 FREE</span>
                                ) : (
                                    <span className="video-badge-premium">👑 PREMIUM</span>
                                )}
                            </div>
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
                            {auth && auth.user ? (
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
