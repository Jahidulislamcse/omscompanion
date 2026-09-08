import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function VideoLibrary({ categories = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
    const [activeAccessFilter, setActiveAccessFilter] = useState('all'); // 'all' | 'free' | 'premium'
    const [viewLayout, setViewLayout] = useState('list'); // Default to list view layout

    // Get flat list of all videos with category information
    const allVideos = useMemo(() => {
        return (categories || []).reduce((acc, cat) => {
            if (cat && cat.videos) {
                const vidsWithCat = cat.videos.map(v => ({
                    ...v,
                    category_name: cat.name
                }));
                return [...acc, ...vidsWithCat];
            }
            return acc;
        }, []);
    }, [categories]);

    // Filter videos based on search, active category & access filter
    const filteredVideos = useMemo(() => {
        return allVideos.filter(vid => {
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
    }, [allVideos, searchTerm, activeCategoryFilter, activeAccessFilter]);

    // Group filtered videos by category (Free videos first, then Premium)
    const groupedCategories = useMemo(() => {
        return (categories || []).map(cat => {
            const catVideos = filteredVideos.filter(v => v.category_id === cat.id);
            // Sort videos: free videos first, then premium
            const sortedVideos = [...catVideos].sort((a, b) => (b.is_free ? 1 : 0) - (a.is_free ? 1 : 0));
            return {
                ...cat,
                videos: sortedVideos
            };
        }).filter(cat => activeCategoryFilter === 'all' ? cat.videos.length > 0 : cat.id.toString() === activeCategoryFilter.toString());
    }, [categories, filteredVideos, activeCategoryFilter]);

    const handleSelectVideo = (video) => {
        setSelectedVideo(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'Video';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Render Video Item in List Manner
    const renderVideoListItem = (video) => {
        const ytId = getYouTubeId(video.video_path);
        const isFree = Boolean(video.is_free);

        return (
            <div 
                key={video.id} 
                className="glass-panel video-list-item"
                onClick={() => handleSelectVideo(video)}
                style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '10px',
                    cursor: 'pointer'
                }}
            >
                {/* Reduced Preview / Thumbnail */}
                <div 
                    style={{
                        flexShrink: 0,
                        width: '120px',
                        aspectRatio: '16/9',
                        backgroundColor: '#0a1215',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
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
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px', padding: '4px', textAlign: 'center' }}>
                            {video.title}
                        </div>
                    )}

                    <div className="thumb-overlay" style={{ borderRadius: '8px' }}>
                        <div className="play-button-glow golden-play-button" style={{ width: '30px', height: '30px' }}>
                            <span className="play-icon" style={{ fontSize: '12px' }}>▶</span>
                        </div>
                    </div>

                    <span className="video-duration" style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', padding: '2px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', color: '#ffffff' }}>
                        {formatDuration(video.duration)}
                    </span>
                </div>

                {/* Content Info (Title, Short Description) */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                    <h3 
                        className="video-list-title"
                        style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#1e293b',
                            margin: 0,
                            lineHeight: '1.35'
                        }}
                    >
                        {video.title}
                    </h3>

                    <p style={{ 
                        fontSize: '12px', 
                        color: '#475569', 
                        fontWeight: '400',
                        margin: 0,
                        lineHeight: '1.45',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {video.description || 'No detailed description available.'}
                    </p>
                </div>

                {/* Right Side: Free / Premium Tag */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} className="video-list-action">
                    {isFree ? (
                        <span className="video-badge-free" style={{ padding: '4px 10px', fontSize: '11px' }}>
                            🔓 FREE
                        </span>
                    ) : (
                        <span className="video-badge-premium" style={{ padding: '4px 10px', fontSize: '11px' }}>
                            👑 PREMIUM
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Render Video Card in Grid Manner
    const renderVideoCard = (video) => {
        const ytId = getYouTubeId(video.video_path);
        const isFree = Boolean(video.is_free);

        return (
            <div 
                key={video.id} 
                onClick={() => handleSelectVideo(video)}
                className="glass-panel video-card colorful-video-card" 
                style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}
            >
                <div 
                    style={{ 
                        width: '100%', 
                        aspectRatio: '16/9', 
                        backgroundColor: '#0a1215', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
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

                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '5px 0', lineHeight: '1.3' }}>
                            {video.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#475569', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '4px 0 0' }}>
                            {video.description || 'No description available.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <MemberLayout title="Educational Video Library">
            <Head title="Video Library" />

            {/* Video Player Section */}
            {selectedVideo && (
                <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden', border: '2px solid var(--accent-gold)', marginBottom: '24px' }}>
                    <div className="video-player-container" style={{ position: 'relative', aspectRatio: '16/9' }}>
                        {getYouTubeId(selectedVideo.video_path) ? (
                            <iframe 
                                className="video-player"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(selectedVideo.video_path)}?autoplay=1`} 
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <video 
                                className="video-player"
                                controls
                                controlsList="nodownload"
                                onContextMenu={e => e.preventDefault()}
                                src={route('member.videos.stream', selectedVideo.id)}
                                autoPlay
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}
                        <button 
                            onClick={() => setSelectedVideo(null)} 
                            className="btn btn-danger" 
                            style={{ position: 'absolute', top: '15px', right: '15px', padding: '6px 12px', zIndex: 10, borderRadius: '20px', fontWeight: 'bold' }}
                        >
                            ✕ Close Player
                        </button>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className="badge-status badge-new">{selectedVideo.category_name}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Duration: {formatDuration(selectedVideo.duration)}</span>
                        </div>
                        <h2 style={{ fontSize: '22px', margin: '0 0 10px 0' }}>{selectedVideo.title}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                            {selectedVideo.description || 'No description available.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Filter and Control Bar */}
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '28px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search Bar */}
                    <div style={{ flex: '1 1 240px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search video title or topic..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Access Filter Pills */}
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

                    {/* View Manner Switcher & Count */}
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
            </div>

            {/* Videos Grouped Into Category Sections (Rendered Side-by-Side on Desktop View) */}
            {groupedCategories.length > 0 ? (
                <div className="masterclasses-two-column-grid">
                    {groupedCategories.map(cat => (
                        <div 
                            key={cat.id} 
                            className="glass-panel category-section-card" 
                            style={{ 
                                padding: '24px', 
                                borderRadius: '20px', 
                                marginBottom: '24px', 
                                display: 'flex', 
                                flexDirection: 'column',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                                height: '100%'
                            }}
                        >
                            {/* Category Header */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                marginBottom: '18px', 
                                borderBottom: '2px solid var(--accent-teal)', 
                                paddingBottom: '12px' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        width: '38px', 
                                        height: '38px', 
                                        borderRadius: '10px', 
                                        backgroundColor: 'rgba(13, 148, 136, 0.15)', 
                                        border: '1px solid rgba(13, 148, 136, 0.3)',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontSize: '18px'
                                    }}>
                                        📁
                                    </div>
                                    <div>
                                        <h2 className="category-section-title" style={{ margin: 0, fontWeight: '800', color: 'var(--accent-teal)', fontSize: '18px' }}>
                                            {cat.name}
                                        </h2>
                                        {cat.description && (
                                            <p className="category-section-desc" style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                {cat.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span style={{ 
                                    fontSize: '11px', 
                                    fontWeight: '700', 
                                    backgroundColor: 'rgba(255,255,255,0.08)', 
                                    color: 'var(--text-muted)', 
                                    padding: '4px 12px', 
                                    borderRadius: '20px' 
                                }}>
                                    {cat.videos.length} {cat.videos.length === 1 ? 'Video' : 'Videos'}
                                </span>
                            </div>

                            {/* Category Videos Display */}
                            {viewLayout === 'list' ? (
                                /* LIST MANNER DISPLAY */
                                <div className="video-list-container" style={{ flex: 1 }}>
                                    {cat.videos.map(video => renderVideoListItem(video))}
                                </div>
                            ) : (
                                /* GRID MANNER DISPLAY */
                                <div className="video-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', flex: 1 }}>
                                    {cat.videos.map(video => renderVideoCard(video))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No videos found matching your search or category filter.
                </div>
            )}
        </MemberLayout>
    );
}
