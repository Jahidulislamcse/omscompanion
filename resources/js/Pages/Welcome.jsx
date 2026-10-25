import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, Head, usePage, useForm, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';
import ReferralModal from '@/Components/ReferralModal';
import FloatingAppInstallWidget from '@/Components/FloatingAppInstallWidget';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

function CategoryVideoGridColumn({ categoryTitle, videos = [], onVideoClick, onLearnMoreClick, theme = 'cyan' }) {
    const categoryVideos = useMemo(() => {
        if (!videos || videos.length === 0) return [];

        const targetCat = categoryTitle.toLowerCase();
        let matches = videos.filter(v => {
            const cName = (v.category_name || '').toLowerCase();
            return (cName.includes('surgical') && targetCat.includes('surgical')) ||
                   (cName.includes('clinical') && targetCat.includes('clinical')) ||
                   cName === targetCat || targetCat.includes(cName);
        });

        if (matches.length === 0) {
            if (targetCat.includes('surgical')) {
                matches = videos.filter(v => 
                    (v.title || '').toLowerCase().includes('surgical') || 
                    (v.description || '').toLowerCase().includes('surgical') ||
                    (v.title || '').toLowerCase().includes('impaction') ||
                    (v.title || '').toLowerCase().includes('bone') ||
                    (v.title || '').toLowerCase().includes('airplane') ||
                    (v.title || '').toLowerCase().includes('molar')
                );
            } else {
                matches = videos.filter(v => 
                    (v.title || '').toLowerCase().includes('clinical') || 
                    (v.description || '').toLowerCase().includes('clinical') ||
                    (v.title || '').toLowerCase().includes('lecture') ||
                    (v.title || '').toLowerCase().includes('anesthesia') ||
                    (v.title || '').toLowerCase().includes('imperial') ||
                    (v.title || '').toLowerCase().includes('tips')
                );
            }
        }

        const list = matches.length > 0 ? matches : videos;
        if (list.length === 0) return [];

        // Ensure exactly 4 videos are displayed in the 2x2 grid
        let result = [...list];
        let i = 0;
        while (result.length < 4) {
            result.push({
                ...list[i % list.length],
                id: `pad-${categoryTitle}-${i}-${result.length}`
            });
            i++;
        }
        return result.slice(0, 4);
    }, [videos, categoryTitle]);

    if (categoryVideos.length === 0) return null;

    const isEmerald = theme === 'emerald';

    return (
        <div className={`category-column-card ${isEmerald ? 'col-theme-emerald' : 'col-theme-cyan'}`}>
            <div className="category-card-header">
                <span className="category-pill-badge">
                    <span className="category-badge-dot"></span>
                    <span>{categoryTitle}</span>
                </span>
            </div>

            <div className="category-videos-2x2-grid">
                {categoryVideos.map((vid, idx) => {
                    const ytId = getYouTubeId(vid.video_path);
                    return (
                        <div 
                            key={vid.id || idx}
                            className="video-grid-item-card"
                            onClick={() => onVideoClick(vid)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="video-thumb-container">
                                {ytId ? (
                                    <img 
                                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                        alt={vid.title} 
                                        className="video-grid-thumb"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="video-fallback-thumb">
                                        <span>{vid.title}</span>
                                    </div>
                                )}

                                <div className="video-thumb-overlay">
                                    <div className="mini-play-glow">
                                        <span className="play-icon">▶</span>
                                    </div>
                                    <span className="play-hover-label">WATCH VIDEO</span>
                                </div>

                                <span className="video-grid-duration">
                                    {vid.duration ? `${Math.floor(vid.duration / 60)}:${String(vid.duration % 60).padStart(2, '0')}` : 'Preview'}
                                </span>
                            </div>

                            <div className="video-grid-meta">
                                <h4 className="video-grid-item-title" title={vid.title}>
                                    {vid.title}
                                </h4>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '8px' }}>
                <button 
                    onClick={() => onLearnMoreClick(categoryVideos[0])}
                    className="learn-more-btn"
                >
                    <span>LEARN MORE</span>
                    <svg className="cursor-hand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 11V3.5C7 2.67157 7.67157 2 8.5 2C9.32843 2 10 2.67157 10 3.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 10.5V5.5C10 4.67157 10.6716 4 11.5 4C12.3284 4 13 4.67157 13 5.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M13 10.5V7.5C13 6.67157 13.6716 6 14.5 6C15.3284 6 16 6.67157 16 7.5V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 11.5V10.5C16 9.67157 16.6716 9 17.5 9C18.3284 9 19 9.67157 19 10.5V16C19 19.3137 16.3137 22 13 22H11C8.23858 22 6 19.7614 6 17V14.5C6 13.6716 6.67157 13 7.5 13C8.32843 13 9 13.6716 9 14.5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function Welcome({ settings, freeVideos, reviews = [], newsItems = [] }) {
    const { auth, site_name } = usePage().props;
    const [activeVideo, setActiveVideo] = useState(null);
    const [accessBlockedReason, setAccessBlockedReason] = useState(null); // 'unauthenticated' | 'unapproved' | null
    const [videoFilter, setVideoFilter] = useState('all');

    // Mobile Horizontal Carousel for Benefits Section
    const benefitsGridRef = useRef(null);
    const [activeBenefitIndex, setActiveBenefitIndex] = useState(0);

    const handleBenefitsScroll = () => {
        const el = benefitsGridRef.current;
        if (!el) return;
        const scrollLeft = el.scrollLeft;
        const firstCard = el.firstElementChild;
        if (!firstCard) return;
        const cardWidth = firstCard.offsetWidth + 16;
        const index = Math.round(scrollLeft / cardWidth);
        setActiveBenefitIndex(Math.min(Math.max(index, 0), 6));
    };

    const scrollToBenefit = (index) => {
        const el = benefitsGridRef.current;
        if (!el || !el.children[index]) return;
        const target = el.children[index];
        const cardLeft = target.offsetLeft - el.offsetLeft;
        const centerOffset = (el.clientWidth - target.offsetWidth) / 2;
        el.scrollTo({
            left: Math.max(0, cardLeft - centerOffset),
            behavior: 'smooth'
        });
        setActiveBenefitIndex(index);
    };

    // Referral System Modal State
    const [referralModalOpen, setReferralModalOpen] = useState(false);

    // Interactive FAQ state
    const [openFaq, setOpenFaq] = useState(null);

    // Share link state
    const [copiedLink, setCopiedLink] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    const handleCopyLink = () => {
        const url = typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2500);
        }
    };

    const handleMessengerShare = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const url = typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com';
        const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            window.location.href = `fb-messenger://share/?link=${encodeURIComponent(url)}`;
            setTimeout(() => {
                window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`, '_blank');
            }, 800);
        } else {
            window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`, '_blank');
        }
    };

    const handleViberShare = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const url = typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com';
        const text = 'Check out OMS Companion - Digital Hub for BDS Doctors & Maxillofacial Practice: ';
        window.location.href = `viber://forward?text=${encodeURIComponent(text + url)}`;
    };

    const handleSocialShare = () => {
        const url = typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com';
        const title = 'OMS Companion';
        const text = 'Check out OMS Companion - Digital Hub for BDS Doctors & Maxillofacial Practice';

        if (navigator.share) {
            navigator.share({ title, text, url }).catch((err) => {
                if (err && err.name !== 'AbortError') {
                    setShareModalOpen(true);
                }
            });
        } else {
            setShareModalOpen(true);
        }
    };

    // Back to top state
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Mobile Navigation state
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);

        // Auto trigger referral modal/redirect if landing with ?referral=open
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('referral') === 'open' || window.location.hash === '#referral') {
                if (auth && auth.user) {
                    router.visit(auth.user.role === 'admin' ? route('admin.referrals') : route('member.referrals'));
                } else {
                    setReferralModalOpen(true);
                }
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [auth]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getDashboardRoute = () => {
        if (!auth.user) return '#';
        return auth.user.role === 'admin' ? route('admin.dashboard') : route('member.dashboard');
    };

    const handleReferralClick = (e) => {
        if (e) e.preventDefault();
        setMobileNavOpen(false);
        if (auth && auth.user) {
            router.visit(auth.user.role === 'admin' ? route('admin.referrals') : route('member.referrals'));
        } else {
            setReferralModalOpen(true);
        }
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
        setActiveVideo(video);
    };

    const handleLearnMoreClick = (video) => {
        if (!auth.user) {
            setAccessBlockedReason('unauthenticated');
        } else {
            router.visit(route('videos.public'));
        }
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
            q: "What is OMS Companion?",
            a: "OMS Companion is a professional learning and clinical support platform designed for dental surgeons, providing expert knowledge, surgical videos, clinical guidance, and a refferal system for complex patients to improve patient management and clinical practice"
        },
        {
            q: "Who can use OMS Companion?",
            a: "OMS Companion is primarily designed for dental surgeons and healthcare professionals interested in Oral & Maxillofacial Surgery, Oral Medicine, oncology, and the management of complex oral and maxillofacial conditions."
        },
        {
            q: "Is OMS Companion worth the membership?",
            a: "If you are serious about improving your clinical knowledge, expanding your surgical understanding, and managing patients with multidisciplinary team, OMS Companion can become a valuable part of your professional development."
        },
        {
            q: "Are the contents suitable for beginners?",
            a: "Yes. Content is designed to be educational and useful for dental surgeons at different stages of their careers, from those developing their surgical skills to experienced practitioners looking to expand their knowledge."
        },
        {
            q: "Can I access OMS Companion from my mobile phone?",
            a: "Yes. OMS Companion is designed to be accessible across devices, including smartphones, tablets, and computers, allowing you to learn conveniently from your clinic, home, or anywhere with an internet connection"
        }
    ];

    // Testimonials resolution (dynamic from props, fallback to defaults)
    const activeTestimonials = useMemo(() => {
        if (reviews && reviews.length > 0) {
            return reviews;
        }
        return [
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
    }, [reviews]);

    // Clinical News Items resolution (dynamic from props, fallback to defaults)
    const activeNewsItems = useMemo(() => {
        if (newsItems && newsItems.length > 0) {
            return newsItems;
        }
        return [
            {
                id: 'default-1',
                badge_text: 'Workshop',
                sub_badge_text: 'Upcoming Training',
                title: 'Advanced Maxillofacial Impaction & Surgical Masterclass',
                description: 'Hands-on surgical training program focusing on complex 3rd molar impactions and piezosurgery techniques for general practitioners.',
                button_text: 'View Related Masterclass Videos →',
                button_url: '/videos',
                button_type: 'outline',
                theme_color: 'indigo',
            },
            {
                id: 'default-2',
                badge_text: 'Clinical Guide',
                sub_badge_text: 'Latest Guidelines',
                title: 'Co-Morbid Patient Management Protocols in Minor Oral Surgery',
                description: 'Updated clinical guidelines for treating medically compromised and diabetic patients safely in chamber setups.',
                button_text: 'Explore Clinical Guides →',
                button_url: '/videos',
                button_type: 'outline',
                theme_color: 'emerald',
            },
            {
                id: 'default-3',
                badge_text: 'Consultation',
                sub_badge_text: 'Live Support',
                title: 'Online Consultation & Multidisciplinary Case Discussions',
                description: 'BDS doctors can now directly request real-time expert opinions and surgical team collaboration via direct WhatsApp desk.',
                button_text: 'Join WhatsApp Consultation 💬',
                button_url: 'whatsapp',
                button_type: 'whatsapp',
                theme_color: 'cyan',
            }
        ];
    }, [newsItems]);

    return (
        <div className="landing-wrapper page-colorful-theme">
            <Head>
                <title>{`${site_name || 'OMS COMPANION'} - oms clinical hub & patient management platform`}</title>
                <meta name="description" content={`${site_name || 'OMS COMPANION'} empowers BDS Doctors with surgical video archives, online consultations, transparent management tracking, and professional Learning.`} />
                <meta property="og:title" content={`${site_name || 'OMS COMPANION'} - oms clinical hub & patient management platform`} />
                <meta property="og:description" content={`${site_name || 'OMS COMPANION'} empowers BDS Doctors with surgical video archives, online consultations, transparent management tracking, and professional Learning.`} />
            </Head>

            {/* Vibrant Ambient Glow Blobs */}
            <div className="ambient-glow glow-cyan" />
            <div className="ambient-glow glow-emerald" />
            <div className="ambient-glow glow-gold" />
            <div className="ambient-glow glow-indigo" />

            {/* Header Navigation */}
            <PublicNavbar activePage="home" onReferralClick={handleReferralClick} />

            {/* Hero Section */}
            <section className="landing-hero hero-vibrant">
                {settings && settings.hero_banner ? (
                    <>
                        <div className="dynamic-banner-wrapper glass-panel" style={{ padding: 0, overflow: 'hidden', width: '100%', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <img 
                                src={`${route('site.banner.stream')}?v=${getSetting('hero_banner_updated_at', Date.now())}`} 
                                alt={getSetting('hero_title', 'Site Banner')} 
                                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '550px', objectFit: 'cover' }}
                            />
                        </div>
                        {getSetting('hero_subtitle') && (
                            <p className="landing-hero-desc" style={{ marginTop: '12px' }}>
                                {getSetting('hero_subtitle')}
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <h1 className="landing-hero-title hero-title-colorful">
                            {getSetting('hero_title', 'Bridging Dental Practices with Live Referral Intelligence')}
                        </h1>
                        
                        <p className="landing-hero-desc">
                            {getSetting('hero_subtitle', `${site_name || 'DentistChamber'} connects BDS Practitioners and Medicine Shop Keepers with automated patient referral pipelines, live status tracking logs, masterclass surgical streams, and verified digital certificates.`)}
                        </p>

                        <div className="landing-hero-ctas">
                            {auth.user ? (
                                <Link href={getDashboardRoute()} className="btn btn-primary hero-btn btn-glow">
                                    🚀 Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="btn btn-primary hero-btn btn-glow">
                                        🌟 Register
                                    </Link>
                                    <Link href={route('videos.public')} className="btn btn-outline hero-btn">
                                        📁 View Archive
                                    </Link>
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
                                <div className="stat-icon-wrapper">💊</div>
                                <div className="stat-ticker-info">
                                    <span className="stat-ticker-num">200+</span>
                                    <span className="stat-ticker-label">Partner Medicine Shops</span>
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
                    </>
                )}
            </section>

            {/* Videos Section */}
            <section id="free-videos" className="landing-section">
                <div className="landing-section-container">
                    {/* Top Archive Pill Button */}
                    <div className="video-archive-pill-wrapper">
                        <Link href={route('videos.public')} className="archive-pill-btn">
                            Archive
                        </Link>
                    </div>

                    {/* Section Header */}
                    <div className="landing-section-header" style={{ marginBottom: '16px' }}>
                        <h2 className="landing-section-title video-masterclasses-title">Video Masterclasses</h2>
                        <p className="landing-section-subtitle video-masterclasses-subtitle">
                            Explore clinical guides, surgical techniques, and practical tips& tricks
                        </p>
                    </div>

                    {/* Two Categories Side-by-Side Grid */}
                    <div className="masterclasses-two-column-grid">
                        {/* Category 1 Column */}
                        <CategoryVideoGridColumn 
                            categoryTitle="Surgical approaches" 
                            theme="cyan"
                            videos={freeVideos} 
                            onVideoClick={handleVideoClick} 
                            onLearnMoreClick={handleLearnMoreClick}
                        />

                        {/* Category 2 Column */}
                        <CategoryVideoGridColumn 
                            categoryTitle="Clinical lecture/ tips tricks" 
                            theme="emerald"
                            videos={freeVideos} 
                            onVideoClick={handleVideoClick} 
                            onLearnMoreClick={handleLearnMoreClick}
                        />
                    </div>
                </div>
            </section>

            {/* Benefits of Membership Section */}
            <section id="benefits" className="landing-section benefits-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <div className="benefits-header-pill">
                            <span className="pulse-dot"></span>
                            <span className="pill-text">MEMBER PRIVILEGES & CLINICAL HUB</span>
                        </div>
                        <h2 className="landing-section-title">
                            Benefit of Membership with <span className="title-gradient-brand">{site_name || 'OMS COMPANION'}</span>
                        </h2>
                        <p className="landing-section-subtitle">
                            Empowering BDS Practitioners with masterclass surgical walkthroughs, live specialist WhatsApp desk, zero-loss patient tracking, and collaborative maxillofacial care.
                        </p>
                        <div className="benefits-trust-badges">
                            <span className="trust-badge-item">⚡ Live Surgeon Consultation Desk</span>
                            <span className="trust-badge-dot">•</span>
                            <span className="trust-badge-item">🛡️ Zero-Loss Patient Referral Log</span>
                            <span className="trust-badge-dot">•</span>
                            <span className="trust-badge-item">🎥 100+ HD Masterclass Streams</span>
                        </div>

                        {/* Mobile Swipe Hint Badge */}
                        <div className="benefits-mobile-scroll-hint">
                            <span className="hint-hand-bounce">👉</span>
                            <span>Swipe cards to explore all <strong>7 benefits</strong></span>
                            <span className="hint-pill-counter">{activeBenefitIndex + 1}/7</span>
                        </div>
                    </div>

                    <div 
                        className="benefits-grid"
                        ref={benefitsGridRef}
                        onScroll={handleBenefitsScroll}
                    >
                        {/* Benefit 1 */}
                        <div className="glass-panel benefit-card-premium theme-cyan">
                            <span className="benefit-watermark-num">01</span>
                            <div className="card-shimmer" />
                            <div className="card-top-content">
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-box">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="23 7 16 12 23 17 23 7" />
                                            <rect x="1" y="5" width="15" height="14" rx="3" ry="3" />
                                        </svg>
                                    </div>
                                    <span className="benefit-pill-tag">
                                        <span>🎥</span> Surgical Archive
                                    </span>
                                </div>
                                <h3 className="benefit-card-title">Free Access to Surgical Videos</h3>
                                <p className="benefit-card-desc">
                                    High-definition procedural walkthroughs, impaction techniques, and clinical reference cases.
                                </p>
                                <div className="benefit-feature-chip">
                                    <span className="chip-star">✦</span>
                                    <span>100+ Masterclass Streams</span>
                                </div>
                            </div>
                            <Link href={route('videos.public')} className="benefit-card-btn">
                                <span>View Archive</span>
                                <span className="btn-arrow-icon">→</span>
                            </Link>
                        </div>

                        {/* Benefit 2 */}
                        <div className="glass-panel benefit-card-premium theme-emerald">
                            <span className="benefit-watermark-num">02</span>
                            <div className="card-shimmer" />
                            <div className="card-top-content">
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-box">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                            <polyline points="17 6 23 6 23 12" />
                                        </svg>
                                    </div>
                                    <span className="benefit-pill-tag">
                                        <span>📈</span> Clinical Expansion
                                    </span>
                                </div>
                                <h3 className="benefit-card-title">Improve Your Range of Treatments</h3>
                                <p className="benefit-card-desc">
                                    Broaden minor surgical skills, diagnostic precision, and chairside procedural confidence.
                                </p>
                                <div className="benefit-feature-chip">
                                    <span className="chip-star">✦</span>
                                    <span>Chairside Skills Growth</span>
                                </div>
                            </div>
                            <Link href={route('videos.public')} className="benefit-card-btn">
                                <span>View Archive</span>
                                <span className="btn-arrow-icon">→</span>
                            </Link>
                        </div>

                        {/* Benefit 3 */}
                        <div className="glass-panel benefit-card-premium theme-whatsapp">
                            <span className="benefit-watermark-num">03</span>
                            <div className="card-shimmer" />
                            <div className="card-top-content">
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-box">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
                                        </svg>
                                    </div>
                                    <span className="benefit-pill-tag">
                                        <span>💬</span> WhatsApp Support
                                    </span>
                                </div>
                                <h3 className="benefit-card-title">Online Consultation & Expert Opinion</h3>
                                <p className="benefit-card-desc">
                                    Direct real-time specialist backing and case discussions via our dedicated WhatsApp channel.
                                </p>
                                <div className="benefit-feature-chip">
                                    <span className="chip-star">✦</span>
                                    <span>&lt; 15 Min Surgeon Response</span>
                                </div>
                            </div>
                            <a 
                                href={`https://wa.me/${(getSetting('footer_contact_phone', '8801700000000')).replace(/[^0-9]/g, '') || '8801700000000'}?text=${encodeURIComponent('Hello OMSCOMPANION! I would like an Online consultation / Expert opinion.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="benefit-card-btn"
                            >
                                <span>WhatsApp Chat</span>
                                <span className="btn-arrow-icon">💬</span>
                            </a>
                        </div>

                        {/* Benefit 4 */}
                        <div className="glass-panel benefit-card-premium theme-indigo">
                            <span className="benefit-watermark-num">04</span>
                            <div className="card-shimmer" />
                            <div className="card-top-content">
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-box">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <polyline points="9 12 11 14 15 10" />
                                        </svg>
                                    </div>
                                    <span className="benefit-pill-tag">
                                        <span>🛡️</span> Case Tracking
                                    </span>
                                </div>
                                <h3 className="benefit-card-title">Don’t Lose Your Patient</h3>
                                <p className="benefit-card-desc">
                                    End-to-end transparent referral logs and milestone tracking for every referred patient.
                                </p>
                                <div className="benefit-feature-chip">
                                    <span className="chip-star">✦</span>
                                    <span>Zero Patient Loss Guarantee</span>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleReferralClick} 
                                className="benefit-card-btn"
                            >
                                <span>Refer a Patient</span>
                                <span className="btn-arrow-icon">📋</span>
                            </button>
                        </div>

                        {/* Benefit 5 */}
                        <div className="glass-panel benefit-card-premium theme-rose">
                            <span className="benefit-watermark-num">05</span>
                            <div className="card-shimmer" />
                            <div className="card-top-content">
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-box">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                        </svg>
                                    </div>
                                    <span className="benefit-pill-tag">
                                        <span>🎓</span> Training & News
                                    </span>
                                </div>
                                <h3 className="benefit-card-title">Professional Clinical Training</h3>
                                <p className="benefit-card-desc">
                                    Hands-on surgical workshop alerts, accredited masterclasses, and modern clinical updates.
                                </p>
                                <div className="benefit-feature-chip">
                                    <span className="chip-star">✦</span>
                                    <span>Accredited Workshops</span>
                                </div>
                            </div>
                            <a href="#news" className="benefit-card-btn">
                                <span>News & Training</span>
                                <span className="btn-arrow-icon">📰</span>
                            </a>
                        </div>

                        {/* Benefit 6 */}
                        <div className="glass-panel benefit-card-premium theme-amber">
                            <span className="benefit-watermark-num">06</span>
                            <div className="card-shimmer" />
                            <div className="card-top-content">
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-box">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                                            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                                            <circle cx="20" cy="10" r="2" />
                                        </svg>
                                    </div>
                                    <span className="benefit-pill-tag">
                                        <span>🩺</span> Complex Cases
                                    </span>
                                </div>
                                <h3 className="benefit-card-title">Manage Co-Morbid Patients</h3>
                                <p className="benefit-card-desc">
                                    Evidence-based clinical guidelines to safely assess and treat medically compromised cases.
                                </p>
                                <div className="benefit-feature-chip">
                                    <span className="chip-star">✦</span>
                                    <span>Safety Protocol Checklists</span>
                                </div>
                            </div>
                            <Link href={route('videos.public')} className="benefit-card-btn">
                                <span>View Archive</span>
                                <span className="btn-arrow-icon">→</span>
                            </Link>
                        </div>

                        {/* Benefit 7 */}
                        <div className="glass-panel benefit-card-premium theme-teal">
                            <span className="benefit-watermark-num">07</span>
                            <div className="card-shimmer" />
                            <div className="card-top-content">
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-box">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                    <span className="benefit-pill-tag">
                                        <span>🤝</span> Multidisciplinary Team
                                    </span>
                                </div>
                                <h3 className="benefit-card-title">Team Surgery Collaboration</h3>
                                <p className="benefit-card-desc">
                                    Partner in hospital maxillofacial procedures with specialized surgical team support.
                                </p>
                                <div className="benefit-feature-chip">
                                    <span className="chip-star">✦</span>
                                    <span>Hospital OT Coordination</span>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleReferralClick} 
                                className="benefit-card-btn"
                            >
                                <span>Refer a Patient</span>
                                <span className="btn-arrow-icon">📋</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Carousel Indicators (Pure Finger Scroll) */}
                    <div className="benefits-mobile-controls">
                        <div className="benefits-dots-track">
                            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`benefits-dot-item ${activeBenefitIndex === i ? 'is-active' : ''}`}
                                    onClick={() => scrollToBenefit(i)}
                                    aria-label={`Go to benefit ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* BDS Doctor Testimonials Section */}
            <section className="landing-section testimonials-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <div className="doctors-review-pill-wrapper">
                            <span className="doctors-review-pill-btn">
                                Doctors review
                            </span>
                        </div>
                        <h2 className="landing-section-title">Trusted by BDS Practitioners</h2>
                        <p className="landing-section-subtitle">
                            Here is what practicing dentists across the network say about DentistChamber.
                        </p>
                    </div>

                    <div className="dashboard-grid testimonials-grid">
                        {activeTestimonials.map((t, idx) => {
                            const cleanName = (t.name || '').replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
                            const avatarChar = cleanName ? cleanName.charAt(0).toUpperCase() : 'D';
                            return (
                                <div key={t.id || idx} className="glass-panel testimonial-card">
                                    <div className="testimonial-stars">
                                        {'★'.repeat(t.rating || 5)}
                                    </div>
                                    <p className="testimonial-quote">"{t.quote}"</p>
                                    <div className="testimonial-author">
                                        <div className="author-avatar">{avatarChar}</div>
                                        <div>
                                            <h5 className="author-name">{t.name}</h5>
                                            <span className="author-role">
                                                {t.role}{t.location ? ` • ${t.location}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* News & Professional Training Section */}
            <section id="news" className="landing-section news-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <div className="outline-pill-wrapper">
                            <span className="outline-pill-badge">
                                Latest Updates
                            </span>
                        </div>
                        <h2 className="landing-section-title">Clinical News & Professional Training</h2>
                        <p className="landing-section-subtitle">
                            Stay updated with recent surgical case studies, workshop schedules, and professional training announcements for BDS Doctors.
                        </p>
                    </div>

                    <div className="news-grid">
                        {activeNewsItems.map((item, idx) => {
                            const glowClass = item.theme_color ? `card-glow-${item.theme_color}` : (idx % 3 === 0 ? 'card-glow-indigo' : idx % 3 === 1 ? 'card-glow-emerald' : 'card-glow-cyan');
                            const badgeStyleClass = idx % 3 === 0 ? 'badge-new' : idx % 3 === 1 ? 'badge-completed' : 'badge-approved';

                            const isWhatsApp = item.button_type === 'whatsapp' || item.button_url === 'whatsapp';
                            const waNumber = (getSetting('footer_contact_phone', '8801700000000')).replace(/[^0-9]/g, '') || '8801700000000';
                            const targetUrl = isWhatsApp 
                                ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello OMSCOMPANION! Inquiry regarding: ${item.title}`)}`
                                : (item.button_url || route('videos.public'));

                            return (
                                <div key={item.id || idx} className={`glass-panel news-card ${glowClass}`}>
                                    <div className="news-meta">
                                        <span className={`badge-status ${badgeStyleClass}`}>{item.badge_text}</span>
                                        {item.sub_badge_text && <span>{item.sub_badge_text}</span>}
                                    </div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', lineHeight: '1.4', margin: '6px 0' }}>{item.title}</h4>
                                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5', fontWeight: '400', margin: '0 0 14px' }}>
                                        {item.description}
                                    </p>
                                    {isWhatsApp || targetUrl.startsWith('http') ? (
                                        <a 
                                            href={targetUrl}
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={`btn ${isWhatsApp ? 'btn-whatsapp' : 'btn-outline'}`}
                                            style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                                        >
                                            {item.button_text}
                                        </a>
                                    ) : (
                                        <Link 
                                            href={targetUrl.startsWith('/') ? targetUrl : route('videos.public')} 
                                            className="btn btn-outline" 
                                            style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                                        >
                                            {item.button_text}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Section */}
            <section id="faq" className="landing-section faq-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <div className="outline-pill-wrapper">
                            <span className="outline-pill-badge">
                                Common Questions
                            </span>
                        </div>
                        <h2 className="landing-section-title">Frequently Asked Questions</h2>
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

            {/* Access Blocked / Registration Required Modal */}
            {accessBlockedReason && (
                <div className="modal-wrapper" onClick={() => setAccessBlockedReason(null)}>
                    <div 
                        className="modal-card-colorful" 
                        style={{ 
                            maxWidth: '500px', 
                            width: '92%',
                            padding: '36px 28px', 
                            textAlign: 'center',
                            backgroundColor: '#0f172a',
                            borderRadius: '20px',
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.25)',
                            position: 'relative'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setAccessBlockedReason(null)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '4px 8px'
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ 
                            width: '72px', 
                            height: '72px', 
                            borderRadius: '50%', 
                            backgroundColor: 'rgba(245, 158, 11, 0.15)', 
                            border: '2px solid rgba(245, 158, 11, 0.4)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            fontSize: '36px'
                        }}>
                            {accessBlockedReason === 'unauthenticated' ? '🔒' : '⏳'}
                        </div>

                        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px', color: '#ffffff', letterSpacing: '-0.3px' }}>
                            {accessBlockedReason === 'unauthenticated' ? 'Registration Required' : 'Approval Pending'}
                        </h3>
                        
                        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
                            {accessBlockedReason === 'unauthenticated'
                                ? 'Clinical video masterclasses are strictly reserved for verified BDS Practitioners. Please register or login to your account to watch.'
                                : 'Your BDS Doctor membership is currently pending admin approval. Access to full clinical video streams will unlock as soon as your account is approved.'
                            }
                        </p>
                        
                        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {accessBlockedReason === 'unauthenticated' ? (
                                <>
                                    <Link 
                                        href={route('register')} 
                                        style={{ 
                                            backgroundColor: '#0d9488', 
                                            color: '#ffffff', 
                                            fontWeight: '700', 
                                            fontSize: '14px',
                                            padding: '12px 24px', 
                                            borderRadius: '30px', 
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
                                        }}
                                    >
                                        🌟 Registration
                                    </Link>
                                    <Link 
                                        href={route('login')} 
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            border: '2px solid #f59e0b', 
                                            color: '#fbbf24', 
                                            fontWeight: '700', 
                                            fontSize: '14px',
                                            padding: '10px 24px', 
                                            borderRadius: '30px', 
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        href={getDashboardRoute()} 
                                        style={{ 
                                            backgroundColor: '#0d9488', 
                                            color: '#ffffff', 
                                            fontWeight: '700', 
                                            fontSize: '14px',
                                            padding: '12px 24px', 
                                            borderRadius: '30px', 
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Go to Dashboard
                                    </Link>
                                    <button 
                                        onClick={() => setAccessBlockedReason(null)} 
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            border: '2px solid rgba(255, 255, 255, 0.3)', 
                                            color: '#ffffff', 
                                            fontWeight: '700', 
                                            fontSize: '14px',
                                            padding: '10px 24px', 
                                            borderRadius: '30px',
                                            cursor: 'pointer'
                                        }}
                                    >
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

            {/* REFERRAL SYSTEM MODAL (FOR GUEST USERS) */}
            <ReferralModal 
                isOpen={referralModalOpen} 
                onClose={() => setReferralModalOpen(false)} 
            />

            {/* Social Media Web & App Share Modal */}
            {shareModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, padding: '20px', boxSizing: 'border-box' }} onClick={() => setShareModalOpen(false)}>
                    <div 
                        style={{ 
                            maxWidth: '480px', 
                            width: '100%',
                            padding: '28px 24px', 
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                            color: '#0f172a'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                            <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                                🌐 Share OMS Companion
                            </h3>
                            <button 
                                onClick={() => setShareModalOpen(false)} 
                                style={{ background: '#f1f5f9', border: 'none', color: '#64748b', fontSize: '16px', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                            >
                                ✕
                            </button>
                        </div>

                        <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 20px 0', textAlign: 'center', lineHeight: '1.5' }}>
                            Share with BDS doctors & dental practitioners on Facebook & Messenger:
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                            {/* Facebook Web */}
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '16px 12px',
                                    borderRadius: '14px',
                                    backgroundColor: '#e7f3ff',
                                    color: '#1877F2',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    border: '1px solid #bcdcff',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </a>

                            {/* Messenger Web */}
                            <a
                                href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com')}&app_id=291494419107518&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '16px 12px',
                                    borderRadius: '14px',
                                    backgroundColor: '#f0f4ff',
                                    color: '#0084FF',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    border: '1px solid #c2d9ff',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="url(#messenger-grad)">
                                    <defs>
                                        <linearGradient id="messenger-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#00C6FF" />
                                            <stop offset="100%" stopColor="#0078FF" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.302 2.253.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.888-3.26-6.559 6.963z"/>
                                </svg>
                                Messenger
                            </a>
                        </div>

                        {/* Copy Link Row inside modal */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text"
                                readOnly
                                value={typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com'}
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#f8fafc',
                                    fontSize: '13px',
                                    color: '#475569'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    backgroundColor: copiedLink ? '#10b981' : '#2563eb',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {copiedLink ? '✓ Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Website Share Feature Section */}
            <section className="share-section" style={{ padding: '30px 20px 40px', textAlign: 'center' }}>
                <div className="landing-section-container">
                    <div className="share-invite-card">
                        <div className="outline-pill-wrapper" style={{ justifyContent: 'center', marginBottom: '14px' }}>
                            <span className="outline-pill-badge share-invite-pill">
                                🔗 Share & Invite
                            </span>
                        </div>

                        <h3 className="share-invite-title">
                            Share OMS Companion With Colleagues
                        </h3>
                        <p className="share-invite-desc">
                            Connect with fellow BDS doctors and dental practitioners across your preferred messaging apps.
                        </p>

                        <div className="share-apps-grid">
                            {/* WhatsApp Button */}
                            <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out OMS Companion - Digital Hub for BDS Doctors & Maxillofacial Practice: ' + (typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com'))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-app-btn app-whatsapp"
                                title="Share on WhatsApp"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.146 4.186 4.226-1.107z"/>
                                </svg>
                                <span>WhatsApp</span>
                            </a>

                            {/* Facebook Messenger Button */}
                            <a
                                href={typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
                                    ? `fb-messenger://share/?link=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com')}`
                                    : `https://www.facebook.com/dialog/send?link=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com')}&app_id=291494419107518&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com')}`}
                                onClick={handleMessengerShare}
                                className="share-app-btn app-messenger"
                                title="Share on Facebook Messenger"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.455 5.527 3.735 7.205V22l3.415-1.874c.905.251 1.865.387 2.85.387 5.523 0 10-4.145 10-9.255C22 6.145 17.523 2 12 2zm1.047 12.448l-2.678-2.857-5.228 2.857 5.75-6.103 2.748 2.857 5.158-2.857-5.75 6.103z"/>
                                </svg>
                                <span>Messenger</span>
                            </a>

                            {/* Viber Button */}
                            <a
                                href={`viber://forward?text=${encodeURIComponent('Check out OMS Companion - Digital Hub for BDS Doctors & Maxillofacial Practice: ' + (typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com'))}`}
                                onClick={handleViberShare}
                                className="share-app-btn app-viber"
                                title="Share on Viber"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.64 3.79C17.76 2.06 15.17 1.2 12.06 1.2c-3.12 0-5.7.86-7.58 2.59C2.59 5.53 1.63 7.85 1.63 10.7c0 2.28.64 4.3 1.9 6.01L2 22.8l6.32-1.5c1.19.45 2.45.68 3.74.68 3.12 0 5.7-.86 7.58-2.59 1.88-1.74 2.84-4.06 2.84-6.91 0-2.85-.96-5.17-2.84-6.69zm-1.32 12.18c-1.48 1.36-3.56 2.05-6.26 2.05-1.12 0-2.22-.19-3.26-.57l-.46-.17-4.1 1 1-3.95-.19-.48C4.38 12.7 3.8 11.3 3.8 9.88c0-2.3 .77-4.13 2.29-5.45C7.6 3.12 9.69 2.45 12.06 2.45c2.37 0 4.45.67 5.97 1.98 1.52 1.32 2.29 3.15 2.29 5.45 0 2.3-.77 4.14-2.29 5.46l.29.63zM15.4 12.9c-.27-.12-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.08-.27-.12-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.31.41-.46.14-.15.18-.25.27-.42.09-.17.05-.32-.02-.45-.07-.13-.61-1.47-.84-2.02-.22-.53-.45-.46-.62-.47-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27s.97 2.63 1.11 2.82c.14.18 1.91 2.92 4.63 4.09.65.28 1.15.45 1.55.57.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.3z"/>
                                </svg>
                                <span>Viber</span>
                            </a>

                            {/* Telegram Button */}
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com')}&text=${encodeURIComponent('Check out OMS Companion - Digital Hub for BDS Doctors & Maxillofacial Practice')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-app-btn app-telegram"
                                title="Share on Telegram"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                </svg>
                                <span>Telegram</span>
                            </a>

                            {/* Copy Link Button */}
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="share-app-btn app-copylink"
                                title="Copy link to clipboard"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                                <span>{copiedLink ? '✓ Link Copied!' : 'Copy Link'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call To Action Banner */}
            <section className="cta-banner-section">
                <div className="landing-section-container">
                    <div className="glass-panel cta-banner-card">
                        <h2 className="cta-title">Ready to elevate your practice with OMS Companion</h2>
                        <p className="cta-desc">
                            Join hundreds of practitioners, using {site_name || 'OMS COMPANION'} for professional improvement and better patient care.
                        </p>
                        <div className="cta-buttons" style={{ alignItems: 'center' }}>
                            <button 
                                type="button" 
                                onClick={handleReferralClick}
                                className="refer-patient-glossy-btn"
                                aria-label="Refer Patient"
                            >
                                <div className="refer-patient-icon-circle">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="4" y="4" width="16" height="17" rx="2" fill="#0891b2" fillOpacity="0.12" stroke="#0e7490" strokeWidth="2"/>
                                        <path d="M9 3H15V6H9V3Z" fill="#0891b2" stroke="#0e7490" strokeWidth="1.5"/>
                                        <circle cx="12" cy="4.5" r="1" fill="#ffffff"/>
                                        <circle cx="12" cy="10.5" r="2" fill="#0e7490"/>
                                        <path d="M8.5 15C8.5 13.5 10 13 12 13C14 13 15.5 13.5 15.5 15" stroke="#0e7490" strokeWidth="1.8" strokeLinecap="round"/>
                                        <path d="M12 17.5V20.5M10.5 19H13.5" stroke="#0891b2" strokeWidth="2.2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <span className="refer-patient-text">Refer Patient</span>
                                <div className="refer-patient-arrow-circle">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="4" y1="12" x2="20" y2="12" />
                                        <polyline points="13 5 20 12 13 19" />
                                    </svg>
                                </div>
                            </button>
                            
                            {auth.user ? (
                                <Link href={getDashboardRoute()} className="btn btn-outline hero-btn" style={{ borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff' }}>
                                    Open Your Dashboard
                                </Link>
                            ) : (
                                <Link href={route('register')} className="btn btn-outline hero-btn" style={{ borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff' }}>
                                    Register
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" style={{ padding: '60px 0 30px 0', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-white)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                        
                        {/* Brand Column */}
                        <div>
                            <Link href="/" className="landing-brand-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
                                <ApplicationLogo />
                            </Link>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                                OMS COMPANION connects doctors to enhance practice through learning and patient care
                            </p>
                        </div>

                        {/* Office Location Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>📍 Office Location</h4>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                                {getSetting('footer_office_location', 'Dhaka, Bangladesh')}
                            </p>
                        </div>

                        {/* Contact Information Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>📞 Contact & Support</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                                {getSetting('footer_contact_phone') && (
                                    <div>
                                        <strong>Phone:</strong> <a href={`tel:${getSetting('footer_contact_phone')}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{getSetting('footer_contact_phone')}</a>
                                    </div>
                                )}
                                {getSetting('footer_contact_email') && (
                                    <div>
                                        <strong>Email:</strong> <a href={`mailto:${getSetting('footer_contact_email')}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>{getSetting('footer_contact_email')}</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Links Column */}
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '700' }}>🌐 Connect With Us</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Facebook Page Link */}
                                <a 
                                    href={getSetting('footer_facebook_url') || 'https://facebook.com'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="footer-social-btn footer-btn-facebook"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span>Facebook Page</span>
                                </a>

                                {/* YouTube Channel Link */}
                                <a 
                                    href={getSetting('footer_youtube_url') || 'https://youtube.com'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="footer-social-btn footer-btn-youtube"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                    <span>YouTube Channel</span>
                                </a>
                            </div>
                        </div>

                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                        © 2026 {site_name || 'OMSCOMPANION'} Association. All Rights Reserved.
                    </div>
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

            {/* Floating Mobile App Install Icon */}
            <FloatingAppInstallWidget />
        </div>
    );
}
