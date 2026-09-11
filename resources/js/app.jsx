import './bootstrap';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const defaultAppName = import.meta.env.VITE_APP_NAME || 'OMSCOMPANION';

const syncNativeUser = (user) => {
    if (user && user.id) {
        window.authUser = { id: user.id, email: user.email };
        if (window.OMSCompanionNative && typeof window.OMSCompanionNative.setUserId === 'function') {
            try {
                window.OMSCompanionNative.setUserId(String(user.id));
            } catch (e) {
                console.error("Error setting native user ID:", e);
            }
        }
    }
};

router.on('navigate', (event) => {
    const user = event.detail.page.props?.auth?.user;
    if (user) {
        syncNativeUser(user);
    }
});

createInertiaApp({
    title: (title) => title ? `${title} - ${defaultAppName}` : defaultAppName,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        if (props?.initialPage?.props?.site_logo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = props.initialPage.props.site_logo;
        }

        if (props?.initialPage?.props?.auth?.user) {
            syncNativeUser(props.initialPage.props.auth.user);
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
