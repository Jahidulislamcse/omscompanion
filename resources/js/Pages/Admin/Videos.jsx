import React, { useState } from 'react';
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

    return (
        <AdminLayout title="YouTube Video Library Management">
            <Head title="YouTube Video Management" />

            {/* Sub navigation Tabs */}
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap' }}>
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

            {/* Tab 3: List Videos */}
            {activeTab === 'list' && (
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
                                {videos.length > 0 ? (
                                    videos.map(vid => {
                                        const ytId = getYouTubeId(vid.video_path);
                                        return (
                                            <tr key={vid.id}>
                                                <td style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    {ytId && (
                                                        <img 
                                                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                            alt={vid.title} 
                                                            style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} 
                                                        />
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: '700' }}>{vid.title}</div>
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
                                            No YouTube videos added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
