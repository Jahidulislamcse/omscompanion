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

                <div className="glass-panel stat-card">
                    <span className="stat-title">Completed Treatments</span>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        {stats.completed_treatments} <span>Done</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Successfully completed dental treatments
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Monthly Referral Volume</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Real Database Records</div>
                </div>
                
                {/* SVG Visual Chart */}
                {stats.monthly_referral_volume && stats.monthly_referral_volume.length > 0 ? (
                    <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '10px 20px', position: 'relative' }}>
                        
                        {/* Y-Axis Guidelines */}
                        <div style={{ position: 'absolute', left: 0, bottom: '20%', width: '100%', borderBottom: '1px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'absolute', left: 0, bottom: '50%', width: '100%', borderBottom: '1px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'absolute', left: 0, bottom: '80%', width: '100%', borderBottom: '1px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                        
                        {/* Bars */}
                        {(() => {
                            const maxVal = Math.max(...stats.monthly_referral_volume.map(item => item.count), 5);
                            return stats.monthly_referral_volume.map((item, idx) => {
                                const barHeight = item.count > 0 ? Math.max((item.count / maxVal) * 140, 15) : 4;
                                return (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, flexGrow: 1, maxWidth: '60px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.count}</div>
                                        <div style={{ 
                                            width: '100%', 
                                            height: `${barHeight}px`, 
                                            background: item.count > 0 ? 'linear-gradient(to top, var(--accent-teal), var(--accent-gold))' : 'var(--border-color)', 
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'var(--transition-smooth)'
                                        }}></div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>{item.month}</div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No referral data recorded yet.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
