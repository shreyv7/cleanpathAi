import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>CleanPath AI | MFA Detection Dashboard</title>
                <meta name="description" content="Real-time ad fraud detection and analytics" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="min-h-screen font-sans selection:bg-blue-500/30">
                <Component {...pageProps} />
            </div>
        </>
    );
}
