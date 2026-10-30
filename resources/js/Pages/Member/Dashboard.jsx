import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import { useAppInstalled } from '@/utils/appDetection';

export default function Dashboard({ stats, recentReferrals, recentNotifications }) {
    const { site_name, is_app_installed } = usePage().props;
    const isInstalled = useAppInstalled() || Boolean(is_app_installed);
    const [showReferralModal, setShowReferralModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_name: '',
        phone: '',
        medical_condition: '',
        urgency_level: 'low',
        additional_notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('member.referrals.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowReferralModal(false);
                alert('Patient referral submitted successfully!');
            }
        });
    };

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

            {/* Quick Action Banner */}
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', padding: '20px 24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Submit a Patient Referral</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Send patient cases to {site_name || 'OMS Companion'} and track case progress in real-time.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowReferralModal(true)}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '15px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <span>➕</span> Refer a New Patient
                </button>
            </div>

            {/* Download Mobile App Banner (Hidden if app is installed / inside app) */}
            {!isInstalled && (
                <div className="glass-panel" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginTop: '16px', 
                    padding: '20px 24px', 
                    flexWrap: 'wrap', 
                    gap: '16px',
                    borderLeft: '4px solid #10b981'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📱 Install {site_name || 'OMS Companion'} Mobile App
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                            Get instant push notifications on your phone when clinical announcements or new surgical videos are released.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Link href={route('app.download')} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: '#10b981', border: 'none', color: '#ffffff' }}>
                            📲 Install Mobile App Page
                        </Link>
                        <a href="/download-apk-file" className="btn btn-outline" style={{ padding: '10px 16px', fontSize: '14px' }}>
                            📥 Install Mobile App
                        </a>
                    </div>
                </div>
            )}

            {/* Split layout: Recent Referrals & Notifications */}
            <div className="dashboard-split-grid" style={{ marginTop: '24px' }}>
                {/* Referrals table */}
                <div className="glass-panel" style={{ padding: '24px 0px 0px' }}>
                    <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Recent Referrals</h3>
                        <Link href={route('member.referrals')} style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                            View All History →
                        </Link>
                    </div>

                    <div className="table-container hidden-mobile">
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

                    {/* Mobile cards view */}
                    <div className="visible-mobile" style={{ display: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px 24px 16px' }}>
                            {recentReferrals.length > 0 ? (
                                recentReferrals.map(ref => (
                                    <div key={ref.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '700', fontSize: '15px' }}>{ref.patient_name}</span>
                                            <span style={{ 
                                                fontSize: '9px', 
                                                padding: '3px 8px', 
                                                borderRadius: '10px', 
                                                textTransform: 'uppercase', 
                                                fontWeight: 'bold', 
                                                border: '1px solid var(--border-color)', 
                                                color: 'var(--text-muted)' 
                                            }}>
                                                {ref.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-light)' }}>
                                            "{ref.medical_condition}"
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                            <Link 
                                                href={route('member.referrals.tracker', ref.id)}
                                                className="btn btn-outline"
                                                style={{ padding: '6px 14px', fontSize: '12px', width: '100%', textAlign: 'center' }}
                                            >
                                                Track Case
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No patients referred yet.
                                </div>
                            )}
                        </div>
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
                                <Link 
                                    key={notif.id} 
                                    href={route('member.notifications.go', notif.id)}
                                    className="notification-item dashboard-notif-link" 
                                    style={{ 
                                        borderBottom: '1px solid var(--border-color)', 
                                        padding: '12px 24px',
                                        textDecoration: 'none',
                                        cursor: 'pointer'
                                    }}
                                    title="Click to view details"
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '10px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent-teal)' }}>
                                            {notif.title}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {notif.message}
                                    </p>
                                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>
                                        Open section →
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                No notifications received yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: New Patient Referral Form Popup */}
            {showReferralModal && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.75)', 
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 99999,
                        padding: '20px',
                        boxSizing: 'border-box'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowReferralModal(false);
                    }}
                >
                    <div 
                        className="glass-panel" 
                        style={{ 
                            width: '100%', 
                            maxWidth: '540px', 
                            backgroundColor: 'var(--bg-main, #0f172a)', 
                            maxHeight: '90vh', 
                            overflowY: 'auto', 
                            margin: 'auto',
                            borderRadius: '16px',
                            border: '1px solid rgba(6, 182, 212, 0.35)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(6, 182, 212, 0.2)',
                            padding: '24px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                                <span>➕</span> Submit Patient Referral
                            </h3>
                            <button 
                                type="button"
                                onClick={() => setShowReferralModal(false)} 
                                className="video-modal-close-btn"
                                style={{ width: '32px', height: '32px', minWidth: '32px' }}
                                aria-label="Close"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" htmlFor="dashboard_patient_name" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Patient Name *</label>
                                <input 
                                    type="text"
                                    id="dashboard_patient_name"
                                    className="form-control"
                                    placeholder="Enter full name of patient"
                                    value={data.patient_name}
                                    onChange={e => setData('patient_name', e.target.value)}
                                    required
                                />
                                {errors.patient_name && <span className="form-error" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.patient_name}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" htmlFor="dashboard_phone" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Patient Phone Number *</label>
                                <input 
                                    type="text"
                                    id="dashboard_phone"
                                    className="form-control"
                                    placeholder="e.g. +88017XXXXXXXX"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    required
                                />
                                {errors.phone && <span className="form-error" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.phone}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" htmlFor="dashboard_medical_condition" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Medical Condition *</label>
                                <input 
                                    type="text"
                                    id="dashboard_medical_condition"
                                    className="form-control"
                                    placeholder="e.g. Impacted Wisdom Tooth Extraction, Maxillofacial Cyst, Biopsy"
                                    value={data.medical_condition}
                                    onChange={e => setData('medical_condition', e.target.value)}
                                    required
                                />
                                {errors.medical_condition && <span className="form-error" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.medical_condition}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" htmlFor="dashboard_urgency_level" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Urgency Level *</label>
                                <select
                                    id="dashboard_urgency_level"
                                    className="form-control"
                                    value={data.urgency_level}
                                    onChange={e => setData('urgency_level', e.target.value)}
                                    required
                                >
                                    <option value="low">Low Urgency (Routine)</option>
                                    <option value="medium">Medium Urgency (Moderate Pain)</option>
                                    <option value="high">High Urgency (Severe Pain)</option>
                                    <option value="critical">Critical Urgency (Immediate Care)</option>
                                </select>
                                {errors.urgency_level && <span className="form-error" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.urgency_level}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label className="form-label" htmlFor="dashboard_additional_notes" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>Additional Notes (Optional)</label>
                                <textarea 
                                    id="dashboard_additional_notes"
                                    className="form-control"
                                    placeholder="Medical history, references, or preferred schedules..."
                                    value={data.additional_notes}
                                    onChange={e => setData('additional_notes', e.target.value)}
                                    rows="3"
                                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                />
                                {errors.additional_notes && <span className="form-error" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.additional_notes}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowReferralModal(false)} 
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={processing}
                                >
                                    {processing ? 'Submitting Referral...' : 'Submit Referral'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MemberLayout>
    );
}
