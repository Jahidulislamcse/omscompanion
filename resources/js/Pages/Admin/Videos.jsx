import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function Videos({ categories = [], videos = [], accessRequests = [] }) {
    const pendingCount = (accessRequests || []).filter(r => r.premium_access === 'pending').length;
    const [activeTab, setActiveTab] = useState(pendingCount > 0 ? 'requests' : 'upload'); // 'requests', 'upload', 'categories', 'list'
    const [requestFilter, setRequestFilter] = useState('all');

    // Category Form
    const { data: catData, setData: setCatData, post: postCat, processing: catProcessing, errors: catErrors, reset: resetCatForm } = useForm({
        name: '',
        description: '',
    });

    // Video Form
    const { data: vidData, setData: setVidData, post: postVid, processing: vidProcessing, errors: vidErrors, reset: resetVidForm } = useForm({
        category_id: '',
        title: '',
        description: '',
        video_url: '',
        duration: '',
        is_free: false,
    });

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        postCat(route('admin.videos.category.store'), {
            onSuccess: () => {
                resetCatForm();
                alert('Category created successfully!');
            }
        });
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

    const handleAccessRequestAction = (userId, status) => {
        router.post(route('admin.videos.access_requests.update', userId), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                alert(`Access request ${status} successfully.`);
            }
        });
    };

    const filteredRequests = (accessRequests || []).filter(req => {
        if (requestFilter === 'all') return true;
        return req.premium_access === requestFilter;
    });

    return (
        <AdminLayout title="YouTube Video Library & Premium Access">
            <Head title="YouTube Video Management" />

            {/* Sub navigation Tabs */}
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('requests')} 
                    className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ position: 'relative' }}
                >
                    🔑 Premium Requests
                    {pendingCount > 0 && (
                        <span style={{ 
                            marginLeft: '8px', 
                            backgroundColor: 'var(--color-danger)', 
                            color: '#fff', 
                            borderRadius: '10px', 
                            padding: '2px 7px', 
                            fontSize: '11px', 
                            fontWeight: 'bold' 
                        }}>
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('upload')} 
                    className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                >
                    🎥 Add YouTube Video
                </button>
                <button 
                    onClick={() => setActiveTab('categories')} 
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
                >
                    📁 Manage Categories
                </button>
                <button 
                    onClick={() => setActiveTab('list')} 
                    className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-outline'}`}
                >
                    📋 View All Videos ({videos.length})
                </button>
            </div>

            {/* Tab 0: Access Requests Management */}
            {activeTab === 'requests' && (
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Member Premium Videos Access Requests</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                Approve or reject member access to the entire Premium Video Library.
                            </p>
                        </div>
                        <div style={{ width: '200px' }}>
                            <select 
                                className="form-control"
                                value={requestFilter}
                                onChange={e => setRequestFilter(e.target.value)}
                            >
                                <option value="all">All Request Statuses</option>
                                <option value="pending">Pending Only</option>
                                <option value="approved">Approved Only</option>
                                <option value="rejected">Rejected Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Member Doctor</th>
                                    <th>Clinic / Phone</th>
                                    <th>Last Updated</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map(user => {
                                        const prefix = user.bds_registration_number ? 'Dr. ' : '';
                                        return (
                                            <tr key={user.id}>
                                                <td>
                                                    <div style={{ fontWeight: '700' }}>{prefix}{user.name || 'Member'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>ID: {user.member_id || 'N/A'}</div>
                                                    {user.bds_registration_number && (
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BDS Reg: {user.bds_registration_number}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{user.clinic_name || 'N/A'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.phone || 'N/A'}</div>
                                                </td>
                                                <td>
                                                    {new Date(user.updated_at).toLocaleString()}
                                                </td>
                                                <td>
                                                    {user.premium_access === 'approved' ? (
                                                        <span className="badge-status badge-completed">Approved</span>
                                                    ) : user.premium_access === 'rejected' ? (
                                                        <span className="badge-status badge-not-proceeding">Rejected</span>
                                                    ) : (
                                                        <span className="badge-status badge-booked">Pending</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                        {user.premium_access !== 'approved' && (
                                                            <button 
                                                                onClick={() => handleAccessRequestAction(user.id, 'approved')}
                                                                className="btn btn-primary"
                                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                            >
                                                                Approve Access
                                                            </button>
                                                        )}
                                                        {user.premium_access !== 'rejected' && (
                                                            <button 
                                                                onClick={() => handleAccessRequestAction(user.id, 'rejected')}
                                                                className="btn btn-danger"
                                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                            No premium access requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 1: Add YouTube Video Form */}
            {activeTab === 'upload' && (
                <div className="glass-panel" style={{ maxWidth: '700px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Add YouTube Video to Library</h3>
                    
                    <form onSubmit={handleVideoSubmit}>
                        <div className="grid-responsive-2col-equal">
                            <div className="form-group">
                                <label className="form-label">Video Category</label>
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
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <label htmlFor="is_free" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>
                                Free Preview Video (Display publicly on landing page)
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

            {/* Tab 2: Manage Categories Form */}
            {activeTab === 'categories' && (
                <div className="grid-responsive-form-history">
                    {/* Add Category Form */}
                    <div className="glass-panel" style={{ height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '20px' }}>Create Category</h3>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="form-group">
                                <label className="form-label">Category Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={catData.name}
                                    onChange={e => setCatData('name', e.target.value)}
                                    required
                                />
                                {catErrors.name && <span className="form-error">{catErrors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="form-control" 
                                    value={catData.description}
                                    onChange={e => setCatData('description', e.target.value)}
                                    rows="3"
                                />
                                {catErrors.description && <span className="form-error">{catErrors.description}</span>}
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-secondary" 
                                style={{ width: '100%', marginTop: '10px' }}
                                disabled={catProcessing}
                            >
                                {catProcessing ? 'Creating...' : 'Create Category'}
                            </button>
                        </form>
                    </div>

                    {/* Category List */}
                    <div className="glass-panel">
                        <h3 style={{ marginBottom: '20px' }}>Existing Video Categories</h3>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Video Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length > 0 ? (
                                        categories.map(cat => (
                                            <tr key={cat.id}>
                                                <td style={{ fontWeight: '700' }}>{cat.name}</td>
                                                <td>{cat.description || 'No description'}</td>
                                                <td>{cat.videos ? cat.videos.length : 0} Videos</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                                No categories defined.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                                                    <span className={`badge-status ${vid.is_free ? 'badge-new' : 'badge-under-treatment'}`} style={{ fontSize: '11px', display: 'inline-block', padding: '4px 8px' }}>
                                                        {vid.is_free ? '🔓 Free Preview' : '🔒 Premium'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {new Date(vid.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                            No YouTube videos added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
