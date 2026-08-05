import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function Dashboard({ stats, recentReferrals, recentNotifications }) {
    return (
        <MemberLayout title="Member Dashboard">
            <Head title="Doctor Dashboard" />

            {/* Stats Overview */}
            <div className="dashboard-grid">
                <div className="glass-panel stat-card">
                    <span className="stat-title">My Referrals</span>
                    <div className="stat-value">
                        {stats.total_referrals} <span>Patients</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Total number of patient submissions
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                    <span className="stat-title">Active Cases</span>
                    <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>
                        {stats.active_cases} <span>Tracking</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Cases currently undergoing treatment status updates
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <span className="stat-title">Completed Treatments</span>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        {stats.completed_cases} <span>Done</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Cases where treatment was completed successfully
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '24px' }}>
                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                    <span className="stat-title">Pending Commission</span>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                        ${stats.pending_commissions.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Approved referral commission pending payout
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <span className="stat-title">Paid Commission</span>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        ${stats.paid_commissions.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Commissions disbursed to your clinic account
                    </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
                    <Link href={route('member.referrals')} className="btn btn-primary" style={{ width: '100%', height: '50px', fontSize: '15px' }}>
                        ➕ Refer a New Patient
                    </Link>
                </div>
            </div>

            {/* Split layout: Recent Referrals & Notifications */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '24px' }}>
                {/* Referrals table */}
                <div className="glass-panel" style={{ padding: '24px 0px 0px' }}>
                    <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Recent Referrals</h3>
                        <Link href={route('member.referrals')} style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                            View All History →
                        </Link>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Condition</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReferrals.length > 0 ? (
                                    recentReferrals.map(ref => (
                                        <tr key={ref.id}>
                                            <td style={{ fontWeight: '700' }}>{ref.patient_name}</td>
                                            <td style={{ fontStyle: 'italic', fontSize: '13px' }}>{ref.medical_condition}</td>
                                            <td>
                                                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Link 
                                                    href={route('member.referrals.tracker', ref.id)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '4px 10px', fontSize: '11px' }}
                                                >
                                                    Track Case
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                            No patients referred yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="glass-panel" style={{ padding: '24px 0px' }}>
                    <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Recent Notifications</h3>
                        <Link href={route('member.notifications')} style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                            All History →
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto' }}>
                        {recentNotifications.length > 0 ? (
                            recentNotifications.map(notif => (
                                <div key={notif.id} className="notification-item" style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent-teal)' }}>{notif.title}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(notif.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {notif.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                No notifications received yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
}
