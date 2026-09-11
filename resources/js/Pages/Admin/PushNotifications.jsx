import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PushNotifications({ notifications = [] }) {
    const { data: pushData, setData: setPushData, post: postPush, processing: processingPush, reset: resetPush, errors: pushErrors } = useForm({
        title: '',
        message: '',
        url: 'http://omscompanion.com',
    });

    const handleSendPush = (e) => {
        e.preventDefault();
        postPush(route('admin.push_notifications.send'), {
            onSuccess: () => resetPush('title', 'message'),
        });
    };

    return (
        <AdminLayout title="Push Notifications">
            <Head title="Push Notifications - Admin Portal" />

            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '25px', alignItems: 'start' }}>
                    {/* Left Column: Form */}
                    <div className="glass-panel" style={{ padding: '25px', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🚀</span> Compose Notification
                        </h3>

                        <form onSubmit={handleSendPush}>
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                    Notification Title <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. New Clinical Video Released!"
                                    value={pushData.title}
                                    onChange={(e) => setPushData('title', e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
                                />
                                {pushErrors.title && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{pushErrors.title}</div>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '22px' }}>
                                <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                    Notification Message Body <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    placeholder="Enter the main announcement message here..."
                                    value={pushData.message}
                                    onChange={(e) => setPushData('message', e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', resize: 'vertical' }}
                                ></textarea>
                                {pushErrors.message && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{pushErrors.message}</div>}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processingPush}
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)' }}
                            >
                                {processingPush ? 'Sending Push Notification...' : '📢 Send Notification to All Mobile Devices'}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Sent Notification History with Fixed Scrollable Height */}
                    <div className="glass-panel" style={{ padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📋</span> Sent Notification History
                        </h3>

                        {notifications.length === 0 ? (
                            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '14px', margin: 0 }}>
                                No push notifications have been sent yet. Use the composer form on the left to broadcast your first notification!
                            </p>
                        ) : (
                            <div style={{ maxHeight: '460px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card, #1e293b)', zIndex: 10 }}>
                                        <tr style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)', textAlign: 'left' }}>
                                            <th style={{ padding: '12px 14px' }}>Date</th>
                                            <th style={{ padding: '12px 14px' }}>Title</th>
                                            <th style={{ padding: '12px 14px' }}>Message Body</th>
                                            <th style={{ padding: '12px 14px' }}>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--text-muted, #64748b)', fontSize: '12px' }}>
                                                    {new Date(item.created_at).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '12px 14px', fontWeight: '600' }}>
                                                    {item.title}
                                                </td>
                                                <td style={{ padding: '12px 14px', color: 'var(--text-muted, #475569)', lineHeight: '1.4' }}>
                                                    {item.message}
                                                </td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                    <span style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                                                        PUSH (Sound)
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
