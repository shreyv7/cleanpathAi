/**
 * CleanPath AI — Pulse Human Validation SDK (Module C)
 * 
 * Lightweight client-side telemetry SDK that captures mouse dynamics, scroll curves,
 * and coordinate precision to calculate micro-interaction entropy.
 * Runs completely anonymously with zero PII storage.
 */
(function () {
    const CONFIG = {
        endpoint: 'http://localhost:3000/api/pulse/verify',
        sampleIntervalMs: 50,
        maxSamples: 50,
    };

    let mouseSamples = [];
    let scrollSamples = [];
    let clicks = [];
    let lastMousePos = null;
    let lastMouseTime = null;
    let lastScrollPos = null;
    let lastScrollTime = null;

    // Track mouse movements
    document.addEventListener('mousemove', (e) => {
        if (mouseSamples.length >= CONFIG.maxSamples) return;

        const now = Date.now();
        if (lastMousePos && lastMouseTime) {
            const dt = now - lastMouseTime;
            if (dt >= CONFIG.sampleIntervalMs) {
                const dx = e.clientX - lastMousePos.x;
                const dy = e.clientY - lastMousePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speed = distance / dt;
                
                // Calculate trajectory angle in radians
                const angle = Math.atan2(dy, dx);

                mouseSamples.push({
                    speed: speed,
                    angle: angle,
                    dt: dt
                });

                lastMousePos = { x: e.clientX, y: e.clientY };
                lastMouseTime = now;
            }
        } else {
            lastMousePos = { x: e.clientX, y: e.clientY };
            lastMouseTime = now;
        }
    });

    // Track scroll patterns
    document.addEventListener('scroll', () => {
        if (scrollSamples.length >= CONFIG.maxSamples) return;

        const now = Date.now();
        const currentScroll = window.scrollY;

        if (lastScrollPos !== null && lastScrollTime) {
            const dt = now - lastScrollTime;
            if (dt >= CONFIG.sampleIntervalMs) {
                const dy = Math.abs(currentScroll - lastScrollPos);
                const speed = dy / dt;

                scrollSamples.push({
                    speed: speed,
                    dt: dt
                });

                lastScrollPos = currentScroll;
                lastScrollTime = now;
            }
        } else {
            lastScrollPos = currentScroll;
            lastScrollTime = now;
        }
    });

    // Track click dynamics and precision
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        // Calculate offset percentage from the center of the target element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceToCenter = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );

        clicks.push({
            distanceToCenter: distanceToCenter,
            elementWidth: rect.width,
            elementHeight: rect.height,
            timestamp: Date.now()
        });

        // Trigger telemetry submission once we have an interaction point
        if (mouseSamples.length >= 10 || scrollSamples.length >= 5) {
            submitTelemetry();
        }
    });

    // Submit parsed telemetry vectors to the validation backend
    function submitTelemetry() {
        if (mouseSamples.length === 0 && scrollSamples.length === 0) return;

        // Extract a device token/IFA from localStorage or query params
        const urlParams = new URLSearchParams(window.location.search);
        const ifa = urlParams.get('ifa') || localStorage.getItem('cleanpath_ifa') || 'dev-browser-ifa-' + Math.floor(Math.random() * 1000000);
        
        // Cache IFA locally for future page lifecycle checks
        localStorage.setItem('cleanpath_ifa', ifa);

        const payload = {
            ifa: ifa,
            telemetry: {
                mouse: mouseSamples,
                scroll: scrollSamples,
                clicks: clicks
            }
        };

        // Reset local telemetry store to prevent double-submitting
        mouseSamples = [];
        scrollSamples = [];
        clicks = [];

        fetch(CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'dev-api-key-change-in-production' // System credentials
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            console.log('[CleanPath Pulse SDK] Verification result:', data);
        })
        .catch(err => {
            console.warn('[CleanPath Pulse SDK] Verification failed:', err);
        });
    }

    // Auto-submit telemetry on page exit if gathered
    window.addEventListener('beforeunload', submitTelemetry);
})();
