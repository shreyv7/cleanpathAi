import React, { useState } from 'react';
import { INITIAL_API_KEYS, getMockApiResponse, type ApiKey } from '@/lib/platformEngine';
import { Code, Terminal, Key, Plus, Check, RefreshCw } from 'lucide-react';

export const DeveloperConsole: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/v1/integrity/google_ad_manager');
    const [apiOutput, setApiOutput] = useState<string>(getMockApiResponse('/v1/integrity/google_ad_manager'));
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    const handleCreateKey = () => {
        const newKey: ApiKey = {
            id: `key_0${apiKeys.length + 1}`,
            name: `Partner SDK Ingest-${apiKeys.length + 1}`,
            keyPreview: `cp_live_...${Math.random().toString(36).substring(2, 7)}`,
            scope: 'read_only',
            status: 'ACTIVE',
            created: new Date().toISOString().split('T')[0]
        };
        setApiKeys([...apiKeys, newKey]);
    };

    const handleCopy = (id: string, keyPreview: string) => {
        navigator.clipboard.writeText(keyPreview);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 1500);
    };

    const handleTriggerEndpoint = (endpoint: string) => {
        setSelectedEndpoint(endpoint);
        setApiOutput(getMockApiResponse(endpoint));
    };

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-6 h-[420px]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Stripe-Grade Developer Command Console
                        </h2>
                        <p className="text-[10px] text-white/40">Expose programmatic route scores and fraud telemetry via APIs</p>
                    </div>
                </div>
            </div>

            {/* Layout Columns */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Side: Keys and Endpoints */}
                <div className="w-1/2 flex flex-col justify-between pr-3 border-r border-white/5">
                    {/* Keys list */}
                    <div className="flex flex-col gap-2 font-mono text-xs">
                        <div className="flex justify-between items-center text-[10px] text-white/30 uppercase mb-1">
                            <span>Active API credentials</span>
                            <button
                                onClick={handleCreateKey}
                                className="flex items-center gap-0.5 text-blue-400 hover:text-white transition-all cursor-pointer"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Create Key</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] pr-1 investigation-scroll">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="p-2 rounded bg-white/[0.01] border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                                    <div className="space-y-0.5">
                                        <span className="text-[10.5px] font-bold text-white/80">{key.name}</span>
                                        <div className="text-[9px] text-white/30">{key.keyPreview}</div>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(key.id, key.keyPreview)}
                                        className="p-1 rounded bg-white/5 border border-white/10 text-white/45 hover:text-white transition-all text-[8px] font-bold cursor-pointer"
                                    >
                                        {copiedKeyId === key.id ? <Check className="w-3 h-3 text-emerald-400" /> : 'COPY'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Endpoints Selectors */}
                    <div className="flex flex-col gap-1.5 font-mono text-[9.5px] pt-3 border-t border-white/5">
                        <span className="text-[9px] text-white/30 uppercase mb-1">Query Endpoint Explorer</span>
                        <button
                            onClick={() => handleTriggerEndpoint('/v1/integrity/google_ad_manager')}
                            className={`p-2 rounded border text-left font-bold transition-all truncate cursor-pointer ${
                                selectedEndpoint === '/v1/integrity/google_ad_manager'
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    : 'bg-[#03060a]/60 border-white/5 text-white/50 hover:text-white'
                            }`}
                        >
                            GET /v1/integrity/GAM_direct
                        </button>
                        <button
                            onClick={() => handleTriggerEndpoint('/v1/threat/hydra_families')}
                            className={`p-2 rounded border text-left font-bold transition-all truncate cursor-pointer ${
                                selectedEndpoint === '/v1/threat/hydra_families'
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    : 'bg-[#03060a]/60 border-white/5 text-white/50 hover:text-white'
                            }`}
                        >
                            GET /v1/threat/hydra_families
                        </button>
                    </div>
                </div>

                {/* Right Side: Request Inspector Console */}
                <div className="flex-1 bg-[#03060a]/90 border border-white/5 rounded-xl p-4 font-mono text-xs text-blue-300 relative overflow-hidden flex flex-col justify-between min-h-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

                    <div className="overflow-y-auto pr-1 flex-1 z-10 select-all whitespace-pre-wrap leading-relaxed">
                        {apiOutput}
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-blue-500/80 font-bold uppercase tracking-wider border-t border-white/5 pt-2.5 mt-3 shrink-0 z-10">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        <span>RESPONSE STATUS: 200 OK</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
