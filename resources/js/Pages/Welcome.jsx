export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

export default function Welcome({ settings, freeVideos }) {
    const { auth } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);

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
        
        // Handle external YouTube URLs for embedding
        const url = video.video_path;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
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
                    {getSetting('hero_title', 'Bridging Dental Practices for Premium Patient Care')}
                </h1>
                
                <p className="landing-hero-desc">
                    {getSetting('hero_subtitle', 'DentistChamber is a professional referral and membership hub connecting BDS Doctors with state-of-the-art treatment pipelines, live tracking logs, and expert clinical videos.')}
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
                            <h3 className="goal-title">
                                {getSetting('goal_1_title', 'Seamless Patient Referrals')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_1_desc', 'BDS members can refer patients with detailed clinical notes and urgency levels in a few simple taps.')}
                            </p>
                        </div>

                        <div className="glass-panel goal-card">
                            <span className="goal-icon">🛰️</span>
                            <h3 className="goal-title">
                                {getSetting('goal_2_title', 'Live Treatment Tracking')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_2_desc', 'Check status changes (Contacted, Under Treatment, Completed) live via our interactive chronological status timeline tracker.')}
                            </p>
                        </div>

                        <div className="glass-panel goal-card">
                            <span className="goal-icon">🎓</span>
                            <h3 className="goal-title">
                                {getSetting('goal_3_title', 'Premium Clinical Library')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_3_desc', 'Gain exclusive access to secure, masterclass surgical streams, tutorial tutorials, and premium learning guides.')}
                            </p>
                        </div>

                        <div className="glass-panel goal-card">
                            <span className="goal-icon">📜</span>
                            <h3 className="goal-title">
                                {getSetting('goal_4_title', 'Verified Digital Certificates')}
                            </h3>
                            <p className="goal-desc">
                                {getSetting('goal_4_desc', 'Download verified, high-quality digital membership certificates automatically generated with your clinic credentials.')}
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
                        {freeVideos.map(vid => {
                            const ytId = getYouTubeId(vid.video_path);
                            return (
                                <div key={vid.id} className="glass-panel video-card">
                                    <div 
                                        onClick={() => setActiveVideo(vid)}
                                        className="video-thumbnail free-video-thumb"
                                        style={{ position: 'relative', overflow: 'hidden' }}
                                    >
                                        {ytId ? (
                                            <img 
                                                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                alt={vid.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                                            />
                                        ) : null}
                                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <span className="play-icon">▶</span>
                                            <span className="play-label">Watch Preview</span>
                                        </div>
                                        <span className="video-duration">{formatDuration(vid.duration)}</span>
                                    </div>

                                    <div className="video-info free-video-info">
                                        <span className="video-tag">Free Preview</span>
                                        <h4 className="video-title">{vid.title}</h4>
                                        <p className="video-desc">{vid.description}</p>
                                    </div>
                                </div>
                            );
                        })}
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
