import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Members({ members = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
    
    // Modal state for viewing member referral records
    const [selectedMemberForReferrals, setSelectedMemberForReferrals] = useState(null);

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

    const getTypeBadge = (bdsReg) => {
        if (bdsReg) {
            return <span className="badge-status badge-treatment" style={{ fontSize: '11px', padding: '2px 8px' }}>👨‍⚕️ BDS Doctor</span>;
        }
        return <span className="badge-status badge-contacted" style={{ fontSize: '11px', padding: '2px 8px' }}>🏪 Storekeeper</span>;
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
                        placeholder="Search by name, email, clinic, BDS reg or member ID..."
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
                                <th>BDS Registration</th>
                                <th>Clinic / Store Details</th>
                                <th>Member ID</th>
                                <th>Referrals Submitted</th>
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
                                                <div style={{ fontWeight: '700' }}>
                                                    {member.bds_registration_number ? `Dr. ${member.name}` : member.name}
                                                </div>
                                                <div style={{ marginTop: '4px' }}>
                                                    {getTypeBadge(member.bds_registration_number)}
                                                </div>
                                            </td>
                                            <td>
                                                <div>{member.email || 'N/A'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.phone || 'N/A'}</div>
                                            </td>
                                            <td>
                                                <code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                                    {member.bds_registration_number || 'N/A (Storekeeper)'}
                                                </code>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{member.clinic_name || 'N/A'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                                    {member.address || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>
                                                    {member.member_id || 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedMemberForReferrals(member)}
                                                    className="btn btn-outline"
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        borderRadius: '20px',
                                                        borderColor: refCount > 0 ? 'var(--accent-teal)' : 'var(--border-color)',
                                                        color: refCount > 0 ? 'var(--accent-teal)' : 'var(--text-muted)',
                                                        backgroundColor: refCount > 0 ? 'rgba(13, 148, 136, 0.08)' : 'transparent'
                                                    }}
                                                    title="Click to view referral records"
                                                >
                                                    📋 {refCount} {refCount === 1 ? 'Record' : 'Records'}
                                                </button>
                                            </td>
                                            <td>{getStatusBadge(member.status)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                {member.status === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => handleApprove(member.id)} 
                                                            className="btn btn-secondary"
                                                            style={{ padding: '6px 12px', fontSize: '12px' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(member.id)} 
                                                            className="btn btn-outline"
                                                            style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
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
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
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
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '15px' }}>
                                            {member.bds_registration_number ? `Dr. ${member.name}` : member.name}
                                        </div>
                                        <div style={{ marginTop: '4px' }}>
                                            {getTypeBadge(member.bds_registration_number)}
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
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>BDS Reg</span>
                                        <code style={{ fontSize: '11px' }}>{member.bds_registration_number || 'N/A (Storekeeper)'}</code>
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Clinic / Store</span>
                                        <div style={{ fontWeight: '600' }}>{member.clinic_name || 'N/A'}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{member.address || 'N/A'}</div>
                                    </div>

                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Member ID</span>
                                        <span style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{member.member_id || 'Pending'}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
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
        </AdminLayout>
    );
}
