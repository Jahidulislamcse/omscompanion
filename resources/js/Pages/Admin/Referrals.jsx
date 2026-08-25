import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Referrals({ referrals }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    
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

    // Counts for tabs
    const doctorReferralsCount = referrals.filter(ref => !(ref.referrer_type === 'medicine_shop' || (!ref.member_id && !ref.member))).length;
    const shopReferralsCount = referrals.filter(ref => ref.referrer_type === 'medicine_shop' || (!ref.member_id && !ref.member)).length;

    // Filter referrals
    const filteredReferrals = referrals.filter(ref => {
        const query = searchTerm.toLowerCase();
        const memberName = ref.member ? ref.member.name.toLowerCase() : '';
        const memberId = ref.member ? (ref.member.member_id || '').toLowerCase() : '';
        const bdsReg = ref.member ? (ref.member.bds_registration_number || '').toLowerCase() : '';
        const referrerName = (ref.referrer_name || '').toLowerCase();
        const referrerPhone = (ref.referrer_phone || '').toLowerCase();
        const referrerAddress = (ref.referrer_address || '').toLowerCase();
        const patientName = (ref.patient_name || '').toLowerCase();
        const patientPhone = (ref.phone || '').toLowerCase();
        const patientAddress = (ref.patient_address || '').toLowerCase();
        const condition = (ref.medical_condition || '').toLowerCase();

        const matchesSearch = 
            patientName.includes(query) ||
            patientPhone.includes(query) ||
            patientAddress.includes(query) ||
            memberName.includes(query) ||
            memberId.includes(query) ||
            bdsReg.includes(query) ||
            referrerName.includes(query) ||
            referrerPhone.includes(query) ||
            referrerAddress.includes(query) ||
            condition.includes(query);
            
        const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;

        const isMedicineShop = ref.referrer_type === 'medicine_shop' || (!ref.member_id && !ref.member);
        const matchesType = typeFilter === 'all' || 
            (typeFilter === 'medicine_shop' && isMedicineShop) || 
            (typeFilter === 'bds_doctor' && !isMedicineShop);

        return matchesSearch && matchesStatus && matchesType;
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
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                
                {/* Top Row: Referrer Type Tabs & Search */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    
                    {/* Referrer Type Pill Tabs */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setTypeFilter('all')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid',
                                borderColor: typeFilter === 'all' ? '#0284c7' : 'var(--border-color)',
                                backgroundColor: typeFilter === 'all' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                                color: typeFilter === 'all' ? '#ffffff' : 'var(--text-main)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            All Referrals
                            <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '10px', 
                                fontSize: '11px', 
                                fontWeight: '800',
                                backgroundColor: typeFilter === 'all' ? 'rgba(255,255,255,0.25)' : 'rgba(255, 255, 255, 0.1)',
                                color: typeFilter === 'all' ? '#ffffff' : 'var(--text-muted)'
                            }}>
                                {referrals.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTypeFilter('bds_doctor')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid',
                                borderColor: typeFilter === 'bds_doctor' ? '#0d9488' : 'rgba(13, 148, 136, 0.4)',
                                backgroundColor: typeFilter === 'bds_doctor' ? '#0d9488' : 'rgba(13, 148, 136, 0.1)',
                                color: typeFilter === 'bds_doctor' ? '#ffffff' : '#2dd4bf',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🩺 Referral by BDS Doctors
                            <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '10px', 
                                fontSize: '11px', 
                                fontWeight: '800',
                                backgroundColor: typeFilter === 'bds_doctor' ? 'rgba(255,255,255,0.25)' : 'rgba(13, 148, 136, 0.25)',
                                color: typeFilter === 'bds_doctor' ? '#ffffff' : '#2dd4bf'
                            }}>
                                {doctorReferralsCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTypeFilter('medicine_shop')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid',
                                borderColor: typeFilter === 'medicine_shop' ? '#d97706' : 'rgba(245, 158, 11, 0.4)',
                                backgroundColor: typeFilter === 'medicine_shop' ? '#d97706' : 'rgba(245, 158, 11, 0.1)',
                                color: typeFilter === 'medicine_shop' ? '#ffffff' : '#fbbf24',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            💊 Referral by Medicine Shop Keeper
                            <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '10px', 
                                fontSize: '11px', 
                                fontWeight: '800',
                                backgroundColor: typeFilter === 'medicine_shop' ? 'rgba(255,255,255,0.25)' : 'rgba(245, 158, 11, 0.25)',
                                color: typeFilter === 'medicine_shop' ? '#ffffff' : '#fbbf24'
                            }}>
                                {shopReferralsCount}
                            </span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <div style={{ minWidth: '260px', flex: '1 1 260px', maxWidth: '400px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search patient, doctor, shop keeper or phone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Bottom Bar: Case Status Filter & Results Count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Case Status:</span>
                        <select
                            className="form-control"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ width: 'auto', minWidth: '180px', padding: '6px 12px', fontSize: '13px' }}
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

                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
                        Showing <span style={{ color: 'var(--accent-teal)' }}>{filteredReferrals.length}</span> of {referrals.length} patient cases
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="glass-panel hidden-mobile" style={{ padding: '0px' }}>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Referrer Info</th>
                                <th>Patient Name & Phone</th>
                                <th>Condition & Address</th>
                                <th>Case Status</th>
                                <th>Commission</th>
                                <th>Timeline Logging</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReferrals.length > 0 ? (
                                filteredReferrals.map((referral) => {
                                    const isMedicineShop = referral.referrer_type === 'medicine_shop' || (!referral.member_id && !referral.member);
                                    return (
                                        <tr key={referral.id}>
                                            <td>
                                                {isMedicineShop ? (
                                                    <div>
                                                        <span className="badge-status" style={{ fontSize: '10px', padding: '2px 8px', marginBottom: '4px', display: 'inline-block', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                                                            💊 Medicine Shop Keeper
                                                        </span>
                                                        <div style={{ fontWeight: '700', color: '#f59e0b' }}>{referral.referrer_name || 'Guest Shop Keeper'}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📞 {referral.referrer_phone || 'N/A'}</div>
                                                        {referral.referrer_address && (
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {referral.referrer_address}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="badge-status badge-approved" style={{ fontSize: '10px', padding: '2px 8px', marginBottom: '4px', display: 'inline-block' }}>
                                                            🩺 BDS Doctor
                                                        </span>
                                                        <div style={{ fontWeight: '700' }}>
                                                            {referral.member?.bds_registration_number ? `Dr. ${referral.member.name}` : (referral.member?.name || referral.referrer_name || 'Doctor')}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                            {referral.member?.member_id ? `ID: ${referral.member.member_id}` : `BDS Reg: ${referral.member?.bds_registration_number || 'N/A'}`}
                                                        </div>
                                                        {referral.member?.clinic_name && (
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🏥 {referral.member.clinic_name}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '700' }}>{referral.patient_name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {referral.phone}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{referral.medical_condition}"</div>
                                                {referral.patient_address && (
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        📍 {referral.patient_address}
                                                    </div>
                                                )}
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '2px', color: referral.urgency_level === 'critical' || referral.urgency_level === 'high' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                                    {referral.urgency_level} urgency
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(referral.status)}</td>
                                            <td>
                                                <div style={{ fontWeight: '700' }}>${parseFloat(referral.commission_amount).toFixed(2)}</div>
                                                <div style={{ marginTop: '2px' }}>{getCommStatusBadge(referral.commission_status)}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {new Date(referral.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    <button 
                                                        onClick={() => openStatusModal(referral)}
                                                        className="btn btn-primary"
                                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    >
                                                        Status
                                                    </button>
                                                    <button 
                                                        onClick={() => openCommissionModal(referral)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    >
                                                        Comm.
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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
            <div className="visible-mobile" style={{ flexDirection: 'column', gap: '12px' }}>
                {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((referral) => {
                        const isMedicineShop = referral.referrer_type === 'medicine_shop' || (!referral.member_id && !referral.member);
                        return (
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
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Referrer Identity</span>
                                        {isMedicineShop ? (
                                            <div>
                                                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>💊 Medicine Shop Keeper</span>
                                                <div style={{ fontWeight: '600' }}>{referral.referrer_name || 'Guest Shop Keeper'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📞 {referral.referrer_phone || 'N/A'}</div>
                                                {referral.referrer_address && (
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {referral.referrer_address}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>🩺 BDS Doctor</span>
                                                <div style={{ fontWeight: '600' }}>
                                                    {referral.member?.bds_registration_number ? `Dr. ${referral.member.name}` : (referral.member?.name || referral.referrer_name || 'Doctor')}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {referral.member?.member_id ? `ID: ${referral.member.member_id}` : `BDS Reg: ${referral.member?.bds_registration_number || 'N/A'}`}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Condition & Address</span>
                                        <div style={{ fontStyle: 'italic' }}>"{referral.medical_condition}"</div>
                                        {referral.patient_address && (
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {referral.patient_address}</div>
                                        )}
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Commission</span>
                                        <div style={{ fontWeight: '700' }}>${parseFloat(referral.commission_amount).toFixed(2)}</div>
                                        <div>{getCommStatusBadge(referral.commission_status)}</div>
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Submitted On</span>
                                        <div style={{ color: 'var(--text-muted)' }}>{new Date(referral.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => openStatusModal(referral)}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                                    >
                                        Update Status
                                    </button>
                                    <button 
                                        onClick={() => openCommissionModal(referral)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                                    >
                                        Commission
                                    </button>
                                </div>
                            </div>
                        );
                    })
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
                            <button onClick={() => setActiveReferralForStatus(null)} className="btn btn-outline" style={{ padding: '4px 8px' }}>✕</button>
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
                            <button onClick={() => setActiveReferralForCommission(null)} className="btn btn-outline" style={{ padding: '4px 8px' }}>✕</button>
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
