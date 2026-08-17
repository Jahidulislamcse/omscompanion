import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Members({ members }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'doctors', 'storekeepers'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

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

    // Filter members based on search, type, and status
    const filteredMembers = members.filter(member => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            (member.name || '').toLowerCase().includes(query) ||
            (member.email || '').toLowerCase().includes(query) ||
            (member.phone || '').toLowerCase().includes(query) ||
            (member.bds_registration_number && member.bds_registration_number.toLowerCase().includes(query)) ||
            (member.clinic_name && member.clinic_name.toLowerCase().includes(query));
            
        const isDoctor = !!member.bds_registration_number;
        const matchesType = 
            typeFilter === 'all' || 
            (typeFilter === 'doctors' && isDoctor) || 
            (typeFilter === 'storekeepers' && !isDoctor);

        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
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

    return (
        <AdminLayout title="Membership Management">
            <Head title="Membership Management" />

            {/* Filter Panel */}
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', width: '100%', marginBottom: '12px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email, clinic or BDS reg..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ gridColumn: 'span 1 / -1' }}
                    />
                    
                    <select 
                        className="form-control"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Member Types</option>
                        <option value="doctors">👨‍⚕️ BDS Doctors</option>
                        <option value="storekeepers">🏪 Storekeepers</option>
                    </select>

                    <select 
                        className="form-control"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
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
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => (
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
                    filteredMembers.map((member) => (
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

                            {member.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
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
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No members found matching your search or filters.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
