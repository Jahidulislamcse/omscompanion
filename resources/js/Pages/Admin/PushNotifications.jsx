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

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>


                {/* Main Content: Composer + Live Preview */}
                <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '25px' }}>
                    {/* Composer Form */}
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

                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                    Notification Message Body <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter the main announcement message here..."
                                    value={pushData.message}
                                    onChange={(e) => setPushData('message', e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', resize: 'vertical' }}
                                ></textarea>
                                {pushErrors.message && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{pushErrors.message}</div>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '22px' }}>
                                <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                    Target Launch URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    className="form-control"
                                    placeholder="http://omscompanion.com"
                                    value={pushData.url}
                                    onChange={(e) => setPushData('url', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
                                />
                                <small style={{ color: 'var(--text-muted, #64748b)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    When a user taps the notification on their phone, it opens this link directly.
                                </small>
                            </div>

                            <div style={{ backgroundColor: 'rgba(13, 148, 136, 0.08)', padding: '12px 16px', borderRadius: '8px', marginBottom: '22px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f766e' }}>
                                <span>🔊</span>
                                <span><strong>Sound Enabled:</strong> High priority system sound and vibration will be triggered on all Android & iOS devices automatically.</span>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processingPush}
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)' }}
                            >
                                {processingPush ? 'Sending Push Notification...' : '📢 Send Notification to All Mobile Devices'}
                            </button>
                        </form>
                    </div>

                    {/* Live Mobile Notification Preview */}
                    <div>
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', position: 'sticky', top: '20px' }}>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #64748b)', marginBottom: '15px' }}>
                                📱 Live Phone Preview
                            </h4>

                            <div style={{ background: '#1e293b', color: '#ffffff', borderRadius: '16px', padding: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '5px', backgroundColor: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                                            OMS
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>OMS COMPANION</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>Now</span>
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', color: '#f8fafc' }}>
                                    {pushData.title || 'Notification Title'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4', wordBreak: 'break-word' }}>
                                    {pushData.message || 'Your push notification message body preview will appear here in real-time...'}
                                </div>
                                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#38bdf8' }}>
                                    <span>🔔 Plays Sound & Vibration</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary, #f8fafc)', fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
                                💡 <strong>Note:</strong> All phones with the OMS Companion APK or iOS app installed will receive this notification with sound immediately.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Push Notification History */}
                <div className="glass-panel" style={{ padding: '25px', borderRadius: '16px', marginTop: '30px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📋</span> Sent Notification History
                    </h3>

                    {notifications.length === 0 ? (
                        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '14px', margin: 0 }}>
                            No push notifications have been sent yet. Use the composer above to broadcast your first notification!
                        </p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 10px' }}>Date</th>
                                        <th style={{ padding: '12px 10px' }}>Title</th>
                                        <th style={{ padding: '12px 10px' }}>Message Body</th>
                                        <th style={{ padding: '12px 10px' }}>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                                            <td style={{ padding: '12px 10px', whiteSpace: 'nowrap', color: 'var(--text-muted, #64748b)', fontSize: '12px' }}>
                                                {new Date(item.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '12px 10px', fontWeight: '600' }}>
                                                {item.title}
                                            </td>
                                            <td style={{ padding: '12px 10px', color: 'var(--text-muted, #475569)' }}>
                                                {item.message}
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
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
        </AdminLayout>
    );
}
