import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function Videos({ categories = [], videos = [] }) {
    const [activeTab, setActiveTab] = useState('list'); // Default 1st tab ('list')
    const [searchTerm, setSearchTerm] = useState('');
    const [viewLayout, setViewLayout] = useState('list'); // 'list' | 'grid' | 'table'
    const [selectedPreviewVideo, setSelectedPreviewVideo] = useState(null);

    // Video Form
    const { data: vidData, setData: setVidData, post: postVid, processing: vidProcessing, errors: vidErrors, reset: resetVidForm } = useForm({
        category_id: '',
        title: '',
        description: '',
        video_url: '',
        duration: '',
        is_free: false,
    });

    // Edit Video State
    const [editingVideo, setEditingVideo] = useState(null);
    const { data: editData, setData: setEditData, processing: editProcessing, errors: editErrors } = useForm({
        category_id: '',
        title: '',
        description: '',
        video_url: '',
        duration: '',
        is_free: false,
    });

    const openEditModal = (vid) => {
        setEditingVideo(vid);
        setEditData({
            category_id: vid.category_id || '',
            title: vid.title || '',
            description: vid.description || '',
            video_url: vid.video_path || '',
            duration: vid.duration || '',
            is_free: Boolean(vid.is_free),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingVideo) return;
        router.post(route('admin.videos.update', editingVideo.id), {
            _method: 'PUT',
            ...editData,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingVideo(null);
                alert('Video updated successfully!');
            }
        });
    };

    const handleDeleteVideo = (vid) => {
        if (confirm(`Are you sure you want to delete "${vid.title}"?`)) {
            router.delete(route('admin.videos.destroy', vid.id), {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Video deleted successfully!');
                }
            });
        }
    };

    const handleVideoSubmit = (e) => {
        e.preventDefault();
        postVid(route('admin.videos.store'), {
            onSuccess: () => {
                resetVidForm();
                alert('YouTube video saved successfully! Members notified.');
            }
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'Video';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Filter videos based on search
    const filteredVideos = useMemo(() => {
        return (videos || []).filter(vid => {
            const query = (searchTerm || '').toLowerCase();
            return (
                (vid.title || '').toLowerCase().includes(query) ||
                (vid.description && vid.description.toLowerCase().includes(query)) ||
                (vid.category?.name && vid.category.name.toLowerCase().includes(query))
            );
        });
    }, [videos, searchTerm]);

    // Group filtered videos by category
    const groupedCategories = useMemo(() => {
        if (categories && categories.length > 0) {
            return categories.map(cat => {
                const catVideos = filteredVideos.filter(v => v.category_id === cat.id);
                const sortedVideos = [...catVideos].sort((a, b) => (b.is_free ? 1 : 0) - (a.is_free ? 1 : 0));
                return {
                    ...cat,
                    videos: sortedVideos
                };
            }).filter(cat => cat.videos.length > 0);
        }

        // Fallback grouping
        const groups = {};
        filteredVideos.forEach(v => {
            const catName = v.category?.name || 'General Masterclasses';
            if (!groups[catName]) {
                groups[catName] = { id: v.category_id || catName, name: catName, videos: [] };
            }
            groups[catName].videos.push(v);
        });

        return Object.values(groups).map(cat => ({
            ...cat,
            videos: [...cat.videos].sort((a, b) => (b.is_free ? 1 : 0) - (a.is_free ? 1 : 0))
        }));
    }, [categories, filteredVideos]);

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
                    gap: '14px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '10px',
                    flexShrink: 0
                }}
            >
                {/* Thumbnail Preview */}
                <div 
                    onClick={() => setSelectedPreviewVideo(video)}
                    style={{
                        flexShrink: 0,
                        width: '120px',
                        aspectRatio: '16/9',
                        backgroundColor: '#0a1215',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                        cursor: 'pointer'
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
                        <div className="play-button-glow golden-play-button" style={{ width: '28px', height: '28px' }}>
                            <span className="play-icon" style={{ fontSize: '11px' }}>▶</span>
                        </div>
                    </div>
                    <span className="video-duration" style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', padding: '2px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', color: '#ffffff' }}>
                        {formatDuration(video.duration)}
                    </span>
                </div>

                {/* Content Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 
                            className="video-list-title"
                            style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0, lineHeight: '1.35', cursor: 'pointer' }}
                            onClick={() => setSelectedPreviewVideo(video)}
                        >
                            {video.title}
                        </h3>
                    </div>

                    <p style={{ 
                        fontSize: '12px', 
                        color: '#475569', 
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

                {/* Right Side: Free/Premium Tag & Admin Actions */}
                <div style={{ flexShrink: 0, display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {isFree ? (
                        <span className="badge-status badge-completed" style={{ fontSize: '11px', padding: '4px 10px' }}>🔓 Free</span>
                    ) : (
                        <span className="badge-status badge-booked" style={{ fontSize: '11px', padding: '4px 10px' }}>👑 Premium</span>
                    )}

                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                            onClick={() => openEditModal(video)}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                            title="Edit Video"
                        >
                            ✏️ Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteVideo(video)}
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                            title="Delete Video"
                        >
                            🗑️
                        </button>
                    </div>
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
                className="glass-panel video-card colorful-video-card" 
                style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}
            >
                <div 
                    onClick={() => setSelectedPreviewVideo(video)}
                    style={{ 
                        width: '100%', 
                        aspectRatio: '16/9', 
                        backgroundColor: '#0a1215', 
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer'
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
                    </div>
                    <span className="video-duration">{formatDuration(video.duration)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '14px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                            {isFree ? (
                                <span className="badge-status badge-completed" style={{ fontSize: '10px', padding: '2px 8px' }}>🔓 Free</span>
                            ) : (
                                <span className="badge-status badge-booked" style={{ fontSize: '10px', padding: '2px 8px' }}>👑 Premium</span>
                            )}
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                            {video.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>
                            {video.description || 'No description available.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                        <button 
                            onClick={() => openEditModal(video)}
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '12px', flex: 1 }}
                        >
                            ✏️ Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteVideo(video)}
                            className="btn btn-danger"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout title="YouTube Video Library Management">
            <Head title="YouTube Video Management" />

            {/* Sub navigation Tabs */}
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('list')} 
                    className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-outline'}`}
                >
                    📋 View All Videos ({videos.length})
                </button>
                <button 
                    onClick={() => setActiveTab('upload')} 
                    className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                >
                    🎥 Add YouTube Video
                </button>
            </div>

            {/* Tab 1: Add YouTube Video Form */}
            {activeTab === 'upload' && (
                <div className="glass-panel" style={{ maxWidth: '700px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Add YouTube Video to Library</h3>
                    
                    <form onSubmit={handleVideoSubmit}>
                        <div className="grid-responsive-2col-equal">
                            <div className="form-group">
                                <label className="form-label">Video Category</label>
                                {categories.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        {categories.map(cat => (
                                            <button 
                                                key={cat.id} 
                                                type="button"
                                                className={`btn ${String(vidData.category_id) === String(cat.id) ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '14px' }}
                                                onClick={() => setVidData('category_id', cat.id)}
                                            >
                                                📁 {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <select 
                                    className="form-control"
                                    value={vidData.category_id}
                                    onChange={e => setVidData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Category --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {vidErrors.category_id && <span className="form-error">{vidErrors.category_id}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Video Title</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Enter title"
                                    value={vidData.title}
                                    onChange={e => setVidData('title', e.target.value)}
                                    required
                                />
                                {vidErrors.title && <span className="form-error">{vidErrors.title}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">YouTube Video URL / Link</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                                value={vidData.video_url}
                                onChange={e => setVidData('video_url', e.target.value)}
                                required
                            />
                            {vidErrors.video_url && <span className="form-error">{vidErrors.video_url}</span>}
                        </div>

                        <div className="grid-responsive-2col-equal">
                            <div className="form-group">
                                <label className="form-label">Description / Summary</label>
                                <textarea 
                                    className="form-control" 
                                    value={vidData.description}
                                    onChange={e => setVidData('description', e.target.value)}
                                    rows="3"
                                    placeholder="Brief summary of the clinical video"
                                />
                                {vidErrors.description && <span className="form-error">{vidErrors.description}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Duration in Seconds (Optional)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="e.g. 360 for 6 mins"
                                    value={vidData.duration}
                                    onChange={e => setVidData('duration', e.target.value)}
                                />
                                {vidErrors.duration && <span className="form-error">{vidErrors.duration}</span>}
                            </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                            <input 
                                type="checkbox" 
                                id="is_free"
                                checked={vidData.is_free}
                                onChange={e => setVidData('is_free', e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="is_free" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                                ✓ Mark as Free Video (If unchecked, video is Premium)
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ marginTop: '20px', width: '100%' }}
                            disabled={vidProcessing}
                        >
                            {vidProcessing ? 'Saving Video & Broadcasting Notifications...' : 'Save YouTube Video'}
                        </button>
                    </form>
                </div>
            )}

            {/* Tab 2: List Videos (Category Sections & Controls) */}
            {activeTab === 'list' && (
                <>
                    {/* Control Bar (Search, Total Count, View Switcher) */}
                    <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 240px', maxWidth: '500px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search video title, topic, or category..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: 'auto' }}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                    {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}
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
                                    <button
                                        type="button"
                                        onClick={() => setViewLayout('table')}
                                        className={`btn ${viewLayout === 'table' ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                                        title="Table View"
                                    >
                                        📋 Table
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Sections Display (List / Grid) */}
                    {viewLayout !== 'table' ? (
                        groupedCategories.length > 0 ? (
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
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
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
                                            <div className="video-list-container category-section-scrollable" style={{ flex: 1, maxHeight: '350px', overflowY: 'auto' }}>
                                                {cat.videos.map(video => renderVideoListItem(video))}
                                            </div>
                                        ) : (
                                            /* GRID MANNER DISPLAY */
                                            <div className="video-grid category-section-scrollable" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', flex: 1, maxHeight: '350px', overflowY: 'auto' }}>
                                                {cat.videos.map(video => renderVideoCard(video))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', borderRadius: '16px' }}>
                                No videos found matching your search term.
                            </div>
                        )
                    ) : (
                        /* Table View Display */
                        <div className="glass-panel" style={{ padding: '0px' }}>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Video</th>
                                            <th>Category</th>
                                            <th>YouTube Link</th>
                                            <th>Duration</th>
                                            <th>Access Level</th>
                                            <th>Date Added</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVideos.length > 0 ? (
                                            filteredVideos.map(vid => {
                                                const ytId = getYouTubeId(vid.video_path);
                                                return (
                                                    <tr key={vid.id}>
                                                        <td style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            {ytId && (
                                                                <img 
                                                                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                                    alt={vid.title} 
                                                                    style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }} 
                                                                    onClick={() => setSelectedPreviewVideo(vid)}
                                                                />
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: '700', cursor: 'pointer' }} onClick={() => setSelectedPreviewVideo(vid)}>{vid.title}</div>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                                    {vid.description || 'No description'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{ fontWeight: '600', color: 'var(--accent-teal)' }}>
                                                                {vid.category?.name || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <a 
                                                                href={vid.video_path.startsWith('http') ? vid.video_path : `https://www.youtube.com/watch?v=${vid.video_path}`}
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '12px' }}
                                                            >
                                                                📺 Watch on YouTube ↗
                                                            </a>
                                                        </td>
                                                        <td>
                                                            {vid.duration ? `${Math.floor(vid.duration / 60)}m ${vid.duration % 60}s` : 'N/A'}
                                                        </td>
                                                        <td>
                                                            {vid.is_free ? (
                                                                <span className="badge-status badge-completed" style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                    ✓ Free Video
                                                                </span>
                                                            ) : (
                                                                <span className="badge-status badge-booked" style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                    🔒 Premium
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {new Date(vid.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                                <button 
                                                                    onClick={() => openEditModal(vid)}
                                                                    className="btn btn-outline"
                                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteVideo(vid)}
                                                                    className="btn btn-danger"
                                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                    No YouTube videos found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Video Preview Modal */}
            {selectedPreviewVideo && (
                <div className="modal-wrapper" onClick={() => setSelectedPreviewVideo(null)}>
                    <div className="glass-panel modal-card modal-card-colorful" style={{ maxWidth: '800px', width: '90%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#0f172a' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>🎥 {selectedPreviewVideo.title}</h3>
                                {selectedPreviewVideo.is_free ? (
                                    <span className="badge-status badge-completed" style={{ fontSize: '11px', padding: '4px 10px' }}>🔓 Free</span>
                                ) : (
                                    <span className="badge-status badge-booked" style={{ fontSize: '11px', padding: '4px 10px' }}>👑 Premium</span>
                                )}
                            </div>
                            <button onClick={() => setSelectedPreviewVideo(null)} className="btn btn-outline" style={{ padding: '4px 10px', color: '#fff' }}>
                                Close ✕
                            </button>
                        </div>
                        <div className="modal-video-frame" style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#000' }}>
                            {getYouTubeId(selectedPreviewVideo.video_path) ? (
                                <iframe 
                                    style={{ width: '100%', height: '100%', border: 'none' }} 
                                    src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(selectedPreviewVideo.video_path)}?autoplay=1`} 
                                    title={selectedPreviewVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : null}
                        </div>
                        {selectedPreviewVideo.description && (
                            <div style={{ padding: '20px 24px', backgroundColor: '#0b131f' }}>
                                <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                                    {selectedPreviewVideo.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Video Modal */}
            {editingVideo && (
                <div className="modal-wrapper" onClick={() => setEditingVideo(null)}>
                    <div className="glass-panel modal-card" style={{ maxWidth: '650px', width: '90%', padding: '24px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>✏️ Edit Video</h3>
                            <button onClick={() => setEditingVideo(null)} className="btn btn-outline" style={{ padding: '4px 10px' }}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Video Category</label>
                                <select 
                                    className="form-control"
                                    value={editData.category_id}
                                    onChange={e => setEditData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Category --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Video Title</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={editData.title}
                                    onChange={e => setEditData('title', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">YouTube Video URL</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={editData.video_url}
                                    onChange={e => setEditData('video_url', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid-responsive-2col-equal">
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea 
                                        className="form-control"
                                        rows="3"
                                        value={editData.description}
                                        onChange={e => setEditData('description', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duration (seconds)</label>
                                    <input 
                                        type="number"
                                        className="form-control"
                                        value={editData.duration}
                                        onChange={e => setEditData('duration', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                                <input 
                                    type="checkbox" 
                                    id="edit_is_free"
                                    checked={editData.is_free}
                                    onChange={e => setEditData('is_free', e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="edit_is_free" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>
                                    ✓ Mark as Free Video (If unchecked, video is Premium)
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditingVideo(null)} className="btn btn-outline">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={editProcessing}>
                                    {editProcessing ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
