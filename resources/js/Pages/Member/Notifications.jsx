import React from 'react';
import { Head } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function Notifications({ notifications }) {
    return (
        <MemberLayout title="Notifications & Audit Logs">
            <Head title="Notification History" />

            <div className="glass-panel" style={{ padding: '0px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: 0 }}>All Notification History</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                        Automatic email & SMS alerts recorded for audit compliance.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.length > 0 ? (
                        notifications.map(notif => {
                            const isUnread = !notif.read_at;
                            return (
                                <div 
                                    key={notif.id} 
                                    className={`notification-item ${isUnread ? 'unread' : ''}`}
                                    style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        padding: '20px 24px',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    <div className="notification-header" style={{ marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ 
                                                fontWeight: '800', 
                                                fontSize: '15px', 
                                                color: isUnread ? 'var(--accent-gold)' : 'var(--accent-teal)' 
                                            }}>
                                                {notif.title}
                                            </span>
                                            {isUnread && (
                                                <span style={{ 
                                                    fontSize: '9px', 
                                                    fontWeight: '800', 
                                                    backgroundColor: 'var(--accent-gold)', 
                                                    color: '#fff', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <span className="notification-time" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(notif.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="notification-body" style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                                        {notif.message}
                                    </p>
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                            Simulated Dispatch Channels:
                                        </span>
                                        <span className="badge-status badge-new" style={{ fontSize: '9px', padding: '2px 8px' }}>
                                            {notif.type === 'both' ? '📧 Email & 📱 SMS' : notif.type === 'email' ? '📧 Email Only' : '📱 SMS Only'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--text-muted)' }}>
                            No notifications recorded in your membership history.
                        </div>
                    )}
                </div>
            </div>
        </MemberLayout>
    );
}
