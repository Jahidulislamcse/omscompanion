import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function ReferralModal({ isOpen, onClose }) {
    const [referralStep, setReferralStep] = useState('select_type'); // 'select_type' | 'bds_prompt' | 'medicine_shop_form' | 'success'
    const [referralType, setReferralType] = useState(null); // 'bds_doctor' | 'medicine_shop'

    const { 
        data: shopForm, 
        setData: setShopForm, 
        post: postShopReferral, 
        processing: shopProcessing, 
        errors: shopErrors, 
        reset: resetShopForm 
    } = useForm({
        shop_keeper_name: '',
        shop_keeper_phone: '',
        shop_keeper_address: '',
        patient_name: '',
        patient_phone: '',
        patient_address: '',
        medical_condition: '',
    });

    if (!isOpen) return null;

    const handleClose = () => {
        setReferralStep('select_type');
        setReferralType(null);
        resetShopForm();
        if (onClose) onClose();
    };

    const handleShopReferralSubmit = (e) => {
        e.preventDefault();
        postShopReferral(route('guest.referral.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setReferralStep('success');
            }
        });
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', color: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                        📋 Refer a Patient
                    </h3>
                    <button 
                        type="button" 
                        onClick={handleClose} 
                        style={{ background: '#f1f5f9', border: 'none', color: '#64748b', fontSize: '16px', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                    >
                        ✕
                    </button>
                </div>

                {/* STEP 1: SELECT REFERRER TYPE */}
                {referralStep === 'select_type' && (
                    <div>
                        <p style={{ color: '#475569', fontSize: '15px', marginBottom: '22px', textAlign: 'center', fontWeight: '800', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                            SELECT YOUR IDENTITY
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            {/* Option 1: I'm a Doctor */}
                            <div 
                                onClick={() => { setReferralType('bds_doctor'); setReferralStep('bds_prompt'); }}
                                style={{ 
                                    padding: '18px 24px', 
                                    borderRadius: '14px', 
                                    cursor: 'pointer', 
                                    border: '1.5px solid #86efac',
                                    backgroundColor: '#e6f4ea',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    gap: '4px'
                                }}
                            >
                                <h4 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#1e293b' }}>
                                    I’m a Doctor
                                </h4>
                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                                    Registered doctor
                                </span>
                            </div>

                            {/* Option 2: I'm not a Doctor */}
                            <div 
                                onClick={() => { setReferralType('medicine_shop'); setReferralStep('medicine_shop_form'); }}
                                style={{ 
                                    padding: '18px 24px', 
                                    borderRadius: '14px', 
                                    cursor: 'pointer', 
                                    backgroundColor: '#e0e9fa',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    gap: '4px'
                                }}
                            >
                                <h4 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#1e293b' }}>
                                    I’m not a Doctor
                                </h4>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2A: BDS DOCTOR PROMPT */}
                {referralStep === 'bds_prompt' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🩺</div>
                        <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#065f46', marginBottom: '10px' }}>
                            I’m a Doctor
                        </h4>
                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '24px' }}>
                            Please register or login to refer patients directly from your account
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <Link 
                                href={route('login')} 
                                className="btn btn-outline"
                                style={{ padding: '14px', width: '100%', textAlign: 'center', fontWeight: '700', borderRadius: '12px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '15px' }}
                            >
                                🔑 Login
                            </Link>
                            <Link 
                                href={route('register')} 
                                className="btn btn-primary"
                                style={{ padding: '14px', width: '100%', textAlign: 'center', fontWeight: '800', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '12px', border: 'none', fontSize: '15px' }}
                            >
                                🌟 Register now
                            </Link>
                        </div>

                        <button 
                            type="button" 
                            onClick={() => setReferralStep('select_type')} 
                            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', textDecoration: 'none', fontWeight: '600' }}
                        >
                            ← Back to options
                        </button>
                    </div>
                )}

                {/* STEP 2B: MEDICINE SHOP KEEPER FORM */}
                {referralStep === 'medicine_shop_form' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e40af', letterSpacing: '0.5px' }}>
                                REFERRAL DETAILS
                            </h4>
                        </div>

                        <form onSubmit={handleShopReferralSubmit}>
                            {/* Section 1: Medicine Shop Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                                    YOUR DETAILS
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '4px', fontWeight: '600' }}>Your Name *</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="Your Full Name"
                                            value={shopForm.shop_keeper_name}
                                            onChange={e => setShopForm('shop_keeper_name', e.target.value)}
                                            required
                                            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                        />
                                        {shopErrors.shop_keeper_name && <span style={{ color: '#ef4444', fontSize: '11px' }}>{shopErrors.shop_keeper_name}</span>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '4px', fontWeight: '600' }}>Phone Number *</label>
                                        <input 
                                            type="tel" 
                                            className="form-control"
                                            placeholder="017XXXXXXXX"
                                            value={shopForm.shop_keeper_phone}
                                            onChange={e => setShopForm('shop_keeper_phone', e.target.value)}
                                            required
                                            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                        />
                                        {shopErrors.shop_keeper_phone && <span style={{ color: '#ef4444', fontSize: '11px' }}>{shopErrors.shop_keeper_phone}</span>}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '4px', fontWeight: '600' }}>Address (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="Address"
                                        value={shopForm.shop_keeper_address}
                                        onChange={e => setShopForm('shop_keeper_address', e.target.value)}
                                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                    />
                                    {shopErrors.shop_keeper_address && <span style={{ color: '#ef4444', fontSize: '11px' }}>{shopErrors.shop_keeper_address}</span>}
                                </div>
                            </div>

                            {/* Section 2: Patient Details */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                                    🩺 Patient Details
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '4px', fontWeight: '600' }}>Patient Name *</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="Patient Full Name"
                                            value={shopForm.patient_name}
                                            onChange={e => setShopForm('patient_name', e.target.value)}
                                            required
                                            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                        />
                                        {shopErrors.patient_name && <span style={{ color: '#ef4444', fontSize: '11px' }}>{shopErrors.patient_name}</span>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '4px', fontWeight: '600' }}>Patient Phone *</label>
                                        <input 
                                            type="tel" 
                                            className="form-control"
                                            placeholder="018XXXXXXXX"
                                            value={shopForm.patient_phone}
                                            onChange={e => setShopForm('patient_phone', e.target.value)}
                                            required
                                            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                        />
                                        {shopErrors.patient_phone && <span style={{ color: '#ef4444', fontSize: '11px' }}>{shopErrors.patient_phone}</span>}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '4px', fontWeight: '600' }}>Patient Address (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="Patient Address"
                                        value={shopForm.patient_address}
                                        onChange={e => setShopForm('patient_address', e.target.value)}
                                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                    />
                                    {shopErrors.patient_address && <span style={{ color: '#ef4444', fontSize: '11px' }}>{shopErrors.patient_address}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '4px', fontWeight: '600' }}>Patient Problem / Condition *</label>
                                    <textarea 
                                        className="form-control"
                                        rows="2"
                                        placeholder="Describe patient dental condition..."
                                        value={shopForm.medical_condition}
                                        onChange={e => setShopForm('medical_condition', e.target.value)}
                                        required
                                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                    />
                                    {shopErrors.medical_condition && <span style={{ color: '#ef4444', fontSize: '11px' }}>{shopErrors.medical_condition}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setReferralStep('select_type')} 
                                    className="btn btn-outline"
                                    style={{ fontSize: '14px', padding: '10px 18px', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '10px' }}
                                >
                                    ← Back
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={shopProcessing}
                                    style={{ fontSize: '14px', padding: '10px 24px', fontWeight: '800', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                                >
                                    {shopProcessing ? 'Submitting...' : 'Submit Referral 🚀'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* STEP 3: SUCCESS CONFIRMATION */}
                {referralStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
                        <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>
                            Referral Submitted!
                        </h4>
                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '24px' }}>
                            Thank you. Our clinical team will contact the patient soon.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                type="button" 
                                onClick={() => { resetShopForm(); setReferralStep('select_type'); }}
                                className="btn btn-outline"
                                style={{ padding: '10px 20px', fontSize: '14px', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '10px' }}
                            >
                                Refer Another Patient
                            </button>
                            <button 
                                type="button" 
                                onClick={handleClose}
                                className="btn btn-primary"
                                style={{ padding: '10px 28px', fontSize: '14px', fontWeight: '800', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px' }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
