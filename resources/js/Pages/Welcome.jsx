import { useState, useEffect, useMemo } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function Welcome({ settings, freeVideos }) {
    const { auth, site_name } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);
    const [accessBlockedReason, setAccessBlockedReason] = useState(null); // 'unauthenticated' | 'unapproved' | null
    const [simStep, setSimStep] = useState(3); // 1: Submitted, 2: Contacted, 3: Treatment, 4: Completed
    const [videoFilter, setVideoFilter] = useState('all');

    // Interactive FAQ state
    const [openFaq, setOpenFaq] = useState(null);

    // Back to top state
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getDashboardRoute = () => {
        if (!auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'Preview';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getSetting = (key, defaultValue) => {
        return settings && settings[key] ? settings[key] : defaultValue;
    };

    const getVideoSrc = (video) => {
        if (!video) return '';
        if (video.storage_type === 'local') {
            return route('videos.public_stream', { video: video.id });
        }
        
        const url = video.video_path;
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            let videoId = '';
            try {
                if (url.includes('youtube.com/watch')) {
                    const urlParams = new URLSearchParams(new URL(url).search);
                    videoId = urlParams.get('v');
                } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('youtube.com/embed/')[1].split('?')[0];
                }
            } catch (err) {
                console.error("Invalid YouTube URL parsing", err);
            }
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        return url;
    };

    const handleVideoClick = (video) => {
        // Free preview videos require no login
        if (video.is_free) {
            setActiveVideo(video);
            return;
        }
        if (!auth.user) {
            setAccessBlockedReason('unauthenticated');
            return;
        }
        if (auth.user.role !== 'admin' && auth.user.status !== 'approved') {
            setAccessBlockedReason('unapproved');
            return;
        }
        setActiveVideo(video);
    };

    // Filtered videos based on tab selection
    const filteredVideos = useMemo(() => {
        if (videoFilter === 'all') return freeVideos;
        if (videoFilter === 'clinical') {
            return freeVideos.filter(v => v.title.toLowerCase().includes('clinical') || v.title.toLowerCase().includes('tutorial') || v.title.toLowerCase().includes('surgical') || v.description.toLowerCase().includes('clinical'));
        }
        if (videoFilter === 'platform') {
            return freeVideos.filter(v => v.title.toLowerCase().includes('system') || v.title.toLowerCase().includes('overview') || v.title.toLowerCase().includes('referral') || v.description.toLowerCase().includes('pipeline'));
        }
        return freeVideos;
    }, [freeVideos, videoFilter]);

    // FAQ Items
    const faqs = [
        {
            q: "Who can register as a member on DentistChamber?",
            a: "DentistChamber is dedicated specifically for verified BDS (Bachelor of Dental Surgery) Doctors and dental practitioners who wish to refer complex surgical or specialized cases, track live treatment progress, and access clinical video masterclasses."
        },
        {
            q: "How does live case tracking work after submitting a referral?",
            a: "Once a BDS member submits a patient referral, the system logs every milestone chronologically—from initial contact and consultation booking to active treatment and final completion. You can view real-time status updates directly from your member dashboard."
        },
        {
            q: "Are preview videos accessible without an account?",
            a: "Yes! Preview videos on the landing page are open to everyone. However, approved BDS members gain full access to our premium high-definition surgical streams, masterclass tutorials, and downloadable educational guides."
        },
        {
            q: "How do digital membership certificates work?",
            a: "Upon admin approval of your BDS membership, a customized high-resolution digital certificate with your clinic name and membership credentials is automatically generated and available for instant download in PDF format."
        }
    ];

    // Testimonials
    const testimonials = [
        {
            quote: "DentistChamber transformed how our chamber handles surgical impaction referrals. Being able to see patient status updates live gives complete peace of mind.",
            name: "Dr. Farhana Yasmin, BDS",
            role: "General Dental Practitioner",
            location: "Dhaka",
            rating: 5,
            tag: "Verified Member"
        },
        {
            quote: "The clinical video library is top-notch! The surgical walkthroughs are extremely detailed and high definition. A fantastic hub for BDS doctors.",
            name: "Dr. Tanvir Hossain, BDS",
            role: "Dental Surgeon",
            location: "Chittagong",
            rating: 5,
            tag: "Clinical Practitioner"
        },
        {
            quote: "Generating verified digital certificates and tracking case logs seamlessly makes DentistChamber an indispensable tool for modern dental practices.",
            name: "Dr. Noshin Tarannum, BDS",
            role: "Orthodontics Fellow",
            location: "Sylhet",
            rating: 5,
            tag: "Network Partner"
        }
    ];

    return (
        <div className="landing-wrapper page-colorful-theme">
            <Head title={`${site_name || 'DentistChamber'} - BDS Referral & Clinical Hub`} />

            {/* Vibrant Ambient Glow Blobs */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />
            <div className="ambient-glow glow-indigo" />

            {/* Header Navigation */}
            <header className="glass-panel landing-header header-sticky">
                <Link href="/" className="landing-brand-link">
                    <ApplicationLogo />
                </Link>

                <nav className="landing-nav">
                    <Link href="/" className="nav-link-item active-nav-item">Home</Link>
                    <Link href={route('videos.public')} className="nav-link-item">Videos</Link>
                    <a href="#faq" className="nav-link-item">FAQ</a>
                    
                    {auth.user ? (
                        <Link href={getDashboardRoute()} className="btn btn-primary nav-btn btn-glow">
                            Dashboard →
                        </Link>
                    ) : (
                        <div className="landing-auth-buttons">
                            <Link href={route('login')} className="btn btn-outline nav-btn">
                                Login
                            </Link>
                            <Link href={route('register')} className="btn btn-primary nav-btn btn-glow">
                                Registration
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="landing-hero hero-vibrant">
                
                <h1 className="landing-hero-title hero-title-colorful">
                    {getSetting('hero_title', 'Bridging Dental Practices with Live Referral Intelligence')}
                </h1>
                
                <p className="landing-hero-desc">
                    {getSetting('hero_subtitle', `${site_name || 'DentistChamber'} connects BDS Practitioners with automated patient referral pipelines, live status tracking logs, masterclass surgical streams, and verified digital certificates.`)}
                </p>

                <div className="landing-hero-ctas">
                    {auth.user ? (
                        <Link href={getDashboardRoute()} className="btn btn-secondary hero-btn btn-gold-glow">
                            🚀 Go to Your Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={route('register')} className="btn btn-secondary hero-btn btn-gold-glow">
                                🌟 Registration
                            </Link>
                            <a href="#free-videos" className="btn btn-outline hero-btn">
                                🎥 Watch Videos
                            </a>
                        </>
                    )}
                </div>

                {/* Hero Stats Ticker Cards */}
                <div className="hero-stats-ticker">
                    <div className="glass-panel stat-ticker-card stat-cyan">
                        <div className="stat-icon-wrapper">🩺</div>
                        <div className="stat-ticker-info">
                            <span className="stat-ticker-num">500+</span>
                            <span className="stat-ticker-label">BDS Member Doctors</span>
                        </div>
                    </div>

                    <div className="glass-panel stat-ticker-card stat-emerald">
                        <div className="stat-icon-wrapper">📋</div>
                        <div className="stat-ticker-info">
                            <span className="stat-ticker-num">3,400+</span>
                            <span className="stat-ticker-label">Patient Referrals Tracked</span>
                        </div>
                    </div>

                    <div className="glass-panel stat-ticker-card stat-indigo">
                        <div className="stat-icon-wrapper">⚡</div>
                        <div className="stat-ticker-info">
                            <span className="stat-ticker-num">99.8%</span>
                            <span className="stat-ticker-label">Live Status Precision</span>
                        </div>
                    </div>

                    <div className="glass-panel stat-ticker-card stat-amber">
                        <div className="stat-icon-wrapper">🎓</div>
                        <div className="stat-ticker-info">
                            <span className="stat-ticker-num">100%</span>
                            <span className="stat-ticker-label">Verified Certificates</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Patient Referral Status Pipeline Simulation */}
            <section id="status-pipeline" className="landing-section pipeline-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-completed section-tag">Live Status Pipeline</span>
                        <h2 className="landing-section-title">Transparent Patient Referral Workflow</h2>
                        <p className="landing-section-subtitle">
                            Track every stage of your patient's referral journey live with automatic milestone status updates.
                        </p>
                    </div>

                    <div className="glass-panel simple-pipeline-card">
                        <div className="pipeline-header-info">
                            <div>
                                <h4 className="pipeline-demo-title">🦷 Sample Case: Surgical Molar Impaction</h4>
                                <span className="pipeline-demo-sub">Patient #4819 • Referred by Dr. A. Rahman, BDS</span>
                            </div>
                            <span className="badge-status badge-treatment live-pill">
                                <span className="pulse-dot"></span> Live Tracking Active
                            </span>
                        </div>

                        <div className="simple-pipeline-grid">
                            <div 
                                onClick={() => setSimStep(1)} 
                                className={`pipeline-step-box step-box-cyan ${simStep === 1 ? 'active-step' : ''}`}
                            >
                                <div className="step-num-badge">1</div>
                                <span className="badge-status badge-new">1. Submitted</span>
                                <h4 className="step-box-title">Referral Logged</h4>
                                <p className="step-box-desc">Case details, urgency, and clinical notes logged by BDS Doctor.</p>
                            </div>

                            <div 
                                onClick={() => setSimStep(2)} 
                                className={`pipeline-step-box step-box-purple ${simStep === 2 ? 'active-step' : ''}`}
                            >
                                <div className="step-num-badge">2</div>
                                <span className="badge-status badge-contacted">2. Contacted</span>
                                <h4 className="step-box-title">Patient Contacted</h4>
                                <p className="step-box-desc">Consultation slot confirmed with the patient via phone/SMS.</p>
                            </div>

                            <div 
                                onClick={() => setSimStep(3)} 
                                className={`pipeline-step-box step-box-amber ${simStep === 3 ? 'active-step' : ''}`}
                            >
                                <div className="step-num-badge">3</div>
                                <span className="badge-status badge-treatment">3. Treatment</span>
                                <h4 className="step-box-title">Under Treatment</h4>
                                <p className="step-box-desc">Specialized dental procedure or surgery underway.</p>
                            </div>

                            <div 
                                onClick={() => setSimStep(4)} 
                                className={`pipeline-step-box step-box-emerald ${simStep === 4 ? 'active-step' : ''}`}
                            >
                                <div className="step-num-badge">4</div>
                                <span className="badge-status badge-completed">4. Completed</span>
                                <h4 className="step-box-title">Case Completed</h4>
                                <p className="step-box-desc">Procedure verified, outcome notes & status finalized.</p>
                            </div>
                        </div>

                        {/* Dynamic Status Detail Note */}
                        <div className="pipeline-active-note">
                            <span className="note-icon">💡</span>
                            <div>
                                <strong>Stage {simStep} Detail: </strong>
                                {simStep === 1 && "Case submitted directly from chamber dashboard. Urgency level set to High."}
                                {simStep === 2 && "Patient contacted within 2 hours. Consultation scheduled for tomorrow morning."}
                                {simStep === 3 && "Patient currently undergoing procedure under specialist care."}
                                {simStep === 4 && "Procedure successfully completed. Final report and updates sent back to referring BDS Doctor."}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Videos Section */}
            <section id="free-videos" className="landing-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-new section-tag">Video Library</span>
                        <h2 className="landing-section-title">Video Masterclasses</h2>
                        <p className="landing-section-subtitle">
                            Explore clinical guides, surgical technique walkthroughs, and platform overviews.
                        </p>
                    </div>

                    <div className="video-grid free-video-grid">
                        {freeVideos.map(vid => {
                            const ytId = getYouTubeId(vid.video_path);
                            const isLocked = false;

                            return (
                                <div key={vid.id} className="glass-panel video-card colorful-video-card">
                                    <div 
                                        onClick={() => handleVideoClick(vid)}
                                        className="video-thumbnail free-video-thumb"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {ytId ? (
                                            <img 
                                                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                alt={vid.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                                            />
                                        ) : null}
                                        <div className="thumb-overlay">
                                            {isLocked ? (
                                                <>
                                                    <div className="play-button-glow" style={{ background: 'rgba(239, 68, 68, 0.25)', borderColor: '#ef4444' }}>
                                                        <span className="play-icon" style={{ fontSize: '18px' }}>🔒</span>
                                                    </div>
                                                    <span className="play-label" style={{ color: '#fca5a5' }}>
                                                        {!auth.user ? "Register to Unlock" : "Approval Required"}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="play-button-glow">
                                                        <span className="play-icon">▶</span>
                                                    </div>
                                                    <span className="play-label">Watch Video</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="video-duration">{formatDuration(vid.duration)}</span>
                                    </div>

                                    <div className="video-info free-video-info">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span className="video-tag badge-tag-glow">Video Guide</span>
                                            {isLocked && (
                                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                                                    Protected
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="video-title">{vid.title}</h4>
                                        <p className="video-desc">{vid.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* More Videos Button */}
                    <div style={{ textAlign: 'center', marginTop: '36px' }}>
                        <Link href={route('videos.public')} className="btn btn-secondary hero-btn btn-gold-glow">
                            🎬 More Videos →
                        </Link>
                    </div>
                </div>
            </section>

            {/* BDS Doctor Testimonials Section */}
            <section className="landing-section testimonials-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-approved section-tag">Doctor Reviews</span>
                        <h2 className="landing-section-title">Trusted by BDS Practitioners</h2>
                        <p className="landing-section-subtitle">
                            Here is what practicing dentists across the network say about DentistChamber.
                        </p>
                    </div>

                    <div className="dashboard-grid testimonials-grid">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="glass-panel testimonial-card">
                                <div className="testimonial-stars">
                                    {'★'.repeat(t.rating)}
                                </div>
                                <p className="testimonial-quote">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{t.name.charAt(4)}</div>
                                    <div>
                                        <h5 className="author-name">{t.name}</h5>
                                        <span className="author-role">{t.role} • {t.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Section */}
            <section id="faq" className="landing-section faq-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-pending section-tag">Common Questions</span>
                        <h2 className="landing-section-title">Frequently Asked Questions</h2>
                        <p className="landing-section-subtitle">
                            Got questions about joining or sending referrals? We have answers.
                        </p>
                    </div>

                    <div className="faq-accordion-list">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div 
                                    key={index} 
                                    className={`glass-panel faq-item ${isOpen ? 'faq-open' : ''}`}
                                    onClick={() => setOpenFaq(isOpen ? null : index)}
                                >
                                    <div className="faq-question-row">
                                        <h4 className="faq-question">{faq.q}</h4>
                                        <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                                    </div>
                                    {isOpen && (
                                        <div className="faq-answer-row">
                                            <p>{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Access Blocked Modal (Unauthenticated or Unapproved) */}
            {accessBlockedReason && (
                <div className="modal-wrapper" onClick={() => setAccessBlockedReason(null)}>
                    <div className="glass-panel modal-card modal-card-colorful" style={{ maxWidth: '480px', padding: '32px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {accessBlockedReason === 'unauthenticated' ? '🔒' : '⏳'}
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
                            {accessBlockedReason === 'unauthenticated' ? 'Registration Required' : 'Approval Pending'}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                            {accessBlockedReason === 'unauthenticated'
                                ? 'Clinical video masterclasses are strictly reserved for verified BDS Practitioners. Please register or login to your account to watch.'
                                : 'Your BDS Doctor membership is currently pending admin approval. Access to full clinical video streams will unlock as soon as your account is approved.'
                            }
                        </p>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {accessBlockedReason === 'unauthenticated' ? (
                                <>
                                    <Link href={route('register')} className="btn btn-primary hero-btn btn-glow">
                                        🌟 Registration
                                    </Link>
                                    <Link href={route('login')} className="btn btn-outline hero-btn">
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={getDashboardRoute()} className="btn btn-primary hero-btn btn-glow">
                                        Go to Dashboard
                                    </Link>
                                    <button onClick={() => setAccessBlockedReason(null)} className="btn btn-outline hero-btn">
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {activeVideo && (
                <div className="modal-wrapper" onClick={() => setActiveVideo(null)}>
                    <div className="glass-panel modal-card modal-card-colorful" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🎥 {activeVideo.title}</h3>
                            <button onClick={() => setActiveVideo(null)} className="btn btn-outline close-btn">
                                Close ✕
                            </button>
                        </div>
                        <div className="modal-video-frame">
                            {getYouTubeId(activeVideo.video_path) ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(activeVideo.video_path)}?autoplay=1`} 
                                    title={activeVideo.title}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video 
                                    controls 
                                    style={{ width: '100%', height: '100%', backgroundColor: '#000' }} 
                                    controlsList="nodownload" 
                                    onContextMenu={e => e.preventDefault()}
                                    autoPlay
                                >
                                    <source src={getVideoSrc(activeVideo)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Call To Action Banner */}
            <section className="cta-banner-section">
                <div className="landing-section-container">
                    <div className="glass-panel cta-banner-card">
                        <h2 className="cta-title">Ready to Elevate Your Dental Referral Network?</h2>
                        <p className="cta-desc">
                            Join hundreds of BDS Doctors using {site_name || 'DentistChamber'} for transparent referral tracking, clinical video masterclasses, and verified digital certificates.
                        </p>
                        <div className="cta-buttons">
                            {auth.user ? (
                                <Link href={getDashboardRoute()} className="btn btn-secondary hero-btn btn-gold-glow">
                                    Open Your Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="btn btn-secondary hero-btn btn-gold-glow">
                                        Registration
                                    </Link>
                                    <Link href={route('login')} className="btn btn-outline hero-btn">
                                        Member Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <Link href="/" className="landing-brand-link">
                        <ApplicationLogo />
                    </Link>
                    <p>
                        © 2026 {site_name || 'DentistChamber'} Association. All Rights Reserved. BDS Practitioner Referral & Learning Network.
                    </p>
                </div>
            </footer>

            {/* Floating Back-to-Top Button */}
            {showScrollTop && (
                <button 
                    onClick={scrollToTop} 
                    className="floating-back-to-top"
                    title="Back to Top"
                    aria-label="Back to Top"
                >
                    ↑
                </button>
            )}
        </div>
    );
}
