import React, { useState } from 'react';

export default function PasswordInput({ 
    id, 
    name, 
    value, 
    onChange, 
    placeholder = '', 
    className = 'form-control', 
    required = false, 
    autoComplete, 
    style = {},
    disabled = false,
    ...props 
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <input
                type={showPassword ? 'text' : 'password'}
                id={id}
                name={name || id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={className}
                required={required}
                autoComplete={autoComplete}
                disabled={disabled}
                style={{ ...style, paddingRight: '40px' }}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #94a3b8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'color 0.2s ease',
                    zIndex: 2
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main, #0f172a)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'}
            >
                {showPassword ? (
                    /* Eye Off / Hide Password Icon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                ) : (
                    /* Eye / Show Password Icon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                )}
            </button>
        </div>
    );
}
