import React, { useState, useRef, useEffect } from 'react';

export default function CameraPhotoUpload({
    currentPreview = null,
    onPhotoSelected,
    label = 'Profile Photo',
    maxSizeKB = 5000,
    required = false,
}) {
    const [preview, setPreview] = useState(currentPreview);
    const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
    const [cameraFacing, setCameraFacing] = useState('user'); // 'user' (front) or 'environment' (back)
    const [cameraError, setCameraError] = useState(null);
    const [isLoadingCamera, setIsLoadingCamera] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    useEffect(() => {
        setPreview(currentPreview);
    }, [currentPreview]);

    // Cleanup media stream when component unmounts or modal closes
    useEffect(() => {
        return () => {
            stopMediaStream();
        };
    }, []);

    const stopMediaStream = () => {
        if (streamRef.current) {
            try {
                streamRef.current.getTracks().forEach(track => track.stop());
            } catch (e) {
                // Ignore
            }
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    /**
     * Compresses/resizes image so even 10MB camera shots become ~150-250KB JPEG
     */
    const optimizeImage = (file) => {
        return new Promise((resolve) => {
            if (!file || !file.type.startsWith('image/')) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const maxDim = 1600; // High resolution HD support
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const optimizedFile = new File(
                                    [blob],
                                    file.name ? file.name.replace(/\.[^/.]+$/, '.jpg') : `photo_${Date.now()}.jpg`,
                                    { type: 'image/jpeg', lastModified: Date.now() }
                                );
                                resolve(optimizedFile);
                            } else {
                                resolve(file);
                            }
                        },
                        'image/jpeg',
                        0.88
                    );
                };
                img.onerror = () => resolve(file);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const processedFile = await optimizeImage(file);
            const objectUrl = URL.createObjectURL(processedFile);
            setPreview(objectUrl);
            if (onPhotoSelected) {
                onPhotoSelected(processedFile);
            }
        }
        // Reset input value so same photo can be picked again if desired
        if (e.target) {
            e.target.value = '';
        }
    };

    // Open Live Camera Viewfinder or fallback to device camera input
    const openCamera = async () => {
        setCameraError(null);

        // First check if navigator.mediaDevices.getUserMedia is supported
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setIsLoadingCamera(true);
            setIsLiveCameraOpen(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: cameraFacing,
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: false,
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                setIsLoadingCamera(false);
                return;
            } catch (err) {
                console.warn('Live getUserMedia camera failed, falling back to native camera input:', err);
                setIsLiveCameraOpen(false);
                stopMediaStream();
            } finally {
                setIsLoadingCamera(false);
            }
        }

        // Fallback: Trigger native device camera file input
        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    // Switch between Front (user) and Back (environment) camera in live mode
    const toggleCameraFacing = async () => {
        stopMediaStream();
        const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
        setCameraFacing(newFacing);
        setIsLoadingCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: newFacing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (e) {
            setCameraError('Unable to switch camera.');
        } finally {
            setIsLoadingCamera(false);
        }
    };

    // Snap photo from live video feed
    const captureFromLiveCamera = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // If front camera, mirror horizontally for natural feel
        if (cameraFacing === 'user') {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
            async (blob) => {
                if (blob) {
                    const snapFile = new File([blob], `camera_capture_${Date.now()}.jpg`, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    const optimized = await optimizeImage(snapFile);
                    const objectUrl = URL.createObjectURL(optimized);
                    setPreview(objectUrl);
                    if (onPhotoSelected) {
                        onPhotoSelected(optimized);
                    }
                }
                closeLiveCamera();
            },
            'image/jpeg',
            0.9
        );
    };

    const closeLiveCamera = () => {
        stopMediaStream();
        setIsLiveCameraOpen(false);
        setCameraError(null);
    };

    const handleRemovePhoto = () => {
        setPreview(null);
        if (onPhotoSelected) {
            onPhotoSelected(null);
        }
    };

    return (
        <div className="camera-upload-container" style={{ textAlign: 'center', marginBottom: '16px' }}>
            {label && (
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                    {label} {required ? '*' : '(Optional)'}
                </label>
            )}

            {/* Hidden native file/camera inputs */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Take Photo with Camera"
            />
            <input
                ref={galleryInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Upload from Gallery"
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {/* Avatar Preview Box */}
                <div
                    onClick={openCamera}
                    title="Click to take photo with camera"
                    style={{
                        position: 'relative',
                        width: '84px',
                        height: '84px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '2.5px solid var(--color-cyan, #06b6d4)',
                        boxShadow: '0 4px 18px rgba(6, 182, 212, 0.25)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-cyan, #06b6d4)' }}>
                            <span style={{ fontSize: '28px', lineHeight: 1 }}>📷</span>
                            <span style={{ fontSize: '9px', fontWeight: '700', marginTop: '2px', textTransform: 'uppercase' }}>Camera</span>
                        </div>
                    )}

                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(15, 23, 42, 0.75)',
                            padding: '2px 0',
                            fontSize: '9px',
                            fontWeight: '700',
                            color: '#ffffff',
                            textAlign: 'center',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        {preview ? 'Change' : 'Open'}
                    </div>
                </div>

                {/* Status Indicator */}
                {preview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', fontWeight: '700' }}>
                        <span>✓</span>
                        <span>ছবি যুক্ত হয়েছে (Photo Selected)</span>
                    </div>
                ) : (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                        ক্যামেরা দিয়ে ছবি তুলুন অথবা গ্যালারি থেকে যেকোনো সাইজের ছবি সিলেক্ট করুন (HD ও যেকোনো সাইজ সমর্থিত)
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={openCamera}
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 16px',
                            fontSize: '12px',
                            fontWeight: '700',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)',
                        }}
                    >
                        <span>📷</span>
                        <span>ক্যামেরা ওপেন করুন</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
                        className="btn btn-outline"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '20px',
                            cursor: 'pointer',
                        }}
                    >
                        <span>📁</span>
                        <span>গ্যালারি / ফাইল</span>
                    </button>

                    {preview && (
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '7px 10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#ef4444',
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '20px',
                                cursor: 'pointer',
                            }}
                            title="Remove photo"
                        >
                            ✕ মুছুন
                        </button>
                    )}
                </div>
            </div>

            {/* Live Camera Modal */}
            {isLiveCameraOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.88)',
                        zIndex: 999999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '480px',
                            backgroundColor: '#0f172a',
                            borderRadius: '20px',
                            border: '1.5px solid rgba(6, 182, 212, 0.4)',
                            overflow: 'hidden',
                            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
                                <span>📷</span>
                                <span>ক্যামেরা ভিউফাইন্ডার (Live Camera)</span>
                            </div>
                            <button
                                type="button"
                                onClick={closeLiveCamera}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    lineHeight: 1,
                                }}
                                aria-label="Close Camera"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Viewfinder Video */}
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                height: '360px',
                                backgroundColor: '#000000',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                                }}
                            />

                            {/* Face guide outline */}
                            <div
                                style={{
                                    position: 'absolute',
                                    width: '180px',
                                    height: '220px',
                                    borderRadius: '50%',
                                    border: '2px dashed rgba(6, 182, 212, 0.7)',
                                    pointerEvents: 'none',
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.25)',
                                }}
                            />

                            {isLoadingCamera && (
                                <div style={{ position: 'absolute', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
                                    ক্যামেরা চালু হচ্ছে...
                                </div>
                            )}

                            {cameraError && (
                                <div style={{ position: 'absolute', padding: '10px 16px', background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', borderRadius: '8px', fontSize: '13px' }}>
                                    {cameraError}
                                </div>
                            )}
                        </div>

                        {/* Controls Bottom Bar */}
                        <div
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-around',
                                backgroundColor: '#1e293b',
                            }}
                        >
                            {/* Switch Camera */}
                            <button
                                type="button"
                                onClick={toggleCameraFacing}
                                className="btn btn-outline"
                                style={{
                                    padding: '8px 14px',
                                    fontSize: '12px',
                                    borderRadius: '20px',
                                    color: '#ffffff',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    cursor: 'pointer',
                                }}
                                title="ক্যামেরা পরিবর্তন করুন"
                            >
                                🔄 ফ্লিপ করুন
                            </button>

                            {/* Big Shutter Button */}
                            <button
                                type="button"
                                onClick={captureFromLiveCamera}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: '#06b6d4',
                                    border: '4px solid #ffffff',
                                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.7)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    color: '#ffffff',
                                    transition: 'transform 0.15s ease',
                                }}
                                title="ছবি তুলুন (Snap Photo)"
                            >
                                📸
                            </button>

                            {/* Fallback to Native Camera if Live doesn't suit */}
                            <button
                                type="button"
                                onClick={() => {
                                    closeLiveCamera();
                                    if (cameraInputRef.current) {
                                        cameraInputRef.current.click();
                                    }
                                }}
                                className="btn btn-outline"
                                style={{
                                    padding: '8px 14px',
                                    fontSize: '12px',
                                    borderRadius: '20px',
                                    color: '#ffffff',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    cursor: 'pointer',
                                }}
                                title="ডিভাইসের ক্যামেরা অ্যাপ খুলুন"
                            >
                                📱 ডিভাইস ক্যামেরা
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
