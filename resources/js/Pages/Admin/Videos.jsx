import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Videos({ categories, videos }) {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'categories', 'list'

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
        storage_type: 'local',
        video_file: null,
        video_url: '',
        duration: '',
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
        // Since we are uploading file, Inertia handles FormData automatically
        postVid(route('admin.videos.store'), {
            onSuccess: () => {
                resetVidForm();
                alert('Video uploaded/saved successfully! Members notified.');
            }
        });
    };

    return (
        <AdminLayout title="Premium Video Library Management">
            <Head title="Video Management" />

            {/* Sub navigation Tabs */}
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <button 
                    onClick={() => setActiveTab('upload')} 
                    className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                >
                    🎥 Upload Video
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

            {/* Tab 1: Upload Video Form */}
            {activeTab === 'upload' && (
                <div className="glass-panel" style={{ maxWidth: '700px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Add Video to Premium Library</h3>
                    
                    <form onSubmit={handleVideoSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                                    value={vidData.title}
                                    onChange={e => setVidData('title', e.target.value)}
                                    required
                                />
                                {vidErrors.title && <span className="form-error">{vidErrors.title}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description / Summary</label>
                            <textarea 
                                className="form-control" 
                                value={vidData.description}
                                onChange={e => setVidData('description', e.target.value)}
                                rows="3"
                            />
                            {vidErrors.description && <span className="form-error">{vidErrors.description}</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Storage Hosting Type</label>
                                <select 
                                    className="form-control"
                                    value={vidData.storage_type}
                                    onChange={e => setVidData('storage_type', e.target.value)}
                                    required
                                >
                                    <option value="local">Local Secure Server Upload</option>
                                    <option value="external">External Secure URL (Vimeo/AWS S3)</option>
                                </select>
                                {vidErrors.storage_type && <span className="form-error">{vidErrors.storage_type}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Duration (in seconds)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="e.g. 360"
                                    value={vidData.duration}
                                    onChange={e => setVidData('duration', e.target.value)}
                                />
                                {vidErrors.duration && <span className="form-error">{vidErrors.duration}</span>}
                            </div>
                        </div>

                        {vidData.storage_type === 'local' ? (
                            <div className="form-group" style={{ padding: '15px', border: '2px dashed var(--border-color)', borderRadius: '8px' }}>
                                <label className="form-label">Upload Video File (MP4, Max 50MB)</label>
                                <input 
                                    type="file" 
                                    accept="video/*"
                                    onChange={e => setVidData('video_file', e.target.files[0])}
                                    required
                                />
                                {vidErrors.video_file && <span className="form-error">{vidErrors.video_file}</span>}
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                                    Files are stored in secure folder, inaccessible via direct public links.
                                </p>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">Video Streaming URL</label>
                                <input 
                                    type="url" 
                                    className="form-control" 
                                    placeholder="https://example.com/stream.mp4"
                                    value={vidData.video_url}
                                    onChange={e => setVidData('video_url', e.target.value)}
                                    required
                                />
                                {vidErrors.video_url && <span className="form-error">{vidErrors.video_url}</span>}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ marginTop: '20px', width: '100%' }}
                            disabled={vidProcessing}
                        >
                            {vidProcessing ? 'Saving Video & Broadcasting Notifications...' : 'Save Video Record'}
                        </button>
                    </form>
                </div>
            )}

            {/* Tab 2: Manage Categories Form */}
            {activeTab === 'categories' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }}>
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
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Storage / Location</th>
                                    <th>Duration</th>
                                    <th>Date Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.length > 0 ? (
                                    videos.map(vid => (
                                        <tr key={vid.id}>
                                            <td>
                                                <div style={{ fontWeight: '700' }}>{vid.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '350px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                    {vid.description || 'No description'}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: '600', color: 'var(--accent-teal)' }}>
                                                    {vid.category.name}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{vid.storage_type}</div>
                                                <code style={{ fontSize: '11px', color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>
                                                    {vid.video_path}
                                                </code>
                                            </td>
                                            <td>
                                                {vid.duration ? `${Math.floor(vid.duration / 60)}m ${vid.duration % 60}s` : 'N/A'}
                                            </td>
                                            <td>
                                                {new Date(vid.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                            No videos uploaded to the premium library yet.
                                        </td>
                                    </tr>
                                )};
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
