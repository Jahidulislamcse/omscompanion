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
    const [videoFilter, setVideoFilter] = useState('all');
    
    // Interactive Simulator state
    const simulatorCases = useMemo(() => [
        {
            id: 'impaction',
            title: 'Surgical Impaction (Lower 3rd Molar)',
            patient: 'Patient #4819 (Age 26)',
            doctor: 'Dr. A. Rahman, BDS',
            urgency: 'High Urgency',
            urgencyColor: 'danger',
            notes: 'Impacted 48 causing pericoronitis. Requires CBCT evaluation and surgical extraction.',
            date: 'Just now'
        },
        {
            id: 'rct',
            title: 'Complex Molar Endodontics',
            patient: 'Patient #3920 (Age 34)',
            doctor: 'Dr. S. Sultana, BDS',
            urgency: 'Medium Urgency',
            urgencyColor: 'warning',
            notes: 'Curved mesial canals on tooth 36. Patient experiencing acute pulpitis.',
            date: '10 mins ago'
        },
        {
            id: 'ortho',
            title: 'Orthodontic Malocclusion Referral',
            patient: 'Patient #5102 (Age 19)',
            doctor: 'Dr. M. K. Alam, BDS',
            urgency: 'Routine',
            urgencyColor: 'info',
            notes: 'Class II Division 1 malocclusion with severe crowding in anterior mandibular region.',
            date: '1 hour ago'
        },
        {
            id: 'implant',
            title: 'Single Tooth Implant Consultation',
            patient: 'Patient #2841 (Age 42)',
            doctor: 'Dr. F. Ahmed, BDS',
            urgency: 'High Urgency',
            urgencyColor: 'danger',
            notes: 'Tooth 21 extracted 3 months ago. Adequate bone volume observed on preliminary X-ray.',
            date: '2 hours ago'
        }
    ], []);

    const [selectedCase, setSelectedCase] = useState(simulatorCases[0]);
    const [simStep, setSimStep] = useState(3); // 1: Submitted, 2: Contacted, 3: Under Treatment, 4: Completed

    // Interactive ROI Calculator state
    const [monthlyReferrals, setMonthlyReferrals] = useState(12);

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
            q: "Are free preview videos accessible without an account?",
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
            <Head title={`${site_name || 'DentistChamber'} - Interactive BDS Referral & Clinical Hub`} />

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
                    <a href="#mission" className="nav-link-item">Mission & Goals</a>
                    <a href="#interactive-simulator" className="nav-link-item badge-pill-nav">Live Simulator ⚡</a>
                    <a href="#roi-calculator" className="nav-link-item">Impact Calculator</a>
                    <a href="#free-videos" className="nav-link-item">Free Videos</a>
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
                                Join Network
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="landing-hero hero-vibrant">
                <div className="hero-badge-container">
                    <span className="badge-status badge-new hero-badge hero-badge-pulse">
                        <span className="pulse-dot"></span> Exclusively for BDS Doctors & Dental Surgeons
                    </span>
                </div>
                
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
                                🌟 Apply for BDS Membership
                            </Link>
                            <a href="#interactive-simulator" className="btn btn-emerald hero-btn">
                                ⚡ Try Live Simulator
                            </a>
                            <a href="#free-videos" className="btn btn-outline hero-btn">
                                🎥 Watch Clinical Previews
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

            {/* Interactive Section 1: Live Referral Simulator */}
            <section id="interactive-simulator" className="landing-section simulator-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-completed section-tag">Interactive Experience</span>
                        <h2 className="landing-section-title">Test the Live Referral Pipeline</h2>
                        <p className="landing-section-subtitle">
                            Experience how seamlessly BDS members send patient referrals and track live treatment milestones step by step.
                        </p>
                    </div>

                    <div className="glass-panel simulator-card">
                        <div className="simulator-case-selector">
                            <label className="simulator-label">Select Sample Referral Case:</label>
                            <div className="case-buttons-grid">
                                {simulatorCases.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedCase(item)}
                                        className={`case-select-btn ${selectedCase.id === item.id ? 'active' : ''}`}
                                    >
                                        <span className="case-btn-icon">🦷</span>
                                        <span className="case-btn-title">{item.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Case Tracker Display */}
                        <div className="simulator-active-case-view">
                            <div className="case-header-bar">
                                <div>
                                    <h4 className="case-heading">{selectedCase.title}</h4>
                                    <div className="case-meta">
                                        <span>👤 {selectedCase.patient}</span>
                                        <span>🩺 Sent by {selectedCase.doctor}</span>
                                        <span>🕒 {selectedCase.date}</span>
                                    </div>
                                </div>
                                <span className={`badge-status badge-${selectedCase.urgencyColor}`}>
                                    {selectedCase.urgency}
                                </span>
                            </div>

                            {/* Interactive Step Switcher */}
                            <div className="simulator-step-controls">
                                <span className="step-control-label">Simulate Progress Stage:</span>
                                <div className="step-buttons">
                                    <button 
                                        onClick={() => setSimStep(1)} 
                                        className={`sim-step-btn ${simStep === 1 ? 'step-active step-submitted' : ''}`}
                                    >
                                        1. Submitted
                                    </button>
                                    <button 
                                        onClick={() => setSimStep(2)} 
                                        className={`sim-step-btn ${simStep === 2 ? 'step-active step-contacted' : ''}`}
                                    >
                                        2. Contacted
                                    </button>
                                    <button 
                                        onClick={() => setSimStep(3)} 
                                        className={`sim-step-btn ${simStep === 3 ? 'step-active step-treatment' : ''}`}
                                    >
                                        3. Under Treatment
                                    </button>
                                    <button 
                                        onClick={() => setSimStep(4)} 
                                        className={`sim-step-btn ${simStep === 4 ? 'step-active step-completed' : ''}`}
                                    >
                                        4. Completed & Verified
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Tracker Progress Bar */}
                            <div className="sim-tracker-pipeline">
                                <div className={`sim-tracker-step ${simStep >= 1 ? 'done' : ''}`}>
                                    <div className="sim-node">1</div>
                                    <span className="sim-node-title">Referral Submitted</span>
                                    <span className="sim-node-sub">Logged by BDS Doctor</span>
                                </div>
                                <div className={`sim-tracker-line ${simStep >= 2 ? 'active' : ''}`} />
                                <div className={`sim-tracker-step ${simStep >= 2 ? 'done' : ''}`}>
                                    <div className="sim-node">2</div>
                                    <span className="sim-node-title">Patient Contacted</span>
                                    <span className="sim-node-sub">Consultation Booked</span>
                                </div>
                                <div className={`sim-tracker-line ${simStep >= 3 ? 'active' : ''}`} />
                                <div className={`sim-tracker-step ${simStep >= 3 ? 'done' : ''}`}>
                                    <div className="sim-node">3</div>
                                    <span className="sim-node-title">Under Treatment</span>
                                    <span className="sim-node-sub">Active Procedure</span>
                                </div>
                                <div className={`sim-tracker-line ${simStep >= 4 ? 'active' : ''}`} />
                                <div className={`sim-tracker-step ${simStep >= 4 ? 'done' : ''}`}>
                                    <div className="sim-node">4</div>
                                    <span className="sim-node-title">Case Completed</span>
                                    <span className="sim-node-sub">Outcome Verified</span>
                                </div>
                            </div>

                            {/* Clinical Notes Box */}
                            <div className="sim-notes-box">
                                <strong>📝 Doctor Notes & Clinical Context:</strong>
                                <p>{selectedCase.notes}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Goals & Mission Section with Color-Coded Cards */}
            <section id="mission" className="landing-section mission-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-new section-tag">Core Ecosystem</span>
                        <h2 className="landing-section-title">Designed for Excellence in Dental Care</h2>
                        <p className="landing-section-subtitle">
                            Every feature in DentistChamber is built to empower BDS practitioners with transparency, learning resources, and clinical collaboration.
                        </p>
                    </div>

                    <div className="dashboard-grid colorful-cards-grid">
                        <div className="glass-panel goal-card goal-emerald hover-glow-emerald">
                            <div className="goal-icon-badge bg-emerald-light">📋</div>
                            <h3 className="goal-title">
                                {getSetting('goal_1_title', 'Seamless Patient Referrals')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_1_desc', 'BDS members can refer patients with detailed clinical notes and urgency levels in a few simple taps.')}
                            </p>
                            <span className="goal-chip chip-emerald">Instant Logging</span>
                        </div>

                        <div className="glass-panel goal-card goal-cyan hover-glow-cyan">
                            <div className="goal-icon-badge bg-cyan-light">🛰️</div>
                            <h3 className="goal-title">
                                {getSetting('goal_2_title', 'Live Treatment Tracking')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_2_desc', 'Check status changes (Contacted, Under Treatment, Completed) live via our interactive chronological status timeline tracker.')}
                            </p>
                            <span className="goal-chip chip-cyan">Real-Time Sync</span>
                        </div>

                        <div className="glass-panel goal-card goal-indigo hover-glow-indigo">
                            <div className="goal-icon-badge bg-indigo-light">🎓</div>
                            <h3 className="goal-title">
                                {getSetting('goal_3_title', 'Premium Clinical Library')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_3_desc', 'Gain exclusive access to secure, masterclass surgical streams, tutorial tutorials, and premium learning guides.')}
                            </p>
                            <span className="goal-chip chip-indigo">HD Video Masterclass</span>
                        </div>

                        <div className="glass-panel goal-card goal-amber hover-glow-amber">
                            <div className="goal-icon-badge bg-amber-light">📜</div>
                            <h3 className="goal-title">
                                {getSetting('goal_4_title', 'Verified Digital Certificates')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_4_desc', 'Download verified, high-quality digital membership certificates automatically generated with your clinic credentials.')}
                            </p>
                            <span className="goal-chip chip-amber">Automated PDF Export</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Section 3: BDS Doctor Impact Calculator */}
            <section id="roi-calculator" className="landing-section calculator-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-booked section-tag">Interactive Calculator</span>
                        <h2 className="landing-section-title">Estimate Your Chamber Practice Impact</h2>
                        <p className="landing-section-subtitle">
                            See how much time and communication friction your dental chamber saves by tracking referrals through DentistChamber.
                        </p>
                    </div>

                    <div className="glass-panel calculator-card">
                        <div className="calculator-slider-box">
                            <div className="slider-header">
                                <label className="slider-label">Monthly Patient Referrals Sent:</label>
                                <span className="slider-value-badge">{monthlyReferrals} Referrals / Month</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="50" 
                                value={monthlyReferrals} 
                                onChange={(e) => setMonthlyReferrals(parseInt(e.target.value))} 
                                className="colorful-slider"
                            />
                            <div className="slider-ticks">
                                <span>1 Case</span>
                                <span>15 Cases</span>
                                <span>30 Cases</span>
                                <span>50 Cases</span>
                            </div>
                        </div>

                        <div className="calculator-results-grid">
                            <div className="calc-result-item result-cyan">
                                <span className="calc-result-number">{(monthlyReferrals * 2.5).toFixed(0)} hrs</span>
                                <span className="calc-result-label">Follow-up Time Saved / Mo</span>
                            </div>

                            <div className="calc-result-item result-emerald">
                                <span className="calc-result-number">100%</span>
                                <span className="calc-result-label">Transparent Status Visibility</span>
                            </div>

                            <div className="calc-result-item result-amber">
                                <span className="calc-result-number">{monthlyReferrals * 150} pts</span>
                                <span className="calc-result-label">Network Milestone Points</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Free Videos Section with Filter Tabs */}
            <section id="free-videos" className="landing-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <span className="badge-status badge-new section-tag">Video Library</span>
                        <h2 className="landing-section-title">Free Preview Video Masterclasses</h2>
                        <p className="landing-section-subtitle">
                            Explore sample clinical guides, surgical technique previews, and platform overviews available for preview.
                        </p>

                        {/* Interactive Filter Tabs */}
                        <div className="video-filter-tabs">
                            <button 
                                onClick={() => setVideoFilter('all')} 
                                className={`filter-tab ${videoFilter === 'all' ? 'active' : ''}`}
                            >
                                All Previews ({freeVideos.length})
                            </button>
                            <button 
                                onClick={() => setVideoFilter('clinical')} 
                                className={`filter-tab ${videoFilter === 'clinical' ? 'active' : ''}`}
                            >
                                💉 Clinical Tutorials
                            </button>
                            <button 
                                onClick={() => setVideoFilter('platform')} 
                                className={`filter-tab ${videoFilter === 'platform' ? 'active' : ''}`}
                            >
                                💻 Platform Guides
                            </button>
                        </div>
                    </div>

                    <div className="video-grid free-video-grid">
                        {filteredVideos.map(vid => {
                            const ytId = getYouTubeId(vid.video_path);
                            return (
                                <div key={vid.id} className="glass-panel video-card colorful-video-card">
                                    <div 
                                        onClick={() => setActiveVideo(vid)}
                                        className="video-thumbnail free-video-thumb"
                                    >
                                        {ytId ? (
                                            <img 
                                                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                alt={vid.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                                            />
                                        ) : null}
                                        <div className="thumb-overlay">
                                            <div className="play-button-glow">
                                                <span className="play-icon">▶</span>
                                            </div>
                                            <span className="play-label">Watch Preview Stream</span>
                                        </div>
                                        <span className="video-duration">{formatDuration(vid.duration)}</span>
                                    </div>

                                    <div className="video-info free-video-info">
                                        <span className="video-tag badge-tag-glow">Free Preview</span>
                                        <h4 className="video-title">{vid.title}</h4>
                                        <p className="video-desc">{vid.description}</p>
                                    </div>
                                </div>
                            );
                        })}
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
                                        Join BDS Network Now
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
