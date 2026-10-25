import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function Notifications({ notifications = [], unreadCount = 0 }) {
    const getNotificationAction = (notif) => {
        const title = (notif.title || '').toLowerCase();
        const message = (notif.message || '').toLowerCase();

        if (title.includes('video') || message.includes('video')) {
            return { label: 'Watch Video', icon: '🎬' };
        }
        if (title.includes('referral') || message.includes('patient referral') || message.includes('referral')) {
            return { label: 'View Referral', icon: '📋' };
        }
        if (title.includes('account') || title.includes('profile')) {
            return { label: 'View Profile', icon: '👤' };
        }
        if (title.includes('app') || message.includes('mobile app')) {
            return { label: 'Install App', icon: '📱' };
        }
        return { label: 'Open Section', icon: '↗' };
    };

    const handleItemClick = (notifId) => {
        router.visit(route('member.notifications.go', notifId));
    };

    const handleMarkAsRead = (e, notifId) => {
        e.stopPropagation();
        router.post(route('member.notifications.read', notifId), {}, { preserveScroll: true });
    };

    const handleMarkAllRead = () => {
        router.post(route('member.notifications.mark_all_read'), {}, { preserveScroll: true });
    };

    return (
        <MemberLayout title="Notifications & Audit Logs">
            <Head title="Notification History" />

            <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
                <div style={{ 
                    padding: '20px 24px', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>All Notification History</h3>
                            {unreadCount > 0 && (
                                <span className="sidebar-notification-badge" style={{ fontSize: '12px', padding: '3px 10px' }}>
                                    {unreadCount} Unread
                                </span>
                            )}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                            Automatic email & SMS alerts recorded for audit compliance. Click any notification to navigate directly to its section.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button 
                            type="button"
                            onClick={handleMarkAllRead}
                            className="btn btn-outline"
                            style={{ 
                                fontSize: '12px', 
                                padding: '7px 14px', 
                                fontWeight: '700', 
                                borderRadius: '8px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <span>✓</span> Mark All as Read
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.length > 0 ? (
                        notifications.map(notif => {
                            const isUnread = !notif.read_at;
                            const action = getNotificationAction(notif);

                            return (
                                <div 
                                    key={notif.id} 
                                    className={`notification-item notification-item-card ${isUnread ? 'unread' : ''}`}
                                    onClick={() => handleItemClick(notif.id)}
                                    style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        padding: '18px 24px',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        backgroundColor: isUnread ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                        borderLeft: isUnread ? '4px solid #3b82f6' : '4px solid transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="notification-header" style={{ marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <span style={{ 
                                                    fontWeight: '800', 
                                                    fontSize: '15px', 
                                                    color: isUnread ? '#3b82f6' : 'var(--accent-teal)' 
                                                }}>
                                                    {notif.title}
                                                </span>
                                                {isUnread && (
                                                    <span style={{ 
                                                        fontSize: '10px', 
                                                        fontWeight: '800', 
                                                        backgroundColor: '#ef4444', 
                                                        color: '#ffffff', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '999px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.4px',
                                                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
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
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                                Simulated Dispatch Channels:
                                            </span>
                                            <span className="badge-status badge-new" style={{ fontSize: '9px', padding: '2px 8px' }}>
                                                {notif.type === 'both' ? '📧 Email & 📱 SMS' : notif.type === 'email' ? '📧 Email Only' : '📱 SMS Only'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Direct Action Link to specific section */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                                        <Link 
                                            href={route('member.notifications.go', notif.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="btn btn-primary"
                                            style={{ 
                                                fontSize: '12px', 
                                                padding: '8px 14px', 
                                                fontWeight: '800',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                borderRadius: '8px',
                                                whiteSpace: 'nowrap',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                                            }}
                                        >
                                            <span>{action.icon}</span>
                                            <span>{action.label}</span>
                                            <span>→</span>
                                        </Link>

                                        {isUnread && (
                                            <button 
                                                type="button"
                                                onClick={(e) => handleMarkAsRead(e, notif.id)}
                                                style={{ 
                                                    background: 'transparent', 
                                                    border: 'none', 
                                                    color: 'var(--text-muted)', 
                                                    fontSize: '11px', 
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    padding: 0
                                                }}
                                                title="Mark this notification as read"
                                            >
                                                Mark as read
                                            </button>
                                        )}
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
