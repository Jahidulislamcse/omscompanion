import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import PublicNavbar from '@/Components/PublicNavbar';

export default function DownloadApp() {
    const { site_name } = usePage().props;
    const [downloading, setDownloading] = useState(false);

    const handleDownload = () => {
        setDownloading(true);
        setTimeout(() => setDownloading(false), 4000);
    };

    return (
        <div className="landing-wrapper page-colorful-theme" style={{ backgroundColor: '#0f172a', color: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
            <Head title={`Download Mobile App - ${site_name || 'OMSCOMPANION'}`} />

            {/* Top Navigation Bar */}
            <PublicNavbar activePage="app_download" />

            <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-cyan-400 text-sm font-semibold mb-6"
                        style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#22d3ee" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                            <path d="M17.523 15.3414C17.06 15.3414 16.691 14.9724 16.691 14.5094C16.691 14.0464 17.06 13.6774 17.523 13.6774C17.986 13.6774 18.355 14.0464 18.355 14.5094C18.355 14.9724 17.986 15.3414 17.523 15.3414ZM6.477 15.3414C6.014 15.3414 5.645 14.9724 5.645 14.5094C5.645 14.0464 6.014 13.6774 6.477 13.6774C6.94 13.6774 7.309 14.0464 7.309 14.5094C7.309 14.9724 6.94 15.3414 6.477 15.3414ZM17.94 10.4284L19.467 7.7834C19.615 7.5274 19.527 7.2004 19.271 7.0524C19.015 6.9044 18.688 6.9924 18.54 7.2484L16.98 9.9494C15.485 9.2674 13.805 8.8784 12 8.8784C10.195 8.8784 8.515 9.2674 7.02 9.9494L5.46 7.2484C5.312 6.9924 4.985 6.9044 4.729 7.0524C4.473 7.2004 4.385 7.5274 4.533 7.7834L6.06 10.4284C2.628 12.2944 0.285 15.7484 0 19.8244H24C23.715 15.7484 21.372 12.2944 17.94 10.4284Z" />
                        </svg>
                        Official Android Mobile App v1.0
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        OMS Companion Mobile App
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
                        Stay connected with real-time push notifications for patient referrals, clinical updates, video post announcements, and account approvals directly on your Android phone.
                    </p>

                    {/* Main Download CTA Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="/download-apk-file"
                            onClick={handleDownload}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>{downloading ? 'Downloading APK...' : 'Download Android App (APK)'}</span>
                        </a>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                        Direct Download &bull; Android 5.0+ Supported &bull; Free & Safe
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Instant Push Notifications</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Receive real-time sound and vibration alerts when your referred patient status changes or when new announcements are released.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Referral & Case Tracker</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Easily refer patients, track appointment updates, view treatment status, and manage doctor communications on the go.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Clinical Video Archive</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Stream high-definition clinical procedure videos, surgical technique guides, and educational materials anytime, anywhere.
                        </p>
                    </div>
                </div>

                {/* Installation Guide */}
                <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 text-base font-extrabold">?</span>
                        How to Install on Your Android Device
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">1</div>
                            <div>
                                <h4 className="text-white font-semibold text-base mb-1">Download the APK File</h4>
                                <p className="text-slate-400 text-sm">
                                    Click the <strong>Download Android App (APK)</strong> button above to download <code className="text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">omscompanion.apk</code> to your phone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">2</div>
                            <div>
                                <h4 className="text-white font-semibold text-base mb-1">Open Downloaded File</h4>
                                <p className="text-slate-400 text-sm">
                                    Tap on the download notification or open your phone's <strong>Downloads</strong> folder and tap <code className="text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">omscompanion.apk</code>.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">3</div>
                            <div>
                                <h4 className="text-white font-semibold text-base mb-1">Allow Unknown Apps Permission</h4>
                                <p className="text-slate-400 text-sm">
                                    If Android prompts <em>"For your security, your phone is not allowed to install unknown apps"</em>, tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">4</div>
                            <div>
                                <h4 className="text-white font-semibold text-base mb-1">Complete Installation & Login</h4>
                                <p className="text-slate-400 text-sm">
                                    Tap <strong>Install</strong>. Once installed, open <strong>OMS Companion</strong>, log in with your credentials, and allow notification permissions to start receiving instant alerts.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-slate-400">Need help installing or setting up push notifications?</span>
                        <a href="/download-apk-file" className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all">
                            Download APK Again
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
