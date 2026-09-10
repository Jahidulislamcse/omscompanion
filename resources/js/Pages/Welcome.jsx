import { useState, useEffect, useMemo } from 'react';
import { Link, Head, usePage, useForm, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicNavbar from '@/Components/PublicNavbar';

export function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

function CategoryAutoRollingColumn({ categoryTitle, videos = [], onVideoClick, onLearnMoreClick }) {
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
                    (v.title || '').toLowerCase().includes('airplane') ||
                    (v.title || '').toLowerCase().includes('molar')
                );
            } else {
                matches = videos.filter(v => 
                    (v.title || '').toLowerCase().includes('clinical') || 
                    (v.description || '').toLowerCase().includes('clinical') ||
                    (v.title || '').toLowerCase().includes('imperial') ||
                    (v.title || '').toLowerCase().includes('lecture')
                );
            }
        }

        return matches.length > 0 ? matches : videos;
    }, [videos, categoryTitle]);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (categoryVideos.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % categoryVideos.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [categoryVideos]);

    if (categoryVideos.length === 0) return null;

    const currentVid = categoryVideos[currentIndex % categoryVideos.length];
    const ytId = getYouTubeId(currentVid.video_path);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <h3 className="category-column-title">{categoryTitle}</h3>

            <div className="rolling-video-card" style={{ width: '100%', cursor: 'pointer' }} onClick={() => onVideoClick(currentVid)}>
                {ytId ? (
                    <img 
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                        alt={currentVid.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{currentVid.title}</span>
                    </div>
                )}

                <div className="thumb-overlay">
                    <div className="play-button-glow golden-play-button">
                        <span className="play-icon">▶</span>
                    </div>
                    <span className="play-label" style={{ fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>WATCH VIDEO</span>
                </div>

                <span className="video-duration" style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.85)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>
                    Preview
                </span>
            </div>

            {categoryVideos.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    {categoryVideos.map((_, idx) => (
                        <span 
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: idx === currentIndex ? '20px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: idx === currentIndex ? '#0d9488' : 'rgba(15, 23, 42, 0.25)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            )}

            <div style={{ marginTop: '18px', textAlign: 'center' }}>
                <button 
                    onClick={() => onLearnMoreClick(currentVid)}
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

    // Referral System Modal State
    const [referralModalOpen, setReferralModalOpen] = useState(false);
    const [referralStep, setReferralStep] = useState('select_type'); // 'select_type' | 'bds_prompt' | 'medicine_shop_form' | 'success'
    const [referralType, setReferralType] = useState(null); // 'bds_doctor' | 'medicine_shop'

    // Form for Medicine Shop Keeper Referral
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
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        if (auth.user) {
            if (auth.user.role === 'admin') {
                router.visit(route('admin.referrals'));
            } else {
                router.visit(route('member.referrals'));
            }
        } else {
            setReferralModalOpen(true);
            setReferralStep('select_type');
        }
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

            {/* ONLY A BIG REFERRAL BUTTON WITH BUMP ANIMATION */}
            <section id="referral-system" className="landing-section" style={{ paddingTop: '36px', paddingBottom: '36px', textAlign: 'center' }}>
                <div className="landing-section-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button 
                        type="button" 
                        onClick={handleReferralClick}
                        className="refer-patient-glossy-btn-large"
                        aria-label="Refer Patient"
                    >
                        <div className="refer-patient-icon-circle">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" y1="12" x2="20" y2="12" />
                                <polyline points="13 5 20 12 13 19" />
                            </svg>
                        </div>
                    </button>
                </div>
            </section>

            {/* Benefits of Membership Section */}
            <section id="benefits" className="landing-section benefits-section">
                <div className="landing-section-container">
                    <div className="landing-section-header">
                        <div className="outline-pill-wrapper">
                            <span className="outline-pill-badge">
                                Member Advantages
                            </span>
                        </div>
                        <h2 className="landing-section-title">Benefit of Membership</h2>
                        <p className="landing-section-subtitle">
                            Explore how joining {site_name || 'OMS COMPANION'} empowers BDS Doctors with surgical video archives, online consultations, transparent management tracking, and professional Learning.
                        </p>
                    </div>

                    <div className="benefits-grid">
                        {/* Benefit 1 */}
                        <div className="glass-panel benefit-card card-glow-cyan">
                            <div>
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-wrapper">🎥</div>
                                    <span className="benefit-tag">Surgical Archive</span>
                                </div>
                                <h3 className="benefit-title">Free access to surgical reference videos</h3>
                            </div>
                            <Link href={route('videos.public')} className="benefit-action-btn btn-primary">
                                View Archive →
                            </Link>
                        </div>

                        {/* Benefit 2 */}
                        <div className="glass-panel benefit-card card-glow-emerald">
                            <div>
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-wrapper">📈</div>
                                    <span className="benefit-tag">Clinical Expansion</span>
                                </div>
                                <h3 className="benefit-title">Improve your range of treatments</h3>
                            </div>
                            <Link href={route('videos.public')} className="benefit-action-btn btn-primary">
                                View Archive →
                            </Link>
                        </div>

                        {/* Benefit 3 */}
                        <div className="glass-panel benefit-card card-glow-gold">
                            <div>
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-wrapper">💬</div>
                                    <span className="benefit-tag">WhatsApp Support</span>
                                </div>
                                <h3 className="benefit-title">Online consultation / Expert opinion</h3>
                            </div>
                            <a 
                                href={`https://wa.me/${(getSetting('footer_contact_phone', '8801700000000')).replace(/[^0-9]/g, '') || '8801700000000'}?text=${encodeURIComponent('Hello OMSCOMPANION! I would like an Online consultation / Expert opinion.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="benefit-action-btn btn-whatsapp"
                            >
                                WhatsApp Chat 📲
                            </a>
                        </div>

                        {/* Benefit 4 */}
                        <div className="glass-panel benefit-card card-glow-indigo">
                            <div>
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-wrapper">🛡️</div>
                                    <span className="benefit-tag">Case Tracking</span>
                                </div>
                                <h3 className="benefit-title">Don’t lose your patient through referral</h3>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleReferralClick} 
                                className="benefit-action-btn btn-primary"
                                style={{ cursor: 'pointer', border: 'none' }}
                            >
                                Refer a Patient 📋
                            </button>
                        </div>

                        {/* Benefit 5 */}
                        <div className="glass-panel benefit-card card-glow-rose">
                            <div>
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-wrapper">🎓</div>
                                    <span className="benefit-tag">Training & News</span>
                                </div>
                                <h3 className="benefit-title">Improve clinical skills / Professional training</h3>
                            </div>
                            <a href="#news" className="benefit-action-btn btn-rose-glow">
                                News & Training 📰
                            </a>
                        </div>

                        {/* Benefit 6 */}
                        <div className="glass-panel benefit-card card-glow-amber">
                            <div>
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-wrapper">🩺</div>
                                    <span className="benefit-tag">Complex Cases</span>
                                </div>
                                <h3 className="benefit-title">Manage more co-morbid patients</h3>
                            </div>
                            <Link href={route('videos.public')} className="benefit-action-btn btn-primary">
                                View Archive →
                            </Link>
                        </div>

                        {/* Benefit 7 */}
                        <div className="glass-panel benefit-card card-glow-cyan">
                            <div>
                                <div className="benefit-card-header">
                                    <div className="benefit-icon-wrapper">🤝</div>
                                    <span className="benefit-tag">Multidisciplinary Team</span>
                                </div>
                                <h3 className="benefit-title">Participate in Maxillofacial surgery cases as a team</h3>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleReferralClick} 
                                className="benefit-action-btn btn-primary"
                                style={{ cursor: 'pointer', border: 'none' }}
                            >
                                Refer a Patient 📋
                            </button>
                        </div>
                    </div>
                </div>
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
                        <CategoryAutoRollingColumn 
                            categoryTitle="Surgical approaches" 
                            videos={freeVideos} 
                            onVideoClick={handleVideoClick} 
                            onLearnMoreClick={handleLearnMoreClick}
                        />

                        {/* Category 2 Column */}
                        <CategoryAutoRollingColumn 
                            categoryTitle="Clinical lecture/ tips tricks" 
                            videos={freeVideos} 
                            onVideoClick={handleVideoClick} 
                            onLearnMoreClick={handleLearnMoreClick}
                        />
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
            {referralModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, padding: '20px', boxSizing: 'border-box' }}>
                    <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', color: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                                📋 Refer a Patient
                            </h3>
                            <button 
                                onClick={() => { setReferralModalOpen(false); resetShopForm(); }} 
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
                                        onClick={() => { resetShopForm(); setReferralStep('select_type'); }}
                                        className="btn btn-outline"
                                        style={{ padding: '10px 20px', fontSize: '14px', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '10px' }}
                                    >
                                        Refer Another Patient
                                    </button>
                                    <button 
                                        onClick={() => { setReferralModalOpen(false); resetShopForm(); }}
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
            )}

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
                    <div 
                        className="glass-panel" 
                        style={{ 
                            padding: '36px 24px', 
                            borderRadius: '24px', 
                            background: 'var(--card-bg, #ffffff)',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                            maxWidth: '960px',
                            margin: '0 auto'
                        }}
                    >
                        <div className="outline-pill-wrapper" style={{ justifyContent: 'center', marginBottom: '22px' }}>
                            <span className="outline-pill-badge" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--color-cyan, #06b6d4)' }}>
                                🔗 Share & Invite
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                            {/* WhatsApp Share Button */}
                            <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out OMS Companion - Digital Hub for BDS Doctors & Maxillofacial Practice: ' + (typeof window !== 'undefined' ? window.location.origin : 'https://omscompanion.com'))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 22px',
                                    borderRadius: '50px',
                                    backgroundColor: '#25D366',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.35)',
                                    transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                className="share-btn-hover"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.146 4.186 4.226-1.107z"/>
                                </svg>
                                WhatsApp
                            </a>

                            {/* Native / Web Social Media Share Button */}
                            <button
                                type="button"
                                onClick={handleSocialShare}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 22px',
                                    borderRadius: '50px',
                                    backgroundColor: '#1877F2',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(24, 119, 242, 0.35)',
                                    transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                className="share-btn-hover"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                                </svg>
                                Share on Social Media Apps
                            </button>



                            {/* Copy Link Button */}
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '11px 22px',
                                    borderRadius: '50px',
                                    backgroundColor: copiedLink ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-main, #f8fafc)',
                                    border: copiedLink ? '1.5px solid #10b981' : '1.5px solid var(--border-color, #cbd5e1)',
                                    color: copiedLink ? '#059669' : 'var(--text-color, #0f172a)',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {copiedLink ? '✓ Link Copied!' : '📋 Copy Link'}
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
                            {getSetting('footer_facebook_url') ? (
                                <a 
                                    href={getSetting('footer_facebook_url')} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-outline"
                                    style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        color: '#fff', 
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        padding: '8px 16px',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <span>🔵</span> Facebook Page
                                </a>
                            ) : (
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Official Facebook page link coming soon.</p>
                            )}
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
        </div>
    );
}
