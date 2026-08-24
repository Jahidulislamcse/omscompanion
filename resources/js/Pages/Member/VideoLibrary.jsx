import React, { useState } from 'react';
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

    // Get flat list of all videos with category information
    const allVideos = (categories || []).reduce((acc, cat) => {
        if (cat && cat.videos) {
            const vidsWithCat = cat.videos.map(v => ({
                ...v,
                category_name: cat.name
            }));
            return [...acc, ...vidsWithCat];
        }
        return acc;
    }, []);

    // Filter videos based on search & active category
    const filteredVideos = allVideos.filter(vid => {
        const query = (searchTerm || '').toLowerCase();
        const matchesSearch = 
            (vid.title || '').toLowerCase().includes(query) || 
            (vid.description && vid.description.toLowerCase().includes(query));
            
        const matchesCategory = 
            activeCategoryFilter === 'all' || 
            (vid.category_id && vid.category_id.toString() === activeCategoryFilter.toString());

        return matchesSearch && matchesCategory;
    });

    // Group filtered videos by category
    const groupedCategories = (categories || []).map(cat => {
        const catVideos = filteredVideos.filter(v => v.category_id === cat.id);
        return {
            ...cat,
            videos: catVideos
        };
    }).filter(cat => activeCategoryFilter === 'all' ? cat.videos.length > 0 : cat.id.toString() === activeCategoryFilter.toString());

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

    const renderVideoCard = (video) => {
        const ytId = getYouTubeId(video.video_path);

        return (
            <div key={video.id} className="glass-panel video-card colorful-video-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div 
                    onClick={() => handleSelectVideo(video)}
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
                                {video.category_name}
                            </span>
                        </div>

                        <h4 
                            onClick={() => handleSelectVideo(video)}
                            style={{ fontSize: '16px', fontWeight: '700', cursor: 'pointer', margin: '5px 0' }}
                        >
                            {video.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '4px 0 12px' }}>
                            {video.description || 'No description available.'}
                        </p>
                    </div>

                    <button 
                        onClick={() => handleSelectVideo(video)}
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
                        {categories.map(cat => (
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

        </MemberLayout>
    );
}
