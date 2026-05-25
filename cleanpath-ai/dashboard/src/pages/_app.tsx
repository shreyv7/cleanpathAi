import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        const applyTheme = () => {
            const savedTheme = localStorage.getItem('cleanpath_theme') || 'default';
            const root = window.document.documentElement;
            
            root.classList.remove('dark');
            
            if (savedTheme === 'dark') {
                root.classList.add('dark');
            } else if (savedTheme === 'system') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemPrefersDark) {
                    root.classList.add('dark');
                }
            }
        };

        // Apply theme on mount
        applyTheme();

        // Listen for manual theme switches in the app
        window.addEventListener('cleanpath_theme_change', applyTheme);
        
        // Listen for system preference shifts
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', applyTheme);

        return () => {
            window.removeEventListener('cleanpath_theme_change', applyTheme);
            mediaQuery.removeEventListener('change', applyTheme);
        };
    }, []);

    return (
        <>
            <Head>
                <title>CleanPath AI | MFA Detection Dashboard</title>
                <meta name="description" content="Real-time ad fraud detection and analytics" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Component {...pageProps} />
            </div>
        </>
    );
}
