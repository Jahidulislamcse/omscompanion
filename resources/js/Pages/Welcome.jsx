import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({ freeVideos }) {
    const { auth } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);

    const getDashboardRoute = () => {
        if (!auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="landing-wrapper">
            <Head title="DentistChamber - Referral & Membership Hub" />

            {/* Header Navigation */}
            <header className="glass-panel landing-header">
                <div className="landing-logo">
                    <span>&#128715;</span>
                    <div>Dentist<span>Chamber</span></div>
                </div>

                <nav className="landing-nav">
                    <a href="#mission">Our Mission</a>
                    <a href="#free-videos">Free Videos</a>
                    
                    {auth.user ? (
                        <Link href={getDashboardRoute()} className="btn btn-primary nav-btn">
                            Dashboard →
                        </Link>
                    ) : (
                        <div className="landing-auth-buttons">
                            <Link href={route('login')} className="btn btn-outline nav-btn">
                                Login
                            </Link>
                            <Link href={route('register')} className="btn btn-primary nav-btn">
                                Join Network
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <span className="badge-status badge-new hero-badge">
                    ⭐ Exclusive BDS Doctor Network
                </span>
                
                <h1 className="landing-hero-title">
                    Bridging Dental Practices for <span>Premium Patient Care</span>
                </h1>
                
                <p className="landing-hero-desc">
                    DentistChamber is a professional referral and membership hub connecting BDS Doctors with state-of-the-art treatment pipelines, live tracking logs, and expert clinical videos.
                </p>

                <div className="landing-hero-ctas">
                    {auth.user ? (
                        <Link href={getDashboardRoute()} className="btn btn-secondary hero-btn">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={route('register')} className="btn btn-secondary hero-btn">
                                Apply for Membership
                            </Link>
                            <a href="#free-videos" className="btn btn-outline hero-btn">
                                Watch Preview Videos
                            </a>
                        </>
                    )}
                </div>
            </section>

            {/* Goals & Mission Section */}
            <section id="mission" className="landing-section mission-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <h2 className="landing-section-title">Our Mission & Goals</h2>
                        <p className="landing-section-subtitle">
                            We aim to cultivate a collaborative dental ecosystem that ensures patients receive optimal treatment while doctors receive complete status tracking and rewards.
                        </p>
                    </div>

                    <div className="dashboard-grid">
                        <div className="glass-panel goal-card">
                            <span className="goal-icon">📋</span>
                            <h3 className="goal-title">Seamless Patient Referrals</h3>
                            <p className="goal-desc">
                                BDS members can refer patients with detailed clinical notes and urgency levels in a few simple taps.
                            </p>
                        </div>

                        <div className="glass-panel goal-card">
                            <span className="goal-icon">🛰️</span>
                            <h3 className="goal-title">Live Treatment Tracking</h3>
                            <p className="goal-desc">
                                Check status changes (Contacted, Under Treatment, Completed) live via our interactive chronological status timeline tracker.
                            </p>
                        </div>

                        <div className="glass-panel goal-card">
                            <span className="goal-icon">🎓</span>
                            <h3 className="goal-title">Premium Clinical Library</h3>
                            <p className="goal-desc">
                                Gain exclusive access to secure, masterclass surgical streams, tutorial tutorials, and premium learning guides.
                            </p>
                        </div>

                        <div className="glass-panel goal-card">
                            <span className="goal-icon">📜</span>
                            <h3 className="goal-title">Verified Digital Certificates</h3>
                            <p className="goal-desc">
                                Download verified, high-quality digital membership certificates automatically generated with your clinic credentials.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Free Videos Section */}
            <section id="free-videos" className="landing-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <h2 className="landing-section-title">Free Preview Videos</h2>
                        <p className="landing-section-subtitle">
                            Browse some sample videos showing what clinical education guides and system walks are in store for approved members.
                        </p>
                    </div>

                    <div className="video-grid free-video-grid">
                        {freeVideos.map(vid => (
                            <div key={vid.id} className="glass-panel video-card">
                                <div 
                                    onClick={() => setActiveVideo(vid)}
                                    className="video-thumbnail free-video-thumb"
                                >
                                    <span className="play-icon">▶</span>
                                    <span className="play-label">Watch Preview</span>
                                    <span className="video-duration">{formatDuration(vid.duration)}</span>
                                </div>

                                <div className="video-info free-video-info">
                                    <span className="video-tag">Free Preview</span>
                                    <h4 className="video-title">{vid.title}</h4>
                                    <p className="video-desc">{vid.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Player Modal */}
            {activeVideo && (
                <div className="modal-wrapper">
                    <div className="glass-panel modal-card">
                        <div className="modal-header">
                            <h3>{activeVideo.title}</h3>
                            <button onClick={() => setActiveVideo(null)} className="btn btn-outline close-btn">
                                Close ✕
                            </button>
                        </div>
                        <div className="modal-video-frame">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={activeVideo.embed_url} 
                                title={activeVideo.title}
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-logo">
                        <span>&#128715;</span>
                        <div>Dentist<span>Chamber</span></div>
                    </div>
                    <p>
                        © 2026 DentistChamber Association. All Rights Reserved. BDS Practitioner Referral & Learning Network.
                    </p>
                </div>
            </footer>
        </div>
    );
}
