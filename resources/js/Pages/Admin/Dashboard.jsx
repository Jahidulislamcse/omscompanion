import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ stats }) {
    return (
        <AdminLayout title="Analytics Dashboard">
            <Head title="Admin Dashboard" />

            {/* Stat Cards */}
            <div className="dashboard-grid">
                <div className="glass-panel stat-card">
                    <span className="stat-title">Total BDS Members</span>
                    <div className="stat-value">
                        {stats.total_members} <span>Doctors</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Registered BDS Doctor Applications
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <span className="stat-title">Active Members</span>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        {stats.active_members} <span>Approved</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Verified doctors with dashboard privileges
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <span className="stat-title">Total Referrals</span>
                    <div className="stat-value">
                        {stats.total_referrals} <span>Cases</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Patient referrals received from members
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                    <span className="stat-title">Active Cases</span>
                    <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>
                        {stats.active_cases} <span>Underway</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Currently active patient status timelines
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '24px' }}>
                <div className="glass-panel stat-card">
                    <span className="stat-title">Completed Treatments</span>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        {stats.completed_treatments} <span>Done</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Successfully completed dental treatments
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                    <span className="stat-title">Pending Commissions</span>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                        ${stats.pending_commissions.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Commissions declared but unpaid
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <span className="stat-title">Paid Commissions</span>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        ${stats.paid_commissions.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Commissions paid out to members
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <span className="stat-title">Video Library</span>
                    <div className="stat-value">
                        {stats.video_stats.total_videos} <span>Videos</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {stats.video_stats.total_categories} different categories
                    </div>
                </div>
            </div>

            {/* Graphics & Charts Container */}
            <div className="glass-panel" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Monthly Referral Volume (Simulated)</h3>
                
                {/* SVG Visual Chart */}
                <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 40px', position: 'relative' }}>
                    
                    {/* Y-Axis Guidlines */}
                    <div style={{ position: 'absolute', left: 0, bottom: '20%', width: '100%', borderBottom: '1px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', left: 0, bottom: '50%', width: '100%', borderBottom: '1px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', left: 0, bottom: '80%', width: '100%', borderBottom: '1px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                    
                    {/* Bars */}
                    {[
                        { month: 'Jan', val: 45 },
                        { month: 'Feb', val: 62 },
                        { month: 'Mar', val: 78 },
                        { month: 'Apr', val: 56 },
                        { month: 'May', val: 89 },
                        { month: 'Jun', val: 110 },
                        { month: 'Jul', val: stats.total_referrals ? stats.total_referrals * 10 : 95 }
                    ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, width: '8%' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.val}</div>
                            <div style={{ 
                                width: '100%', 
                                height: `${(item.val / 120) * 140}px`, 
                                background: 'linear-gradient(to top, var(--accent-teal), var(--accent-gold))', 
                                borderRadius: '4px 4px 0 0',
                                transition: 'var(--transition-smooth)'
                            }}></div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>{item.month}</div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
