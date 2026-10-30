import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

export default function AdminNotificationDropdown() {
    const { admin_notifications } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'registrations' | 'referrals'
    const dropdownRef = useRef(null);

    const pendingMembers = admin_notifications?.pending_members || [];
    const newReferrals = admin_notifications?.new_referrals || [];
    const recentNotifs = admin_notifications?.recent_notifications || [];

    const pendingCount = admin_notifications?.pending_members_count || 0;
    const referralsCount = admin_notifications?.new_referrals_count || 0;
    const unreadCount = admin_notifications?.unread_notifications_count || 0;

    const totalCount = pendingCount + referralsCount;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAllRead = (e) => {
        e.preventDefault();
        router.post(route('admin.notifications.mark_all_read'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Flash message handled by inertia
            }
        });
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`admin-bell-btn ${isOpen ? 'is-active' : ''}`}
                title="Notifications"
                aria-label="View notifications"
                style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: isOpen ? 'rgba(6, 182, 212, 0.22)' : 'rgba(255, 255, 255, 0.08)',
                    border: isOpen ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isOpen ? '#38bdf8' : 'var(--text-main, #ffffff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    padding: 0
                }}
            >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>

                {/* Notification Badge */}
                {totalCount > 0 && (
                    <span 
                        style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            minWidth: '18px',
                            height: '18px',
                            padding: '0 4px',
                            borderRadius: '9999px',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid var(--bg-card, #0f172a)',
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
                            animation: 'pulse 2s infinite'
                        }}
                    >
                        {totalCount > 99 ? '99+' : totalCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
                <div 
                    className="admin-notif-panel glass-panel"
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 10px)',
                        width: '380px',
                        maxWidth: 'calc(100vw - 32px)',
                        backgroundColor: 'var(--bg-main, #0f172a)',
                        borderRadius: '16px',
                        border: '1px solid rgba(6, 182, 212, 0.35)',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 30px rgba(6, 182, 212, 0.2)',
                        zIndex: 999999,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '17px' }}>🔔</span>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                                Notifications
                            </h4>
                            {totalCount > 0 && (
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(6, 182, 212, 0.2)',
                                    color: '#38bdf8',
                                    border: '1px solid rgba(6, 182, 212, 0.4)'
                                }}>
                                    {totalCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-gold, #f59e0b)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    padding: 0
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        padding: '8px 12px',
                        gap: '6px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                fontSize: '12px',
                                fontWeight: activeTab === 'all' ? '700' : '500',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'all' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                                color: activeTab === 'all' ? '#38bdf8' : 'var(--text-muted, #94a3b8)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            All ({totalCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('registrations')}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                fontSize: '12px',
                                fontWeight: activeTab === 'registrations' ? '700' : '500',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'registrations' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                                color: activeTab === 'registrations' ? '#34d399' : 'var(--text-muted, #94a3b8)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            👨‍⚕️ Doctors ({pendingCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('referrals')}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                fontSize: '12px',
                                fontWeight: activeTab === 'referrals' ? '700' : '500',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'referrals' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                                color: activeTab === 'referrals' ? '#38bdf8' : 'var(--text-muted, #94a3b8)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            📋 Referrals ({referralsCount})
                        </button>
                    </div>

                    {/* Notification Items List */}
                    <div style={{
                        maxHeight: '380px',
                        overflowY: 'auto',
                        padding: '6px 0'
                    }}>
                        {/* 1. NEW REGISTRATIONS (DOCTORS PENDING APPROVAL) */}
                        {(activeTab === 'all' || activeTab === 'registrations') && pendingMembers.map(member => (
                            <Link
                                key={`member-${member.id}`}
                                href={route('admin.members')}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '12px 18px',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                    transition: 'background-color 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.14)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)'}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    flexShrink: 0
                                }}>
                                    👨‍⚕️
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            Dr. {member.name}
                                        </span>
                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', whiteSpace: 'nowrap', marginLeft: '6px' }}>
                                            {formatTimeAgo(member.created_at)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.3, marginBottom: '4px' }}>
                                        New doctor registration ({member.doctor_type || 'BDS'}) {member.clinic_name ? `• ${member.clinic_name}` : ''}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            padding: '2px 6px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                            color: '#fbbf24',
                                            border: '1px solid rgba(245, 158, 11, 0.35)'
                                        }}>
                                            Pending Approval
                                        </span>
                                        {member.phone && (
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                                                📞 {member.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* 2. NEW PATIENT REFERRALS */}
                        {(activeTab === 'all' || activeTab === 'referrals') && newReferrals.map(ref => (
                            <Link
                                key={`ref-${ref.id}`}
                                href={route('admin.referrals')}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '12px 18px',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                    backgroundColor: 'rgba(6, 182, 212, 0.05)',
                                    transition: 'background-color 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.14)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.05)'}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#06b6d4',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    flexShrink: 0
                                }}>
                                    📋
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            Patient: {ref.patient_name}
                                        </span>
                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', whiteSpace: 'nowrap', marginLeft: '6px' }}>
                                            {formatTimeAgo(ref.created_at)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.3, marginBottom: '4px' }}>
                                        {ref.medical_condition}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            padding: '2px 6px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(6, 182, 212, 0.2)',
                                            color: '#38bdf8',
                                            border: '1px solid rgba(6, 182, 212, 0.35)'
                                        }}>
                                            New Referral
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                                            By {ref.member ? `Dr. ${ref.member.name}` : (ref.referrer_name || 'Guest / Shop')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* 3. RECENT DATABASE NOTIFICATIONS (if any other notifications) */}
                        {activeTab === 'all' && recentNotifs.filter(n => !n.read_at).map(notif => (
                            <Link
                                key={`notif-${notif.id}`}
                                href={notif.action_url || route('admin.dashboard')}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '12px 18px',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    transition: 'background-color 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    flexShrink: 0
                                }}>
                                    🔔
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {notif.title}
                                        </span>
                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', whiteSpace: 'nowrap', marginLeft: '6px' }}>
                                            {formatTimeAgo(notif.created_at)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.3 }}>
                                        {notif.message}
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* EMPTY STATE */}
                        {((activeTab === 'all' && totalCount === 0) ||
                          (activeTab === 'registrations' && pendingCount === 0) ||
                          (activeTab === 'referrals' && referralsCount === 0)) && (
                            <div style={{
                                padding: '36px 20px',
                                textAlign: 'center',
                                color: 'var(--text-muted, #94a3b8)'
                            }}>
                                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎉</span>
                                <h5 style={{ margin: '0 0 4px', fontSize: '14px', color: '#ffffff', fontWeight: '700' }}>
                                    All Caught Up!
                                </h5>
                                <p style={{ margin: 0, fontSize: '12px' }}>
                                    {activeTab === 'registrations' 
                                        ? 'No new doctor registrations waiting for approval.' 
                                        : activeTab === 'referrals'
                                        ? 'No new patient referrals waiting for review.'
                                        : 'No pending registrations or new patient referrals.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Quick Links */}
                    <div style={{
                        padding: '10px 16px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        fontSize: '12px'
                    }}>
                        <Link 
                            href={route('admin.members')} 
                            onClick={() => setIsOpen(false)}
                            style={{ color: '#34d399', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            👨‍⚕️ Members List →
                        </Link>
                        <Link 
                            href={route('admin.referrals')} 
                            onClick={() => setIsOpen(false)}
                            style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            📋 Referrals Hub →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
