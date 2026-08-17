import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Referrals({ referrals }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Status Modal State
    const [activeReferralForStatus, setActiveReferralForStatus] = useState(null);
    const { data: statusData, setData: setStatusData, post: postStatus, processing: statusProcessing, reset: resetStatusForm } = useForm({
        status: '',
        notes: '',
    });

    // Commission Modal State
    const [activeReferralForCommission, setActiveReferralForCommission] = useState(null);
    const { data: commData, setData: setCommData, post: postComm, processing: commProcessing } = useForm({
        commission_amount: 0,
        commission_status: 'none',
    });

    const openStatusModal = (referral) => {
        setActiveReferralForStatus(referral);
        setStatusData({
            status: referral.status,
            notes: '',
        });
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        postStatus(route('admin.referrals.status', activeReferralForStatus.id), {
            onSuccess: () => {
                setActiveReferralForStatus(null);
                resetStatusForm();
            }
        });
    };

    const openCommissionModal = (referral) => {
        setActiveReferralForCommission(referral);
        setCommData({
            commission_amount: referral.commission_amount,
            commission_status: referral.commission_status,
        });
    };

    const handleCommissionSubmit = (e) => {
        e.preventDefault();
        postComm(route('admin.referrals.commission', activeReferralForCommission.id), {
            onSuccess: () => {
                setActiveReferralForCommission(null);
            }
        });
    };

    // Filter referrals
    const filteredReferrals = referrals.filter(ref => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            ref.patient_name.toLowerCase().includes(query) ||
            ref.member.name.toLowerCase().includes(query) ||
            ref.medical_condition.toLowerCase().includes(query);
            
        const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const labels = {
            new: 'New Referral',
            contacted: 'Contacted',
            appointment_booked: 'Appointment Booked',
            under_treatment: 'Under Treatment',
            completed: 'Completed',
            not_proceeding: 'Not Proceeding'
        };
        const classNames = {
            new: 'badge-new',
            contacted: 'badge-contacted',
            appointment_booked: 'badge-booked',
            under_treatment: 'badge-treatment',
            completed: 'badge-completed',
            not_proceeding: 'badge-not-proceeding'
        };
        return <span className={`badge-status ${classNames[status]}`}>{labels[status]}</span>;
    };

    const getCommStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="badge-status badge-approved">Paid</span>;
            case 'pending': return <span className="badge-status badge-pending">Pending</span>;
            default: return <span className="badge-status badge-outline" style={{ color: 'var(--text-muted)' }}>None</span>;
        }
    };

    return (
        <AdminLayout title="Patient Referrals & Case Status">
            <Head title="Patient Referrals" />

            {/* Filter Panel */}
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', width: '100%', marginBottom: '12px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search patient, referring doctor or condition..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ gridColumn: 'span 1 / -1' }}
                    />
                    <select
                        className="form-control"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ gridColumn: 'span 1 / -1' }}
                    >
                        <option value="all">All Case Statuses</option>
                        <option value="new">New Referral</option>
                        <option value="contacted">Contacted</option>
                        <option value="appointment_booked">Appointment Booked</option>
                        <option value="under_treatment">Under Treatment</option>
                        <option value="completed">Completed</option>
                        <option value="not_proceeding">Not Proceeding</option>
                    </select>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Showing {filteredReferrals.length} of {referrals.length} patient cases
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="glass-panel hidden-mobile" style={{ padding: '0px' }}>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Referring Member</th>
                                <th>Condition & Urgency</th>
                                <th>Case Status</th>
                                <th>Commission</th>
                                <th>Timeline Logging</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReferrals.length > 0 ? (
                                filteredReferrals.map((referral) => (
                                    <tr key={referral.id}>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>{referral.patient_name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{referral.phone}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {referral.member.bds_registration_number ? `Dr. ${referral.member.name}` : referral.member.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {referral.member.member_id}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{referral.medical_condition}"</div>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: referral.urgency_level === 'critical' || referral.urgency_level === 'high' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                                {referral.urgency_level} urgency
                                            </span>
                                        </td>
                                        <td>{getStatusBadge(referral.status)}</td>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>${parseFloat(referral.commission_amount).toFixed(2)}</div>
                                            <div>{getCommStatusBadge(referral.commission_status)}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Last updated: {new Date(referral.updated_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                onClick={() => openStatusModal(referral)}
                                                className="btn btn-primary"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                Update Status
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        No referrals found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="visible-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((referral) => (
                        <div key={referral.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{referral.patient_name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {referral.phone}</div>
                                </div>
                                <div>
                                    {getStatusBadge(referral.status)}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Referring Doctor</span>
                                    <div style={{ fontWeight: '600' }}>
                                        {referral.member.bds_registration_number ? `Dr. ${referral.member.name}` : referral.member.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {referral.member.member_id}</div>
                                </div>

                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Condition & Urgency</span>
                                    <div style={{ fontStyle: 'italic' }}>"{referral.medical_condition}"</div>
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: referral.urgency_level === 'critical' || referral.urgency_level === 'high' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                        {referral.urgency_level} urgency
                                    </span>
                                </div>

                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Commission</span>
                                    <div style={{ fontWeight: '700' }}>${parseFloat(referral.commission_amount).toFixed(2)}</div>
                                    <div>{getCommStatusBadge(referral.commission_status)}</div>
                                </div>

                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Last Updated</span>
                                    <div style={{ color: 'var(--text-muted)' }}>{new Date(referral.updated_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                                <button 
                                    onClick={() => openStatusModal(referral)}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '8px', fontSize: '12px' }}
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No referrals found matching your search.
                    </div>
                )}
            </div>

            {/* Modal: Update Referral Status */}
            {activeReferralForStatus && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-main)', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Update Status: {activeReferralForStatus.patient_name}</h3>
                            <button onClick={() => setActiveReferralForStatus(null)} className="btn btn-outline" style={{ padding: '4px 8px' }}>X</button>
                        </div>
                        
                        <form onSubmit={handleStatusSubmit}>
                            <div className="form-group">
                                <label className="form-label">Select Treatment Status</label>
                                <select 
                                    className="form-control"
                                    value={statusData.status}
                                    onChange={e => setStatusData('status', e.target.value)}
                                    required
                                >
                                    <option value="new">New Referral</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="appointment_booked">Appointment Booked</option>
                                    <option value="under_treatment">Under Treatment</option>
                                    <option value="completed">Completed</option>
                                    <option value="not_proceeding">Not Proceeding</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Timeline Transition Notes (Optional)</label>
                                <textarea 
                                    className="form-control"
                                    value={statusData.notes}
                                    onChange={e => setStatusData('notes', e.target.value)}
                                    rows="3"
                                    placeholder="Enter optional comments about this status change..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" onClick={() => setActiveReferralForStatus(null)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={statusProcessing}>
                                    {statusProcessing ? 'Saving...' : 'Save Status Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Update Commission */}
            {activeReferralForCommission && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-main)', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Commission Setup: {activeReferralForCommission.patient_name}</h3>
                            <button onClick={() => setActiveReferralForCommission(null)} className="btn btn-outline" style={{ padding: '4px 8px' }}>X</button>
                        </div>
                        
                        <form onSubmit={handleCommissionSubmit}>
                            <div className="form-group">
                                <label className="form-label">Commission Amount (USD)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    value={commData.commission_amount}
                                    onChange={e => setCommData('commission_amount', e.target.value)}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Commission Status</label>
                                <select 
                                    className="form-control"
                                    value={commData.commission_status}
                                    onChange={e => setCommData('commission_status', e.target.value)}
                                    required
                                >
                                    <option value="none">None</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" onClick={() => setActiveReferralForCommission(null)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-secondary" disabled={commProcessing}>
                                    {commProcessing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
