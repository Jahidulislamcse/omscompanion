import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Members({ members = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
    
    // Modal state for viewing member referral records
    const [selectedMemberForReferrals, setSelectedMemberForReferrals] = useState(null);

    // Modal state for editing member commission settings
    const [selectedMemberForCommission, setSelectedMemberForCommission] = useState(null);
    const [commissionApplicable, setCommissionApplicable] = useState(false);
    const [commissionNote, setCommissionNote] = useState('');

    // Modal state for enlarged user profile photo preview
    const [selectedImageModal, setSelectedImageModal] = useState(null);

    const handleOpenCommissionModal = (member) => {
        setSelectedMemberForCommission(member);
        setCommissionApplicable(!!member.is_commission_applicable);
        setCommissionNote(member.commission_note || '');
    };

    const handleSaveCommission = (e) => {
        e.preventDefault();
        router.post(route('admin.members.commission_setting', selectedMemberForCommission.id), {
            is_commission_applicable: commissionApplicable,
            commission_note: commissionNote,
        }, {
            onSuccess: () => setSelectedMemberForCommission(null)
        });
    };

    const handleApprove = (userId) => {
        if (confirm('Are you sure you want to approve this membership application?')) {
            router.post(route('admin.members.approve', userId));
        }
    };

    const handleReject = (userId) => {
        if (confirm('Are you sure you want to reject this registration application?')) {
            router.post(route('admin.members.reject', userId));
        }
    };

    const handleDelete = (member) => {
        const title = member.bds_registration_number ? `Dr. ${member.name}` : member.name;
        if (confirm(`Are you sure you want to permanently delete member "${title}"? This action cannot be undone.`)) {
            router.delete(route('admin.members.destroy', member.id));
        }
    };

    // Filter members based on search and status
    const filteredMembers = (members || []).filter(member => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            (member.name || '').toLowerCase().includes(query) ||
            (member.email || '').toLowerCase().includes(query) ||
            (member.phone || '').toLowerCase().includes(query) ||
            (member.bds_registration_number && member.bds_registration_number.toLowerCase().includes(query)) ||
            (member.clinic_name && member.clinic_name.toLowerCase().includes(query)) ||
            (member.member_id && member.member_id.toLowerCase().includes(query));

        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="badge-status badge-approved">Approved</span>;
            case 'rejected': return <span className="badge-status badge-rejected">Rejected</span>;
            default: return <span className="badge-status badge-pending">Pending</span>;
        }
    };

    const getTypeBadge = (member) => {
        const docType = typeof member === 'object' && member !== null ? member.doctor_type : null;
        if (docType === 'MBBS') {
            return <span className="badge-status badge-treatment" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#0284c7', color: '#ffffff', whiteSpace: 'nowrap', display: 'inline-block', lineHeight: '1.2' }}>👨‍⚕️ MBBS Doctor</span>;
        }
        if (docType === 'BDS' || (typeof member === 'object' && member?.bds_registration_number)) {
            return <span className="badge-status badge-treatment" style={{ fontSize: '10px', padding: '2px 6px', whiteSpace: 'nowrap', display: 'inline-block', lineHeight: '1.2' }}>👨‍⚕️ BDS Doctor</span>;
        }
        return <span className="badge-status badge-treatment" style={{ fontSize: '10px', padding: '2px 6px', whiteSpace: 'nowrap', display: 'inline-block', lineHeight: '1.2' }}>👨‍⚕️ Doctor</span>;
    };

    const getReferralStatusBadge = (status) => {
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
        return <span className={`badge-status ${classNames[status] || 'badge-new'}`}>{labels[status] || status}</span>;
    };

    const getCommStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="badge-status badge-approved">Paid</span>;
            case 'pending': return <span className="badge-status badge-pending">Pending</span>;
            default: return <span className="badge-status badge-outline" style={{ color: 'var(--text-muted)' }}>None</span>;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <AdminLayout title="Membership Management">
            <Head title="Membership Management" />

            {/* Filter Panel */}
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', width: '100%', marginBottom: '12px', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email, clinic, reg no or member ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    
                    <select 
                        className="form-control"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ minWidth: '160px' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Showing {filteredMembers.length} of {members.length} members
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="glass-panel hidden-mobile" style={{ padding: '0px' }}>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name & Role</th>
                                <th>Email / Phone</th>
                                <th>Reg. No.</th>
                                <th>Clinic Details</th>
                                <th>Member ID</th>
                                <th>Referrals</th>
                                <th>Commission</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => {
                                    const refCount = (member.referrals || []).length;

                                    return (
                                        <tr key={member.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {member.avatar_url ? (
                                                        <img 
                                                            src={member.avatar_url} 
                                                            alt={member.name} 
                                                            onClick={() => setSelectedImageModal({ url: member.avatar_url, title: member.bds_registration_number ? `Dr. ${member.name}` : member.name, memberId: member.member_id })}
                                                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal, #0d9488)', flexShrink: 0, cursor: 'pointer', transition: 'transform 0.15s ease' }} 
                                                            title="Click to view enlarged profile photo"
                                                            className="hover-scale-avatar"
                                                        />
                                                    ) : (
                                                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                                                            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '13px' }}>
                                                            {member.bds_registration_number ? `Dr. ${member.name}` : member.name}
                                                        </div>
                                                        <div style={{ marginTop: '3px' }}>
                                                            {getTypeBadge(member)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email || 'N/A'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {member.phone || 'N/A'}
                                                    {member.whatsapp_number && (
                                                        <span style={{ display: 'block', fontSize: '10px', color: '#10b981' }}>
                                                            💬 WA: {member.whatsapp_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <code style={{ background: 'var(--bg-main)', padding: '2px 5px', borderRadius: '4px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                    {member.bds_registration_number || 'N/A'}
                                                </code>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', fontSize: '12px' }}>{member.clinic_name || 'N/A'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                                                    {member.address || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: '700', color: 'var(--accent-gold)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                    {member.member_id || 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedMemberForReferrals(member)}
                                                    className="btn btn-outline"
                                                    style={{
                                                        padding: '3px 8px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        borderRadius: '20px',
                                                        whiteSpace: 'nowrap',
                                                        borderColor: refCount > 0 ? 'var(--accent-teal)' : 'var(--border-color)',
                                                        color: refCount > 0 ? 'var(--accent-teal)' : 'var(--text-muted)',
                                                        backgroundColor: refCount > 0 ? 'rgba(13, 148, 136, 0.08)' : 'transparent'
                                                    }}
                                                    title="Click to view referral records"
                                                >
                                                    📋 {refCount} {refCount === 1 ? 'Record' : 'Records'}
                                                </button>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                                    {member.is_commission_applicable ? (
                                                        <span className="badge-status badge-approved" style={{ fontSize: '9px', padding: '1px 6px' }}>
                                                            Applicable
                                                        </span>
                                                    ) : (
                                                        <span className="badge-status badge-outline" style={{ fontSize: '9px', padding: '1px 6px', color: 'var(--text-muted)' }}>
                                                            Not Applicable
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenCommissionModal(member)}
                                                        className="btn btn-outline"
                                                        style={{ padding: '1px 5px', fontSize: '10px', borderRadius: '4px' }}
                                                        title="Edit Commission & Account Note"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                                {member.commission_note && (
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '140px', wordBreak: 'break-word', fontStyle: 'italic' }}>
                                                        📝 {member.commission_note}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{getStatusBadge(member.status)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    {member.status === 'pending' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(member.id)} 
                                                                className="btn btn-secondary"
                                                                style={{ padding: '5px 10px', fontSize: '12px' }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(member.id)} 
                                                                className="btn btn-outline"
                                                                style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSelectedMemberForReferrals(member)}
                                                            className="btn btn-outline"
                                                            style={{ padding: '4px 10px', fontSize: '11px' }}
                                                        >
                                                            View Referrals
                                                        </button>
                                                    )}
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDelete(member)}
                                                        className="btn btn-outline"
                                                        style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                                                        title="Delete Member Account"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        No members found matching your search or filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="visible-mobile" style={{ flexDirection: 'column', gap: '12px' }}>
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => {
                        const refCount = (member.referrals || []).length;

                        return (
                            <div key={member.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {member.avatar_url ? (
                                            <img 
                                                src={member.avatar_url} 
                                                alt={member.name} 
                                                onClick={() => setSelectedImageModal({ url: member.avatar_url, title: member.bds_registration_number ? `Dr. ${member.name}` : member.name, memberId: member.member_id })}
                                                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal, #0d9488)', flexShrink: 0, cursor: 'pointer' }} 
                                                title="Click to view enlarged profile photo"
                                            />
                                        ) : (
                                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', flexShrink: 0 }}>
                                                {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '15px' }}>
                                                {member.bds_registration_number ? `Dr. ${member.name}` : member.name}
                                            </div>
                                            <div style={{ marginTop: '4px' }}>
                                                {getTypeBadge(member)}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(member.status)}
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Contact</span>
                                        <div style={{ fontWeight: '600', wordBreak: 'break-all' }}>{member.email || 'N/A'}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>{member.phone || 'N/A'}</div>
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reg No.</span>
                                        <code style={{ fontSize: '11px' }}>{member.bds_registration_number || 'N/A'}</code>
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Clinic Details</span>
                                        <div style={{ fontWeight: '600' }}>{member.clinic_name || 'N/A'}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{member.address || 'N/A'}</div>
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Member ID</span>
                                        <span style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{member.member_id || 'Pending'}</span>
                                    </div>

                                    <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Commission</span>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenCommissionModal(member)}
                                                style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                        </div>
                                        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            {member.is_commission_applicable ? (
                                                <span className="badge-status badge-approved" style={{ fontSize: '10px', padding: '1px 6px' }}>Applicable</span>
                                            ) : (
                                                <span className="badge-status badge-outline" style={{ fontSize: '10px', padding: '1px 6px', color: 'var(--text-muted)' }}>Not Applicable</span>
                                            )}
                                            {member.commission_note && (
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>({member.commission_note})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMemberForReferrals(member)}
                                        className="btn btn-outline"
                                        style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700' }}
                                    >
                                        📋 View Referrals ({refCount})
                                    </button>

                                    {member.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(member.id)} 
                                                className="btn btn-secondary"
                                                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleReject(member.id)} 
                                                className="btn btn-outline"
                                                style={{ flex: 1, padding: '8px', fontSize: '12px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(member)}
                                        className="btn btn-outline"
                                        style={{ padding: '8px 12px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                                        title="Delete Member Account"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No members found matching your search or filters.
                    </div>
                )}
            </div>

            {/* Member Referrals Modal */}
            {selectedMemberForReferrals && (
                <div className="modal-wrapper" onClick={() => setSelectedMemberForReferrals(null)}>
                    <div 
                        className="glass-panel modal-card" 
                        style={{ maxWidth: '850px', width: '95%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📋 Patient Referral Records
                                </h3>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Member: <strong style={{ color: 'var(--text-main)' }}>{selectedMemberForReferrals.bds_registration_number ? `Dr. ${selectedMemberForReferrals.name}` : selectedMemberForReferrals.name}</strong> 
                                    {selectedMemberForReferrals.member_id ? ` (ID: ${selectedMemberForReferrals.member_id})` : ''}
                                    {selectedMemberForReferrals.clinic_name ? ` • 🏥 ${selectedMemberForReferrals.clinic_name}` : ''}
                                </div>
                            </div>

                            <button 
                                type="button" 
                                onClick={() => setSelectedMemberForReferrals(null)}
                                className="btn btn-outline"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                                ✕ Close
                            </button>
                        </div>

                        {/* Member Summary Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Referrals</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-teal)' }}>
                                    {(selectedMemberForReferrals.referrals || []).length} Cases
                                </span>
                            </div>

                            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Completed / Active</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }}>
                                    {(selectedMemberForReferrals.referrals || []).filter(r => r.status === 'completed' || r.status === 'under_treatment').length} Cases
                                </span>
                            </div>

                            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Commission</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                                    ${(selectedMemberForReferrals.referrals || []).reduce((acc, r) => acc + (parseFloat(r.commission_amount) || 0), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Referral List Table */}
                        <div className="table-container" style={{ marginBottom: '20px' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient Info</th>
                                        <th>Condition & Urgency</th>
                                        <th>Submission Date</th>
                                        <th>Case Status</th>
                                        <th>Commission</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedMemberForReferrals.referrals || []).length > 0 ? (
                                        selectedMemberForReferrals.referrals.map(ref => (
                                            <tr key={ref.id}>
                                                <td>
                                                    <div style={{ fontWeight: '700' }}>{ref.patient_name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {ref.phone}</div>
                                                    {ref.patient_address && (
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {ref.patient_address}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{ref.medical_condition}"</div>
                                                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: ref.urgency_level === 'critical' || ref.urgency_level === 'high' ? 'var(--color-danger)' : 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                                        {ref.urgency_level} urgency
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '12px' }}>{formatDate(ref.created_at)}</div>
                                                </td>
                                                <td>
                                                    {getReferralStatusBadge(ref.status)}
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '700' }}>${parseFloat(ref.commission_amount || 0).toFixed(2)}</div>
                                                    <div style={{ marginTop: '2px' }}>{getCommStatusBadge(ref.commission_status)}</div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                No referral records submitted by this member yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal Footer Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link 
                                href={route('admin.referrals')}
                                className="btn btn-outline"
                                style={{ fontSize: '12px' }}
                            >
                                🔗 Open Full Referrals Manager
                            </Link>

                            <button 
                                type="button"
                                onClick={() => setSelectedMemberForReferrals(null)}
                                className="btn btn-primary"
                                style={{ padding: '8px 20px', fontSize: '13px' }}
                            >
                                Close Modal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Commission Settings Modal */}
            {selectedMemberForCommission && (
                <div className="modal-wrapper" onClick={() => setSelectedMemberForCommission(null)}>
                    <div 
                        className="glass-panel modal-card" 
                        style={{ maxWidth: '500px', width: '95%', padding: '24px' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                                💼 Commission Settings
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setSelectedMemberForCommission(null)}
                                className="btn btn-outline"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                                ✕ Close
                            </button>
                        </div>

                        <form onSubmit={handleSaveCommission}>
                            <div style={{ marginBottom: '16px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                                    {selectedMemberForCommission.bds_registration_number ? `Dr. ${selectedMemberForCommission.name}` : selectedMemberForCommission.name} {selectedMemberForCommission.member_id ? `(${selectedMemberForCommission.member_id})` : ''}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {selectedMemberForCommission.email || 'No email'} • {selectedMemberForCommission.phone || 'No phone'}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                    Commission Status
                                </label>
                                <select 
                                    className="form-control"
                                    value={commissionApplicable ? '1' : '0'}
                                    onChange={e => setCommissionApplicable(e.target.value === '1')}
                                >
                                    <option value="0">Not Applicable (Default)</option>
                                    <option value="1">Applicable</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', margin: 0 }}>
                                        Account Details / Short Note
                                    </label>
                                    <span style={{ fontSize: '11px', color: commissionNote.length >= 90 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                        {commissionNote.length}/100 chars
                                    </span>
                                </div>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    maxLength={100}
                                    placeholder="Enter bank detail, payment note, or account info (max 100 chars)..."
                                    value={commissionNote}
                                    onChange={e => setCommissionNote(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button 
                                    type="button"
                                    onClick={() => setSelectedMemberForCommission(null)}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 16px', fontSize: '13px' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ padding: '8px 20px', fontSize: '13px' }}
                                >
                                    Save Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Image Popup Modal */}
            {selectedImageModal && (
                <div 
                    className="modal-backdrop" 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        backgroundColor: 'rgba(0, 0, 0, 0.82)', 
                        backdropFilter: 'blur(6px)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 2000,
                        padding: '16px'
                    }}
                    onClick={() => setSelectedImageModal(null)}
                >
                    <div 
                        className="glass-panel" 
                        style={{ 
                            maxWidth: '440px', 
                            width: '100%', 
                            padding: '20px', 
                            borderRadius: '16px', 
                            position: 'relative',
                            textAlign: 'center',
                            boxShadow: '0 20px 30px rgba(0,0,0,0.6)',
                            animation: 'fadeIn 0.2s ease-in-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            type="button" 
                            onClick={() => setSelectedImageModal(null)}
                            style={{ 
                                position: 'absolute', 
                                top: '12px', 
                                right: '14px', 
                                background: 'rgba(255, 255, 255, 0.1)', 
                                border: 'none', 
                                borderRadius: '50%', 
                                width: '32px', 
                                height: '32px', 
                                color: 'var(--text-color, #ffffff)', 
                                fontSize: '16px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Close"
                        >
                            ✕
                        </button>
                        
                        <div style={{ marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--accent-teal, #0d9488)' }}>
                                {selectedImageModal.title}
                            </h3>
                            {selectedImageModal.memberId && (
                                <div style={{ fontSize: '12px', color: 'var(--accent-gold, #f59e0b)', fontWeight: '700' }}>
                                    Member ID: {selectedImageModal.memberId}
                                </div>
                            )}
                        </div>

                        <div style={{ width: '100%', maxHeight: '420px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                                src={selectedImageModal.url} 
                                alt={selectedImageModal.title} 
                                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px' }} 
                            />
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <button 
                                type="button" 
                                className="btn btn-outline" 
                                style={{ padding: '7px 24px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}
                                onClick={() => setSelectedImageModal(null)}
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
