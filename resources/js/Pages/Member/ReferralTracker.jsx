import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function ReferralTracker({ referral }) {
    // Flow of statuses
    const statusFlow = [
        { key: 'new', label: 'New Referral' },
        { key: 'contacted', label: 'Contacted' },
        { key: 'appointment_booked', label: 'Appointment Booked' },
        { key: 'under_treatment', label: 'Under Treatment' },
        { key: 'completed', label: 'Completed' }
    ];

    // Determine current progress index
    const currentStatusIndex = statusFlow.findIndex(s => s.key === referral.status);
    const isNotProceeding = referral.status === 'not_proceeding';

    const getStatusStyle = (idx) => {
        if (isNotProceeding) {
            return { color: 'var(--text-light)', backgroundColor: 'var(--border-color)', border: 'none' };
        }
        if (idx < currentStatusIndex) {
            // Completed steps
            return { color: 'var(--text-white)', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' };
        }
        if (idx === currentStatusIndex) {
            // Current active step
            return { color: 'var(--text-white)', backgroundColor: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', boxShadow: '0 0 12px var(--accent-gold)' };
        }
        // Future steps
        return { color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' };
    };

    return (
        <MemberLayout title="Live Case Tracker">
            <Head title="Live Case Tracker" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <Link href={route('member.referrals')} className="btn btn-outline" style={{ fontSize: '13px' }}>
                        ← Back to History
                    </Link>
                </div>

                {/* Patient Profile Card */}
                <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Patient Name</div>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{referral.patient_name}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Number</div>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{referral.phone}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Condition</div>
                        <div style={{ fontSize: '15px', fontStyle: 'italic' }}>"{referral.medical_condition}"</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Urgency Level</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: referral.urgency_level === 'critical' || referral.urgency_level === 'high' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                            {referral.urgency_level}
                        </div>
                    </div>
                </div>

                {/* Visual Status Progress Flow Bar */}
                <div className="glass-panel" style={{ overflowX: 'auto', padding: '30px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '700px', position: 'relative' }}>
                        
                        {/* Horizontal connecting line */}
                        <div style={{ 
                            position: 'absolute', 
                            left: '5%', 
                            right: '5%', 
                            top: '25px', 
                            height: '3px', 
                            backgroundColor: 'var(--border-color)', 
                            zIndex: 0 
                        }}></div>
                        
                        {/* Completed horizontal line highlights */}
                        {!isNotProceeding && currentStatusIndex > 0 && (
                            <div style={{ 
                                position: 'absolute', 
                                left: '5%', 
                                width: `${(currentStatusIndex / (statusFlow.length - 1)) * 90}%`, 
                                top: '25px', 
                                height: '3px', 
                                backgroundColor: 'var(--color-success)', 
                                zIndex: 0,
                                transition: 'var(--transition-smooth)'
                            }}></div>
                        )}

                        {statusFlow.map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1, width: '18%' }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '50%', 
                                    border: '3px solid',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justify: 'center',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    transition: 'var(--transition-smooth)',
                                    ...getStatusStyle(idx)
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    fontWeight: idx === currentStatusIndex ? '800' : '600', 
                                    textAlign: 'center',
                                    color: idx === currentStatusIndex ? 'var(--accent-gold)' : 'inherit'
                                }}>
                                    {step.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isNotProceeding && (
                        <div style={{ marginTop: '25px', border: '1px solid var(--color-danger)', borderRadius: '6px', padding: '12px 20px', color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-bg)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span>⚠️</span>
                            <div>
                                <span style={{ fontWeight: '700' }}>Case Suspended:</span> This referral was marked as <strong>Not Proceeding</strong>. Please view the timeline below for reasons or notes.
                            </div>
                        </div>
                    )}
                </div>

                {/* Vertical Status Timeline Details */}
                <div className="glass-panel">
                    <h3 style={{ marginBottom: '24px' }}>Case Status Updates Timeline Log</h3>
                    
                    <div className="timeline-container">
                        {referral.timeline && referral.timeline.length > 0 ? (
                            referral.timeline.map((entry, idx) => (
                                <div className="timeline-item" key={entry.id}>
                                    <div className={`timeline-point ${idx === 0 ? 'active' : ''}`}></div>
                                    <div className="timeline-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="timeline-title" style={{ textTransform: 'capitalize', color: entry.status === 'not_proceeding' ? 'var(--color-danger)' : 'inherit' }}>
                                                Status: {entry.status.replace('_', ' ')}
                                            </div>
                                            <span className="timeline-time">
                                                {new Date(entry.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 'bold' }}>
                                            Updated by: {entry.changer.name} ({entry.changer.role === 'admin' ? 'Administrator' : 'Doctor'})
                                        </div>
                                        {entry.notes && (
                                            <p className="timeline-notes">
                                                {entry.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>No status updates recorded.</div>
                        )}
                    </div>
                </div>

            </div>
        </MemberLayout>
    );
}
