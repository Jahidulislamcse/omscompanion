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
                            border: '2px solid var(--bg-card, #ffffff)',
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
                <div className="admin-notif-panel glass-panel">
                    {/* Header */}
                    <div className="admin-notif-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '17px' }}>🔔</span>
                            <h4 className="admin-notif-title">
                                Notifications
                            </h4>
                            {totalCount > 0 && (
                                <span className="admin-notif-badge-pill">
                                    {totalCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="admin-notif-mark-read"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="admin-notif-tabs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`admin-notif-tab ${activeTab === 'all' ? 'is-active-all' : ''}`}
                        >
                            All ({totalCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('registrations')}
                            className={`admin-notif-tab ${activeTab === 'registrations' ? 'is-active-registrations' : ''}`}
                        >
                            👨‍⚕️ Doctors ({pendingCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('referrals')}
                            className={`admin-notif-tab ${activeTab === 'referrals' ? 'is-active-referrals' : ''}`}
                        >
                            📋 Referrals ({referralsCount})
                        </button>
                    </div>

                    {/* Notification Items List */}
                    <div className="admin-notif-list">
                        {/* 1. NEW REGISTRATIONS (DOCTORS PENDING APPROVAL) */}
                        {(activeTab === 'all' || activeTab === 'registrations') && pendingMembers.map(member => (
                            <Link
                                key={`member-${member.id}`}
                                href={route('admin.members')}
                                onClick={() => setIsOpen(false)}
                                className="admin-notif-item"
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
                                        <span className="admin-notif-item-title">
                                            Dr. {member.name}
                                        </span>
                                        <span className="admin-notif-item-time">
                                            {formatTimeAgo(member.created_at)}
                                        </span>
                                    </div>
                                    <div className="admin-notif-item-subtitle">
                                        New doctor registration ({member.doctor_type || 'BDS'}) {member.clinic_name ? `• ${member.clinic_name}` : ''}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span className="admin-notif-tag-approval">
                                            Pending Approval
                                        </span>
                                        {member.phone && (
                                            <span className="admin-notif-item-subtext">
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
                                className="admin-notif-item"
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
                                        <span className="admin-notif-item-title">
                                            Patient: {ref.patient_name}
                                        </span>
                                        <span className="admin-notif-item-time">
                                            {formatTimeAgo(ref.created_at)}
                                        </span>
                                    </div>
                                    <div className="admin-notif-item-subtitle">
                                        {ref.medical_condition}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span className="admin-notif-tag-referral">
                                            New Referral
                                        </span>
                                        <span className="admin-notif-item-subtext">
                                            By {ref.member ? `Dr. ${ref.member.name}` : (ref.referrer_name || 'Guest / Shop')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* 3. RECENT DATABASE NOTIFICATIONS */}
                        {activeTab === 'all' && recentNotifs.filter(n => !n.read_at).map(notif => (
                            <Link
                                key={`notif-${notif.id}`}
                                href={notif.action_url || route('admin.dashboard')}
                                onClick={() => setIsOpen(false)}
                                className="admin-notif-item"
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6',
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
                                        <span className="admin-notif-item-title">
                                            {notif.title}
                                        </span>
                                        <span className="admin-notif-item-time">
                                            {formatTimeAgo(notif.created_at)}
                                        </span>
                                    </div>
                                    <div className="admin-notif-item-subtitle">
                                        {notif.message}
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* EMPTY STATE */}
                        {((activeTab === 'all' && totalCount === 0) ||
                          (activeTab === 'registrations' && pendingCount === 0) ||
                          (activeTab === 'referrals' && referralsCount === 0)) && (
                            <div className="admin-notif-empty">
                                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎉</span>
                                <h5 className="admin-notif-empty-title">
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
                    <div className="admin-notif-footer">
                        <Link 
                            href={route('admin.members')} 
                            onClick={() => setIsOpen(false)}
                            className="admin-notif-footer-link-member"
                        >
                            👨‍⚕️ Members List →
                        </Link>
                        <Link 
                            href={route('admin.referrals')} 
                            onClick={() => setIsOpen(false)}
                            className="admin-notif-footer-link-referral"
                        >
                            📋 Referrals Hub →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
