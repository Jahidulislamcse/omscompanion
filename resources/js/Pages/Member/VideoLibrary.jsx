import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function VideoLibrary({ categories = [] }) {
    const { auth } = usePage().props;
    const premiumAccess = auth.user.premium_access || 'none';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
    const [requesting, setRequesting] = useState(false);

    // Get flat list of all videos with their category name
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

    // Filter videos based on search, category and free vs premium status
    const filteredVideos = allVideos.filter(vid => {
        const query = (searchTerm || '').toLowerCase();
        const matchesSearch = 
            (vid.title || '').toLowerCase().includes(query) || 
            (vid.description && vid.description.toLowerCase().includes(query));
            
        const matchesCategory = 
            activeCategoryFilter === 'all' || 
            vid.category_id.toString() === activeCategoryFilter.toString();

        return matchesSearch && matchesCategory;
    });

    const freeVideos = filteredVideos.filter(v => v.is_free);
    const premiumVideos = filteredVideos.filter(v => !v.is_free);

    const handleSelectVideo = (video) => {
        if (!video.is_free && premiumAccess !== 'approved') {
            alert('This is a premium video. Please request access from Admin.');
            return;
        }
        setSelectedVideo(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRequestPremiumAccess = () => {
        setRequesting(true);
        router.post(route('member.videos.request_premium_access'), {}, {
            preserveScroll: true,
            onFinish: () => setRequesting(false)
        });
    };

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
        if (!seconds) return 'Video';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderVideoCard = (video) => {
        const ytId = getYouTubeId(video.video_path);
        const isUnlocked = video.is_free || premiumAccess === 'approved';

        return (
            <div key={video.id} className="glass-panel video-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div 
                    onClick={() => isUnlocked && handleSelectVideo(video)}
                    style={{ 
                        width: '100%', 
                        aspectRatio: '16/9', 
                        backgroundColor: '#0a1215', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: isUnlocked ? 'pointer' : 'default',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    className="video-thumbnail"
                >
                    {ytId ? (
                        <img 
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                            alt={video.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUnlocked ? 1 : 0.3 }} 
                        />
                    ) : null}

                    <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        backgroundColor: isUnlocked ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.7)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '12px',
                        textAlign: 'center'
                    }}>
                        {isUnlocked ? (
                            <>
                                <span style={{ fontSize: '42px', color: 'var(--accent-gold)', textShadow: '0 0 15px rgba(212, 175, 55, 0.6)' }}>▶</span>
                                <span style={{ fontSize: '11px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginTop: '4px' }}>
                                    Stream Video
                                </span>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '32px' }}>🔒</span>
                                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 'bold', marginTop: '6px', textTransform: 'uppercase' }}>
                                    Locked Premium
                                </span>
                            </>
                        )}
                    </div>
                    <span className="video-duration">{formatDuration(video.duration)}</span>
                </div>

                <div className="video-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                                {video.category_name}
                            </span>
                            {video.is_free ? (
                                <span className="badge-status badge-new" style={{ fontSize: '10px' }}>🔓 Free Preview</span>
                            ) : (
                                <span className={`badge-status ${premiumAccess === 'approved' ? 'badge-completed' : 'badge-treatment'}`} style={{ fontSize: '10px' }}>
                                    {premiumAccess === 'approved' ? '🔓 Unlocked' : '🔒 Premium'}
                                </span>
                            )}
                        </div>

                        <h4 
                            onClick={() => isUnlocked && handleSelectVideo(video)}
                            style={{ fontSize: '16px', fontWeight: '700', cursor: isUnlocked ? 'pointer' : 'default', margin: '5px 0' }}
                        >
                            {video.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '4px 0 12px' }}>
                            {video.description || 'No description available.'}
                        </p>
                    </div>

                    {isUnlocked ? (
                        <button 
                            onClick={() => handleSelectVideo(video)}
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '13px', padding: '8px 12px' }}
                        >
                            ▶ Stream Now
                        </button>
                    ) : (
                        <button 
                            disabled
                            className="btn btn-outline"
                            style={{ width: '100%', fontSize: '12px', padding: '8px 12px', opacity: 0.6, cursor: 'not-allowed' }}
                        >
                            🔒 Locked Premium
                        </button>
                    )}
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

            {/* Premium Access Status Banner */}
            {premiumAccess !== 'approved' && (
                <div className="glass-panel" style={{ 
                    borderLeft: premiumAccess === 'pending' ? '4px solid var(--accent-gold)' : premiumAccess === 'rejected' ? '4px solid var(--color-danger)' : '4px solid var(--accent-teal)',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    padding: '20px 24px'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>
                            {premiumAccess === 'pending' ? '⏳ Premium Access Request Pending' : premiumAccess === 'rejected' ? '❌ Premium Access Request Rejected' : '🔒 Unlock Premium Educational Videos'}
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {premiumAccess === 'pending' 
                                ? 'Your request for unlocking all premium clinical video streams is currently under review by admin.' 
                                : premiumAccess === 'rejected' 
                                ? 'Your access request to premium clinical tutorials was rejected. You can re-submit the request.' 
                                : 'Gain access to our entire library of professional clinical videos and guides by submitting a one-time request.'}
                        </p>
                    </div>
                    <div>
                        {premiumAccess === 'none' && (
                            <button 
                                onClick={handleRequestPremiumAccess}
                                disabled={requesting}
                                className="btn btn-primary"
                                style={{ padding: '10px 20px', fontSize: '14px' }}
                            >
                                {requesting ? 'Requesting...' : '🔑 Request Premium Access'}
                            </button>
                        )}
                        {premiumAccess === 'rejected' && (
                            <button 
                                onClick={handleRequestPremiumAccess}
                                disabled={requesting}
                                className="btn btn-secondary"
                                style={{ padding: '10px 20px', fontSize: '14px' }}
                            >
                                {requesting ? 'Requesting...' : '🔄 Re-Request Access'}
                            </button>
                        )}
                        {premiumAccess === 'pending' && (
                            <button 
                                disabled
                                className="btn btn-outline"
                                style={{ padding: '10px 20px', fontSize: '14px', opacity: 0.7, cursor: 'not-allowed' }}
                            >
                                ⏳ Pending Review
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Search and Category Filters */}
            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '15px', flexGrow: 1, maxWidth: '600px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search video by title or description..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: '1 1 200px' }}
                    />
                    <select
                        className="form-control"
                        style={{ flex: '1 1 160px', maxWidth: '100%' }}
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
                    Found {filteredVideos.length} educational videos
                </div>
            </div>

            {/* Free Videos Section */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    🔓 Free Preview Videos
                </h3>
                {freeVideos.length > 0 ? (
                    <div className="video-grid">
                        {freeVideos.map(video => renderVideoCard(video))}
                    </div>
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No free preview videos found matching your filters.
                    </div>
                )}
            </div>

            {/* Premium Videos Section */}
            <div>
                <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔒 Premium Videos
                    {premiumAccess === 'approved' && (
                        <span className="badge-status badge-completed" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                            Unlocked
                        </span>
                    )}
                </h3>
                {premiumVideos.length > 0 ? (
                    <div className="video-grid">
                        {premiumVideos.map(video => renderVideoCard(video))}
                    </div>
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No premium clinical videos found matching your filters.
                    </div>
                )}
            </div>

        </MemberLayout>
    );
}
