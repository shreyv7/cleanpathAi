import React, { useState } from 'react';
import { Radio, Terminal, Settings, Copy, Check, ShieldCheck, Play, HelpCircle } from 'lucide-react';

type DspType = 'ttd' | 'dv360' | 'xandr';

interface CodeSnippet {
    title: string;
    language: string;
    description: string;
    code: string;
}

const SNIPPETS: Record<DspType, CodeSnippet> = {
    ttd: {
        title: 'TTD custom pre-bid wrapper hook',
        language: 'javascript',
        description: 'Inject this custom JavaScript wrapper inside your TTD bidder script configurations. It intercepts inbound bid requests and queries the CleanPath Edge Gatekeeper.',
        code: `// TTD pre-bid bid filtering routine
const CLEANPATH_GATEKEEPER = "http://localhost:8000/api/decisions/process";
const API_KEY = "%API_KEY%";

async function evaluateTTDBidRequest(bidRequest) {
    const startTime = Date.now();
    try {
        const response = await fetch(CLEANPATH_GATEKEEPER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({
                id: bidRequest.id,
                site: {
                    publisher: {
                        id: bidRequest.publisherId,
                        domain: bidRequest.domain
                    },
                    domain: bidRequest.domain
                },
                impressions: bidRequest.impressions,
                device: {
                    type: bidRequest.deviceType,
                    ua: navigator.userAgent
                },
                ctv: bidRequest.ctv || null
            }),
            timeout: 15 // Tight 15ms cutoff for pre-bid verification
        });

        if (response.ok) {
            const decision = await response.json();
            if (decision.decision.decision === 'BLOCK') {
                return { action: 'SUPPRESS_BID', reason: decision.decision.blockReason };
            } else if (decision.decision.decision === 'ALLOW') {
                return { action: 'PROCEED', shadedCPM: decision.decision.price };
            }
        }
    } catch (e) {
        // Fall-open safety fallback
        console.warn("CleanPath Timeout - Fail-Open Triggered");
    }
    return { action: 'PROCEED' };
}`
    },
    dv360: {
        title: 'DV360 Custom Bidding Script (Python Payload Ingest)',
        language: 'python',
        description: 'Upload this Python algorithm block into your Google DV360 Custom Bidding Workspace. It runs path calculations and dynamically weights publisher bid streams.',
        code: `# DV360 Custom Bidding Algorithm
import requests

CLEANPATH_API = "http://localhost:3000/api/financial/working-media/"
API_KEY = "%API_KEY%"

def get_publisher_weight(domain, campaign_id="campaign-1"):
    try:
        headers = {"X-API-Key": API_KEY}
        # Query aggregate working media performance
        res = requests.get(f"{CLEANPATH_API}{campaign_id}", headers=headers, timeout=0.02)
        if res.status_code == 200:
            data = res.json()
            # Suppress bid weights if working media falls below threshold
            if data.get("workingMediaPercent", 100) < 70.0:
                return 0.0 # Suppress bid completely
            return data.get("workingMediaPercent", 100) / 100.0
    except Exception:
        pass
    return 1.0 # Fail-open default weight

def main(bid_request):
    weight = get_publisher_weight(bid_request.domain)
    return bid_request.base_bid * weight`
    },
    xandr: {
        title: 'Xandr APB Pre-Bid Filter Payload',
        language: 'json',
        description: 'Registers a real-time HTTP server decision wrapper on Xandr Seat APB integrations, applying bid suppression algorithms at the pre-bid exchange level.',
        code: `{
  "integration_mode": "pre-bid-apb",
  "endpoint": "http://localhost:8000/api/decisions/process",
  "seat_id": "xandr-seat-4029-cleanpath",
  "auth_token": "%API_KEY%",
  "latency_parameters": {
    "target_limit_ms": 15,
    "fail_open_action": "ALLOW",
    "record_timeout_logs": true
  },
  "filtering_rules": {
    "mfa_thermal_suppression": true,
    "ctv_emulator_block": true,
    "bid_shading_enabled": true
  }
}`
    }
};

export const PreBidDSPIntegrator: React.FC = () => {
    const [activeDsp, setActiveDsp] = useState<DspType>('ttd');
    const [apiKey, setApiKey] = useState<string>('dev-api-key-change-in-production');
    const [copied, setCopied] = useState<boolean>(false);
    const [maxLatency, setMaxLatency] = useState<number>(15);
    const [failOpen, setFailOpen] = useState<boolean>(true);

    const activeSnippet = SNIPPETS[activeDsp];
    const interpolatedCode = activeSnippet.code.replace(/%API_KEY%/g, apiKey);

    const generateNewToken = () => {
        const randHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setApiKey(`cp_key_${randHex}`);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(interpolatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="card-elevated gap-5  font-mono text-xs select-none">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            DSP Pre-Bid Integration Hub
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Inject active pre-bid wrapper configurations inside your programmatic DSP seats</p>
                    </div>
                </div>
                
                {/* Live indicators */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 dark:bg-[#03060a]/90 dark:border-emerald-500/20 px-2 py-0.5 rounded text-[8.5px] text-emerald-700 dark:text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 infra-pulse" />
                        <span>GATEKEEPER LIVE</span>
                    </div>
                </div>
            </div>

            {/* Selector Row */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 pb-3 shrink-0">
                {(['ttd', 'dv360', 'xandr'] as DspType[]).map((dsp) => {
                    const isActive = activeDsp === dsp;
                    const labels = { ttd: 'The Trade Desk', dv360: 'Google DV360', xandr: 'Xandr APB' };
                    return (
                        <button
                            key={dsp}
                            onClick={() => setActiveDsp(dsp)}
                            className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase transition-all duration-300 cursor-pointer ${
                                isActive 
                                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-755 dark:text-white shadow-sm' 
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350 dark:bg-white/[0.01] dark:border-white/5 dark:text-white/40 dark:hover:text-white dark:hover:border-white/10'
                            }`}
                        >
                            {labels[dsp]}
                        </button>
                    );
                })}
            </div>

            {/* Layout Wrapper */}
            <div className="flex-1 flex gap-5 min-h-0">
                {/* Left Side: Snippet Code Container */}
                <div className="flex-1 bg-[#03060a] dark:bg-[#03060a]/90 border border-slate-950 dark:border-white/5 rounded-xl p-3 flex flex-col justify-between min-h-0 relative">
                    <div className="flex justify-between items-center text-[8.5px] border-b border-white/5 pb-2 mb-2 shrink-0">
                        <span className="text-white/40">{activeSnippet.title} ({activeSnippet.language})</span>
                        
                        <button 
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 dark:text-white/50 dark:hover:text-white transition-all cursor-pointer text-[8px]"
                        >
                            {copied ? <Check className="w-3 h-3 text-emerald-455" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                        </button>
                    </div>

                    <pre className="flex-1 overflow-auto font-mono text-[9px] leading-relaxed text-blue-200 dark:text-blue-300/90 pr-2 select-text selection:bg-blue-500/30">
                        <code>{interpolatedCode}</code>
                    </pre>
                </div>

                {/* Right Side: Configurations Panel */}
                <div className="w-72 border border-slate-200 bg-slate-50/50 dark:border-white/5 dark:bg-[#03060a]/30 rounded-xl p-4 flex flex-col justify-between shrink-0 select-none">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-800 dark:text-white/80 uppercase">
                            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-white/50" />
                            <span>Configuration Overrides</span>
                        </div>

                        {/* latency slider */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[9px] text-slate-500 dark:text-white/40 font-medium">
                                <span>Edge Latency Cutoff:</span>
                                <span className="text-slate-900 dark:text-white font-bold">{maxLatency}ms</span>
                            </div>
                            <input
                                type="range"
                                min={5}
                                max={50}
                                value={maxLatency}
                                onChange={(e) => setMaxLatency(parseInt(e.target.value))}
                                className="accent-blue-500 h-1 bg-slate-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* fail open check */}
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-3">
                            <span className="text-[9px] text-slate-500 dark:text-white/40 font-medium">Fail-Open Safe Route:</span>
                            <button
                                onClick={() => setFailOpen(!failOpen)}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border transition-all cursor-pointer ${
                                    failOpen ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                                }`}
                            >
                                {failOpen ? 'ENABLED (Safe)' : 'DISABLED'}
                            </button>
                        </div>

                        {/* API keys entitlement */}
                        <div className="border-t border-slate-200 dark:border-white/5 pt-3 flex flex-col gap-1.5">
                            <span className="text-[9px] text-slate-500 dark:text-white/40 font-medium block">Authentication Entitlement Token:</span>
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    value={apiKey}
                                    readOnly
                                    className="flex-1 bg-slate-100 dark:bg-[#03060a] border border-slate-300 dark:border-white/10 rounded p-1 text-slate-800 dark:text-white text-[8.5px] font-mono focus:outline-none"
                                />
                                <button
                                    onClick={generateNewToken}
                                    className="px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:border-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 text-[8px] font-bold uppercase transition-all cursor-pointer"
                                >
                                    GEN
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Threat suppression capability audit */}
                    <div className="border-t border-slate-200 dark:border-white/5 pt-3 text-[8.5px] font-mono leading-normal text-slate-500 dark:text-white/45 space-y-1 font-medium">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-700 dark:text-white/70 uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            <span>SUPPRESSION CAPABILITIES</span>
                        </div>
                        <p>• Multi-Hop Arbitrage Filter: ACTIVE</p>
                        <p>• Connected TV Spoof Guard: ACTIVE</p>
                        <p>• Real-time Pacing Engine: ACTIVE</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
