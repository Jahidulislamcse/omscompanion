import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Messages({ messages = [] }) {
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleRead = (msg, e) => {
        if (e) e.stopPropagation();
        router.post(route('admin.messages.read', msg.id));
    };

    const handleDelete = (msg, e) => {
        if (e) e.stopPropagation();
        if (confirm(`Are you sure you want to delete the message from "${msg.name}"?`)) {
            if (selectedMessage && selectedMessage.id === msg.id) {
                setSelectedMessage(null);
            }
            router.delete(route('admin.messages.destroy', msg.id));
        }
    };

    const handleViewMessage = (msg) => {
        setSelectedMessage(msg);
        if (!msg.is_read) {
            router.post(route('admin.messages.read', msg.id), {}, { preserveScroll: true });
        }
    };

    const filteredMessages = (messages || []).filter(msg => {
        const query = searchTerm.toLowerCase();
        return (
            (msg.name || '').toLowerCase().includes(query) ||
            (msg.email || '').toLowerCase().includes(query) ||
            (msg.phone || '').toLowerCase().includes(query) ||
            (msg.message || '').toLowerCase().includes(query)
        );
    });

    const unreadCount = (messages || []).filter(m => !m.is_read).length;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout title="Received Contact Messages">
            <Head title="Contact Messages Inbox" />

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            📩 Contact Messages Inbox
                            {unreadCount > 0 && (
                                <span className="badge-status badge-new" style={{ fontSize: '12px', padding: '4px 10px' }}>
                                    {unreadCount} Unread
                                </span>
                            )}
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                            View and manage inquiries submitted by website visitors and dental practitioners.
                        </p>
                    </div>

                    <input 
                        type="text" 
                        className="form-control"
                        placeholder="Search by name, email, phone, or text..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '320px' }}
                    />
                </div>

                {/* Messages Inbox Grid (List + Details Pane) */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 1.2fr' : '1fr', gap: '24px', alignItems: 'start' }}>
                    
                    {/* Left Column: Messages List */}
                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', fontWeight: '700', fontSize: '14px' }}>
                            All Messages ({filteredMessages.length})
                        </div>

                        <div style={{ maxHeight: '650px', overflowY: 'auto' }}>
                            {filteredMessages.length > 0 ? (
                                filteredMessages.map(msg => {
                                    const isSelected = selectedMessage && selectedMessage.id === msg.id;

                                    return (
                                        <div 
                                            key={msg.id}
                                            onClick={() => handleViewMessage(msg)}
                                            style={{
                                                padding: '16px 20px',
                                                borderBottom: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                backgroundColor: isSelected 
                                                    ? 'rgba(13, 148, 136, 0.15)' 
                                                    : !msg.is_read 
                                                        ? 'rgba(245, 158, 11, 0.08)' 
                                                        : 'transparent',
                                                borderLeft: !msg.is_read ? '4px solid #f59e0b' : isSelected ? '4px solid #0d9488' : '4px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: !msg.is_read ? '800' : '600' }}>
                                                    {msg.name}
                                                </h4>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {formatDate(msg.created_at)}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', wordBreak: 'break-all' }}>
                                                ✉️ {msg.email} {msg.phone ? `• 📞 ${msg.phone}` : ''}
                                            </div>

                                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                                                {msg.message}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                                <span className={`badge-status ${msg.is_read ? 'badge-approved' : 'badge-pending'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                    {msg.is_read ? '✓ Read' : '✉️ Unread'}
                                                </span>

                                                <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                                                    <button 
                                                        type="button" 
                                                        onClick={(e) => handleToggleRead(msg, e)} 
                                                        className="btn btn-outline" 
                                                        style={{ padding: '2px 8px', fontSize: '11px' }}
                                                        title={msg.is_read ? 'Mark as Unread' : 'Mark as Read'}
                                                    >
                                                        {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={(e) => handleDelete(msg, e)} 
                                                        className="btn btn-outline" 
                                                        style={{ padding: '2px 8px', fontSize: '11px', color: 'var(--color-danger, #ef4444)', borderColor: 'rgba(239,68,68,0.4)' }}
                                                        title="Delete Message"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                    No contact messages found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Selected Message Reading Pane */}
                    {selectedMessage && (
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                                        {selectedMessage.name}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Received: {formatDate(selectedMessage.created_at)}
                                    </span>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => setSelectedMessage(null)}
                                    className="btn btn-outline"
                                    style={{ padding: '4px 10px', fontSize: '12px' }}
                                >
                                    ✕ Close Pane
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div>
                                    <strong style={{ color: 'var(--text-muted)' }}>From Name:</strong> {selectedMessage.name}
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--text-muted)' }}>Email Address:</strong> <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--accent-teal)' }}>{selectedMessage.email}</a>
                                </div>
                                {selectedMessage.phone && (
                                    <div>
                                        <strong style={{ color: 'var(--text-muted)' }}>Phone Number:</strong> <a href={`tel:${selectedMessage.phone}`} style={{ color: 'var(--accent-teal)' }}>{selectedMessage.phone}</a>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '14px', color: 'var(--accent-teal)', marginBottom: '10px' }}>Message Body:</h4>
                                <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', backgroundColor: 'rgba(0,0,0,0.15)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    {selectedMessage.message}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <a 
                                    href={`mailto:${selectedMessage.email}?subject=RE: Inquiry on OMSCOMPANION Network`}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                    ✉️ Reply via Email
                                </a>
                                <button 
                                    type="button" 
                                    onClick={() => handleDelete(selectedMessage)} 
                                    className="btn btn-outline"
                                    style={{ color: 'var(--color-danger, #ef4444)', borderColor: 'rgba(239,68,68,0.4)' }}
                                >
                                    🗑️ Delete Message
                                </button>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </AdminLayout>
    );
}
