import React from 'react';
import { usePage, router } from '@inertiajs/react';

export default function ReferPatientButton({ onClick, style = {}, className = '' }) {
    const { auth } = usePage().props;

    const handleClick = (e) => {
        if (e) e.preventDefault();
        if (auth && auth.user) {
            router.visit(auth.user.role === 'admin' ? route('admin.referrals') : route('member.referrals'));
            return;
        }
        if (onClick) {
            onClick(e);
            return;
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-referral-modal'));
        }
    };

    return (
        <button 
            type="button" 
            onClick={handleClick}
            className={`refer-patient-glossy-btn ${className}`}
            aria-label="Refer Patient"
            style={{ padding: '6px 14px 6px 6px', ...style }}
        >
            <div className="refer-patient-icon-circle" style={{ width: '38px', height: '38px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="16" height="17" rx="2" fill="#0891b2" fillOpacity="0.12" stroke="#0e7490" strokeWidth="2"/>
                    <path d="M9 3H15V6H9V3Z" fill="#0891b2" stroke="#0e7490" strokeWidth="1.5"/>
                    <circle cx="12" cy="4.5" r="1" fill="#ffffff"/>
                    <circle cx="12" cy="10.5" r="2" fill="#0e7490"/>
                    <path d="M8.5 15C8.5 13.5 10 13 12 13C14 13 15.5 13.5 15.5 15" stroke="#0e7490" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M12 17.5V20.5M10.5 19H13.5" stroke="#0891b2" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
            </div>
            <span className="refer-patient-text" style={{ fontSize: '17px', fontWeight: '800', margin: '0 18px 0 14px' }}>
                Refer Patient
            </span>
            <div className="refer-patient-arrow-circle" style={{ width: '34px', height: '34px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <polyline points="13 5 20 12 13 19" />
                </svg>
            </div>
        </button>
    );
}
