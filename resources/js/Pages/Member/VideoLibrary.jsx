import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function VideoLibrary({ categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

    // Get flat list of all videos with their category name
    const allVideos = categories.reduce((acc, cat) => {
        if (cat.videos) {
            const vidsWithCat = cat.videos.map(v => ({
                ...v,
                category_name: cat.name
            }));
            return [...acc, ...vidsWithCat];
        }
        return acc;
    }, []);

    // Filter videos based on search and category filter
    const filteredVideos = allVideos.filter(vid => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            vid.title.toLowerCase().includes(query) || 
            (vid.description && vid.description.toLowerCase().includes(query));
            
        const matchesCategory = 
            activeCategoryFilter === 'all' || 
            vid.category_id.toString() === activeCategoryFilter.toString();

        return matchesSearch && matchesCategory;
    });

    const handleSelectVideo = (video) => {
        setSelectedVideo(video);
        // Scroll to player smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <MemberLayout title="Premium Educational Video Library">
            <Head title="Premium Video Library" />

            {/* Video Player Modal/Section (if a video is selected) */}
            {selectedVideo && (
                <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden', border: '2px solid var(--accent-gold)' }}>
                    <div className="video-player-container" style={{ position: 'relative' }}>
                        {/* Custom video tag with security attributes */}
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
                        <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--color-warning)', fontWeight: 'bold', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span>🔒</span> Secure Streaming Mode Enabled (Direct downloads are blocked)
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Category Filters */}
            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '15px', flexGrow: 1, maxWidth: '600px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search video by title or description..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="form-control"
                        style={{ maxWidth: '200px' }}
                        value={activeCategoryFilter}
                        onChange={e => setActiveCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Found {filteredVideos.length} premium videos
                </div>
            </div>

            {/* Videos Grid */}
            <div className="video-grid">
                {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                        <div key={video.id} className="glass-panel video-card">
                            {/* Video Thumbnail Placeholder with Play button */}
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
                                    transition: 'var(--transition-smooth)'
                                }}
                                className="video-thumbnail"
                            >
                                <span style={{ fontSize: '48px', color: 'var(--accent-gold)', textShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}>▶</span>
                                <span style={{ fontSize: '12px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginTop: '8px' }}>
                                    Stream Video
                                </span>
                                <span className="video-duration">{formatDuration(video.duration)}</span>
                            </div>

                            <div className="video-info">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                                        {video.category_name}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                                        Added: {new Date(video.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 
                                    onClick={() => handleSelectVideo(video)}
                                    style={{ fontSize: '16px', fontWeight: '700', cursor: 'pointer', margin: '5px 0' }}
                                >
                                    {video.title}
                                </h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>
                                    {video.description || 'No description available.'}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                        No videos found matching your filters.
                    </div>
                )}
            </div>
        </MemberLayout>
    );
}
