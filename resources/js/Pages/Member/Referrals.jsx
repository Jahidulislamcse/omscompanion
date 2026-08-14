import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';

export default function Referrals({ referrals = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

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
            onSuccess: () => {
                reset();
                alert('Referral submitted successfully!');
            }
        });
    };

    
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
        const key = status || 'new';
        return <span className={`badge-status ${classNames[key] || 'badge-new'}`}>{labels[key] || key}</span>;
    };

    const safeReferrals = Array.isArray(referrals) ? referrals : [];

    const filteredReferrals = safeReferrals.filter(ref => {
        if (!ref) return false;
        const query = (searchTerm || '').toLowerCase();
        const patientName = (ref.patient_name || '').toLowerCase();
        const phone = ref.phone || '';
        const condition = (ref.medical_condition || '').toLowerCase();
        return (
            patientName.includes(query) ||
            phone.includes(query) ||
            condition.includes(query)
        );
    });

    return (
        <MemberLayout title="Patient Referral Management">
            <Head title="Patient Referral Form" />

            <div className="grid-responsive-form-history">
                
                {/* Submit Form Card */}
                <div className="glass-panel">
                    <h3 style={{ marginBottom: '20px' }}>Patient Referral Form</h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="patient_name">Patient Name</label>
                            <input 
                                type="text"
                                id="patient_name"
                                className="form-control"
                                value={data.patient_name}
                                onChange={e => setData('patient_name', e.target.value)}
                                required
                            />
                            {errors.patient_name && <span className="form-error">{errors.patient_name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="phone">Phone Number</label>
                            <input 
                                type="text"
                                id="phone"
                                className="form-control"
                                placeholder="e.g. +88017XXXXXXXX"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                required
                            />
                            {errors.phone && <span className="form-error">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="medical_condition">Medical Condition</label>
                            <input 
                                type="text"
                                id="medical_condition"
                                className="form-control"
                                placeholder="e.g. Impacted Wisdom Tooth Extraction, Root Canal"
                                value={data.medical_condition}
                                onChange={e => setData('medical_condition', e.target.value)}
                                required
                            />
                            {errors.medical_condition && <span className="form-error">{errors.medical_condition}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="urgency_level">Urgency Level</label>
                            <select
                                id="urgency_level"
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
                            {errors.urgency_level && <span className="form-error">{errors.urgency_level}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="additional_notes">Additional Notes</label>
                            <textarea 
                                id="additional_notes"
                                className="form-control"
                                placeholder="Medical history, references, or preferred schedules..."
                                value={data.additional_notes}
                                onChange={e => setData('additional_notes', e.target.value)}
                                rows="3"
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                            />
                            {errors.additional_notes && <span className="form-error">{errors.additional_notes}</span>}
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={processing}>
                            {processing ? 'Submitting Referral...' : 'Submit Patient Referral'}
                        </button>
                    </form>
                </div>

                {/* History List Card */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0 }}>Referral History</h3>
                        <div style={{ width: '220px', maxWidth: '100%' }}>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Filter history..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '13px' }}
                            />
                        </div>
                    </div>

                    <div className="table-container hidden-mobile">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Condition</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReferrals.length > 0 ? (
                                    filteredReferrals.map(ref => (
                                        <tr key={ref.id}>
                                            <td>
                                                <div style={{ fontWeight: '700' }}>{ref.patient_name || 'N/A'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ref.phone || ''}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{ref.medical_condition || ''}"</div>
                                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: ref.urgency_level === 'critical' || ref.urgency_level === 'high' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                                    {ref.urgency_level || 'low'}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(ref.status)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <Link 
                                                    href={route('member.referrals.tracker', ref.id)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                >
                                                    Track Case
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                            No referral history records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards view */}
                    <div className="visible-mobile" style={{ display: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredReferrals.length > 0 ? (
                                filteredReferrals.map(ref => (
                                    <div key={ref.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '15px' }}>{ref.patient_name || 'N/A'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ref.phone || ''}</div>
                                            </div>
                                            <div>
                                                {getStatusBadge(ref.status)}
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                                            <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{ref.medical_condition || ''}"</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                                <span style={{ 
                                                    fontSize: '10px', 
                                                    fontWeight: 'bold', 
                                                    textTransform: 'uppercase', 
                                                    color: ref.urgency_level === 'critical' || ref.urgency_level === 'high' ? 'var(--color-danger)' : 'var(--text-muted)' 
                                                }}>
                                                    {ref.urgency_level || 'low'} urgency
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '4px' }}>
                                            <Link 
                                                href={route('member.referrals.tracker', ref.id)}
                                                className="btn btn-outline"
                                                style={{ padding: '8px 12px', fontSize: '13px', width: '100%', display: 'block', textAlign: 'center' }}
                                            >
                                                Track Case
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No referral history records found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </MemberLayout>
    );
}
