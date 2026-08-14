import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function VideoLibrary({ categories = [], userAccessRequests = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
    const [requestingId, setRequestingId] = useState(null);

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

    // Filtered list of videos user has received approval for
    const approvedVideos = allVideos.filter(v => !v.is_free && userAccessRequests[v.id]?.status === 'approved');

    // Filter videos based on search and category filter
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

    const handleSelectVideo = (video) => {
        const reqStatus = userAccessRequests[video.id]?.status;
        if (!video.is_free && reqStatus !== 'approved') {
            alert('This is a premium video. Please click "Request Access" to get approval from Admin.');
            return;
        }
        setSelectedVideo(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRequestAccess = (e, video) => {
        e.stopPropagation();
        setRequestingId(video.id);
        router.post(route('member.videos.request_access', video.id), {}, {
            preserveScroll: true,
            onFinish: () => setRequestingId(null)
        });
    };

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
        if (!seconds) return 'Video';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderVideoCard = (video, isApprovedSection = false) => {
        const ytId = getYouTubeId(video.video_path);
        const reqStatus = userAccessRequests[video.id]?.status;
        const isUnlocked = video.is_free || reqStatus === 'approved';
        const isPending = !video.is_free && reqStatus === 'pending';
        const isRejected = !video.is_free && reqStatus === 'rejected';

        return (
            <div key={video.id} className="glass-panel video-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: isApprovedSection ? '2px solid var(--accent-teal)' : undefined }}>
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
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUnlocked ? 1 : 0.4 }} 
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
                                <span style={{ fontSize: '48px', color: 'var(--accent-gold)', textShadow: '0 0 15px rgba(212, 175, 55, 0.6)' }}>▶</span>
                                <span style={{ fontSize: '12px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginTop: '4px' }}>
                                    Stream Video
                                </span>
                            </>
                        ) : isPending ? (
                            <>
                                <span style={{ fontSize: '36px' }}>⏳</span>
                                <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', marginTop: '6px' }}>
                                    Access Pending Approval
                                </span>
                            </>
                        ) : isRejected ? (
                            <>
                                <span style={{ fontSize: '36px' }}>❌</span>
                                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', marginTop: '6px' }}>
                                    Access Rejected
                                </span>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '36px' }}>🔒</span>
                                <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold', marginTop: '6px' }}>
                                    Premium Video
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
                            ) : reqStatus === 'approved' ? (
                                <span className="badge-status badge-completed" style={{ fontSize: '10px' }}>✅ Approved</span>
                            ) : reqStatus === 'pending' ? (
                                <span className="badge-status badge-booked" style={{ fontSize: '10px' }}>⏳ Pending</span>
                            ) : reqStatus === 'rejected' ? (
                                <span className="badge-status badge-not-proceeding" style={{ fontSize: '10px' }}>❌ Rejected</span>
                            ) : (
                                <span className="badge-status badge-treatment" style={{ fontSize: '10px' }}>🔒 Premium</span>
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

                    {!video.is_free && (
                        <div style={{ marginTop: 'auto' }}>
                            {isUnlocked ? (
                                <button 
                                    onClick={() => handleSelectVideo(video)}
                                    className="btn btn-primary"
                                    style={{ width: '100%', fontSize: '13px', padding: '8px 12px' }}
                                >
                                    ▶ Stream Now
                                </button>
                            ) : isPending ? (
                                <button 
                                    disabled
                                    className="btn btn-outline"
                                    style={{ width: '100%', fontSize: '12px', padding: '8px 12px', opacity: 0.8, cursor: 'not-allowed' }}
                                >
                                    ⏳ Request Pending Approval
                                </button>
                            ) : isRejected ? (
                                <button 
                                    onClick={(e) => handleRequestAccess(e, video)}
                                    disabled={requestingId === video.id}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', fontSize: '12px', padding: '8px 12px' }}
                                >
                                    {requestingId === video.id ? 'Submitting...' : '🔄 Re-Request Access'}
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => handleRequestAccess(e, video)}
                                    disabled={requestingId === video.id}
                                    className="btn btn-primary"
                                    style={{ width: '100%', fontSize: '13px', padding: '8px 12px' }}
                                >
                                    {requestingId === video.id ? 'Submitting...' : '🔑 Request Access'}
                                </button>
                            )}
                        </div>
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
                <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden', border: '2px solid var(--accent-gold)' }}>
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

            {/* Approved Videos Section (Appears if user has approved premium access) */}
            {approvedVideos.length > 0 && (
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-success)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🔓 My Approved Premium Videos
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                You have received admin approval for {approvedVideos.length} premium educational video{approvedVideos.length > 1 ? 's' : ''}.
                            </p>
                        </div>
                    </div>
                    <div className="video-grid">
                        {approvedVideos.map(video => renderVideoCard(video, true))}
                    </div>
                </div>
            )}

            {/* Search and Category Filters */}
            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap' }}>
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

            {/* Main Videos Grid */}
            <div className="video-grid">
                {filteredVideos.length > 0 ? (
                    filteredVideos.map(video => renderVideoCard(video))
                ) : (
                    <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                        No videos found matching your filters.
                    </div>
                )}
            </div>
        </MemberLayout>
    );
}
