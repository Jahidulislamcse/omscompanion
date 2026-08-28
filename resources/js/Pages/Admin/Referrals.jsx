import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Referrals({ referrals, members = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Add Patient Referral Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredMembersForAssignment = members.filter(m => {
        const query = memberSearchQuery.toLowerCase().trim();
        if (!query) return true;
        const name = (m.name || '').toLowerCase();
        const memberId = (m.member_id || '').toLowerCase();
        const phone = (m.phone || '').toLowerCase();
        const bdsReg = (m.bds_registration_number || '').toLowerCase();
        const clinic = (m.clinic_name || '').toLowerCase();

        return name.includes(query) || 
               memberId.includes(query) || 
               phone.includes(query) || 
               bdsReg.includes(query) || 
               clinic.includes(query);
    });

    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: resetAddForm } = useForm({
        member_id: '',
        patient_name: '',
        phone: '',
        patient_address: '',
        medical_condition: '',
        urgency_level: 'medium',
        commission_amount: 0,
        commission_status: 'none',
        additional_notes: '',
    });

    const selectedMemberObj = (members || []).find(m => m && addData && addData.member_id && String(m.id) === String(addData.member_id));

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('admin.referrals.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setMemberSearchQuery('');
                setIsSearchFocused(false);
                resetAddForm();
            }
        });
    };
    
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

            {/* Quick Action Hero Banner Card */}
            <div className="glass-panel" style={{ 
                padding: '24px 28px', 
                marginBottom: '24px', 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '16px',
                backgroundColor: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'var(--text-main, #0f172a)' }}>
                        Submit a Patient Referral
                    </h2>
                    <p style={{ margin: '6px 0 0', color: 'var(--text-muted, #64748b)', fontSize: '14px' }}>
                        Send patient cases to OMS COMPANION and track case progress in real-time.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsAddModalOpen(true)}
                    style={{ 
                        padding: '12px 24px', 
                        fontSize: '15px', 
                        fontWeight: '700', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        borderRadius: '8px',
                        backgroundColor: '#164e63',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(22, 78, 99, 0.3)'
                    }}
                >
                    <span style={{ fontSize: '16px', fontWeight: '900' }}>+</span> Refer a New Patient
                </button>
            </div>

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

            {/* Modal: Add New Patient Referral & Assign Member */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-main)', margin: 'auto', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Add New Patient Referral</h3>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline" style={{ padding: '4px 10px', cursor: 'pointer' }}>✕</button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit}>
                            {/* Member Assignment Selection with Instant Auto-complete */}
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                                    Referring Member / Doctor (Optional Assignment)
                                </label>
                                
                                {selectedMemberObj ? (
                                    /* Selected Member Card Display */
                                    <div style={{ 
                                        padding: '12px 16px', 
                                        backgroundColor: 'rgba(13, 148, 136, 0.1)', 
                                        border: '1px solid rgba(13, 148, 136, 0.4)', 
                                        borderRadius: '8px', 
                                        display: 'flex', 
                                        justify: 'space-between', 
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
                                                ✓ {selectedMemberObj.bds_registration_number ? 'Dr. ' : ''}{selectedMemberObj.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                <span>🆔 {selectedMemberObj.member_id || 'ID: ' + selectedMemberObj.id}</span>
                                                <span>📞 {selectedMemberObj.phone || 'N/A'}</span>
                                                {selectedMemberObj.clinic_name && <span>🏥 {selectedMemberObj.clinic_name}</span>}
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => { setAddData('member_id', ''); setMemberSearchQuery(''); setIsSearchFocused(true); }} 
                                            className="btn btn-outline" 
                                            style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px' }}
                                        >
                                            ✕ Change
                                        </button>
                                    </div>
                                ) : (
                                    /* Instant Search Input & Results Container */
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="🔍 Type Member ID, Name, Phone, or BDS Reg..."
                                            value={memberSearchQuery}
                                            onChange={e => setMemberSearchQuery(e.target.value)}
                                            onFocus={() => setIsSearchFocused(true)}
                                            style={{ fontSize: '13px', padding: '10px 14px', borderRadius: '8px' }}
                                        />

                                        {/* Instant Search Results Dropdown List */}
                                        {(memberSearchQuery.trim().length > 0 || isSearchFocused) && (
                                            <div style={{
                                                position: 'relative',
                                                maxHeight: '220px',
                                                overflowY: 'auto',
                                                backgroundColor: 'var(--bg-card, #ffffff)',
                                                border: '1px solid var(--border-color, #cbd5e1)',
                                                borderRadius: '8px',
                                                marginTop: '6px',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                zIndex: 10
                                            }}>
                                                {/* Option for Direct / Guest Referral */}
                                                <div 
                                                    onClick={() => { setAddData('member_id', ''); setMemberSearchQuery(''); setIsSearchFocused(false); }}
                                                    style={{ 
                                                        padding: '10px 14px', 
                                                        cursor: 'pointer', 
                                                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                                                        fontSize: '13px',
                                                        color: 'var(--text-muted, #64748b)',
                                                        backgroundColor: addData.member_id === '' ? 'rgba(0,0,0,0.03)' : 'transparent'
                                                    }}
                                                >
                                                    🚫 <em>-- Direct / Guest Referral (No Member Assigned) --</em>
                                                </div>

                                                {filteredMembersForAssignment.length > 0 ? (
                                                    filteredMembersForAssignment.map(m => (
                                                        <div
                                                            key={m.id}
                                                            onClick={() => {
                                                                setAddData('member_id', m.id);
                                                                setMemberSearchQuery('');
                                                                setIsSearchFocused(false);
                                                            }}
                                                            style={{
                                                                padding: '10px 14px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                                                                transition: 'background-color 0.15s ease',
                                                                display: 'flex',
                                                                justify: 'space-between',
                                                                alignItems: 'center',
                                                                gap: '10px'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(13, 148, 136, 0.1)'}
                                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            <div>
                                                                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main, #0f172a)' }}>
                                                                    {m.bds_registration_number ? 'Dr. ' : ''}{m.name}
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                                    <span>📞 {m.phone || 'N/A'}</span>
                                                                    {m.clinic_name && <span>🏥 {m.clinic_name}</span>}
                                                                </div>
                                                            </div>
                                                            <span style={{ 
                                                                fontSize: '11px', 
                                                                fontWeight: '700', 
                                                                padding: '3px 8px', 
                                                                borderRadius: '6px', 
                                                                backgroundColor: 'rgba(13, 148, 136, 0.15)', 
                                                                color: '#0d9488' 
                                                            }}>
                                                                ID: {m.member_id || m.id}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ padding: '12px 14px', fontSize: '13px', color: '#eab308' }}>
                                                        No members match "{memberSearchQuery}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {addErrors.member_id && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{addErrors.member_id}</div>}
                                <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    Type to instantly filter member list by ID, Name, or Phone, then click to assign.
                                </small>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                {/* Patient Name */}
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Patient Name *</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        value={addData.patient_name}
                                        onChange={e => setAddData('patient_name', e.target.value)}
                                        required
                                        placeholder="e.g. John Doe"
                                    />
                                    {addErrors.patient_name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{addErrors.patient_name}</div>}
                                </div>

                                {/* Patient Phone */}
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Patient Phone *</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        value={addData.phone}
                                        onChange={e => setAddData('phone', e.target.value)}
                                        required
                                        placeholder="e.g. +8801700000000"
                                    />
                                    {addErrors.phone && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{addErrors.phone}</div>}
                                </div>
                            </div>

                            {/* Patient Address */}
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Patient Address</label>
                                <input 
                                    type="text"
                                    className="form-control"
                                    value={addData.patient_address}
                                    onChange={e => setAddData('patient_address', e.target.value)}
                                    placeholder="Enter patient location / address"
                                />
                                {addErrors.patient_address && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{addErrors.patient_address}</div>}
                            </div>

                            {/* Medical Condition & Urgency */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Medical Condition / Chief Complaint *</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        value={addData.medical_condition}
                                        onChange={e => setAddData('medical_condition', e.target.value)}
                                        required
                                        placeholder="e.g. Impacted Wisdom Tooth / Facial Trauma"
                                    />
                                    {addErrors.medical_condition && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{addErrors.medical_condition}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Urgency Level *</label>
                                    <select 
                                        className="form-control"
                                        value={addData.urgency_level}
                                        onChange={e => setAddData('urgency_level', e.target.value)}
                                        required
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                    {addErrors.urgency_level && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{addErrors.urgency_level}</div>}
                                </div>
                            </div>

                            {/* Commission Amount & Status */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Commission Amount</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        value={addData.commission_amount}
                                        onChange={e => setAddData('commission_amount', e.target.value)}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Commission Status</label>
                                    <select 
                                        className="form-control"
                                        value={addData.commission_status}
                                        onChange={e => setAddData('commission_status', e.target.value)}
                                    >
                                        <option value="none">None</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label className="form-label" style={{ fontWeight: '600', marginBottom: '4px', display: 'block' }}>Additional Notes</label>
                                <textarea 
                                    className="form-control"
                                    value={addData.additional_notes}
                                    onChange={e => setAddData('additional_notes', e.target.value)}
                                    rows="3"
                                    placeholder="Any additional instructions or clinical observations..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={addProcessing}>
                                    {addProcessing ? 'Submitting...' : 'Submit Patient Referral'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
