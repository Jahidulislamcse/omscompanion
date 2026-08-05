import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Members({ members }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleApprove = (userId) => {
        if (confirm('Are you sure you want to approve this doctor membership?')) {
            router.post(route('admin.members.approve', userId));
        }
    };

    const handleReject = (userId) => {
        if (confirm('Are you sure you want to reject this doctor registration?')) {
            router.post(route('admin.members.reject', userId));
        }
    };

    // Filter members based on search
    const filteredMembers = members.filter(member => {
        const query = searchTerm.toLowerCase();
        return (
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query) ||
            (member.bds_registration_number && member.bds_registration_number.toLowerCase().includes(query)) ||
            (member.clinic_name && member.clinic_name.toLowerCase().includes(query))
        );
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="badge-status badge-approved">Approved</span>;
            case 'rejected': return <span className="badge-status badge-rejected">Rejected</span>;
            default: return <span className="badge-status badge-pending">Pending</span>;
        }
    };

    return (
        <AdminLayout title="Membership Management">
            <Head title="Membership Management" />

            {/* Filter Panel */}
            <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
                <div style={{ flexGrow: 1, maxWidth: '400px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email, clinic or BDS registration number..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Showing {filteredMembers.length} of {members.length} registered dentists
                </div>
            </div>

            {/* Table Panel */}
            <div className="glass-panel" style={{ padding: '0px' }}>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email / Phone</th>
                                <th>BDS Registration</th>
                                <th>Clinic Details</th>
                                <th>Member ID</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>{member.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joined {new Date(member.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <div>{member.email}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.phone || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                                {member.bds_registration_number || 'N/A'}
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
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    No actions available
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        No members found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
