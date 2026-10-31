import './bootstrap';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { syncNativeUser } from './utils/appDetection';

const defaultAppName = import.meta.env.VITE_APP_NAME || 'OMSCOMPANION';

// Automatically synchronize native app state on page navigations
router.on('navigate', (event) => {
    const user = event.detail.page?.props?.auth?.user;
    if (user) {
        syncNativeUser(user);
    }
});

router.on('success', (event) => {
    const user = event.detail.page?.props?.auth?.user;
    if (user) {
        syncNativeUser(user);
    }
});

createInertiaApp({
    title: (title) => title ? `${title} - ${defaultAppName}` : defaultAppName,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        if (props?.initialPage?.props?.auth?.user) {
            syncNativeUser(props.initialPage.props.auth.user);
        }

        if (props?.initialPage?.props?.site_logo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = props.initialPage.props.site_logo;
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
