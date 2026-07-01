import Script from "next/script";

const enabled = process.env.NEXT_PUBLIC_ZEROSHIELD_ENABLED === "true";
const propertyId = process.env.NEXT_PUBLIC_ZEROSHIELD_PROPERTY_ID;
const apiKey = process.env.NEXT_PUBLIC_ZEROSHIELD_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_ZEROSHIELD_API_URL;
const scriptUrl =
    process.env.NEXT_PUBLIC_ZEROSHIELD_SCRIPT_URL ??
    (apiUrl ? `${apiUrl.replace(/\/$/, "")}/integrations/cmp.js` : undefined);
const language = process.env.NEXT_PUBLIC_ZEROSHIELD_LANGUAGE ?? "auto";
const blockerMode = process.env.NEXT_PUBLIC_ZEROSHIELD_BLOCKER_MODE ?? "strict";
const bannerId = process.env.NEXT_PUBLIC_ZEROSHIELD_BANNER_ID;

export default function ZeroShieldCmp() {
    if (!enabled || !propertyId || !apiKey || !scriptUrl || !apiUrl) {
        return null;
    }

    return (
        <Script
            id="zeroshield-cmp"
            src={scriptUrl}
            strategy="afterInteractive"
            data-property-id={propertyId}
            data-api-key={apiKey}
            data-api-url={apiUrl}
            data-language={language}
            data-blocker-mode={blockerMode}
            {...(bannerId ? { "data-banner-id": bannerId } : {})}
        />
    );
}
