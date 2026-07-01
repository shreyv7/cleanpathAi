import Script from "next/script";

const enabled = true;
const propertyId = "ee130581-3699-4b3c-b4c8-aef92ae586fd";
const apiKey = "zsk_live_TAp5ulKoiZoPR8LZu6qgRhcp";
const apiUrl = "https://dpdpa-backend-290927690790.asia-south1.run.app/public/v1";
const scriptUrl = "https://dpdpashield-500607.web.app/cmp.js";
const language = "auto";
const blockerMode = "strict";
const bannerId = "c0c7dadd-994d-4035-971c-dbb585a55aee";

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
