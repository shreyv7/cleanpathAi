import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldAlert, Sparkles, DollarSign, Calculator, HelpCircle } from 'lucide-react';

interface BillingPlan {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    cpmRate: number;
    features: string[];
    isPopular?: boolean;
}

const BILLING_PLANS: BillingPlan[] = [
    {
        id: 'plan_starter',
        name: 'Starter Pre-Bid Audit',
        description: 'For growing brands looking to audit major DSP pipelines',
        basePrice: 1999,
        cpmRate: 0.012,
        features: [
            'Up to 50M QPS pre-bid auditing',
            'Standard MFA Thermal classification',
            'TTD & DV360 connector hooks',
            'Daily Slack summary alerts'
        ]
    },
    {
        id: 'plan_growth',
        name: 'Growth Path Bypass',
        description: 'Active self-healing bidstream routing & shading controls',
        basePrice: 4999,
        cpmRate: 0.010,
        features: [
            'Up to 250M QPS low-latency bypass',
            'Self-Healing path bypass routing',
            'Advanced CTV Spoof Guard',
            'Standard API endpoints & keys'
        ],
        isPopular: true
    },
    {
        id: 'plan_enterprise',
        name: 'Enterprise Custom Premium',
        description: 'Full Palantir-grade economic treasury & real-time bid shading',
        basePrice: 9999,
        cpmRate: 0.008,
        features: [
            'Unlimited QPS pre-bid shading',
            'Real-Time Bid Shading algorithms',
            'Dedicated Redis caching pools',
            'SOC2 compliance verification & logs',
            '24/7 Priority Operations seat'
        ]
    }
];

export const DSPPluginBilling: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>('plan_enterprise');
    const [monthlySpend, setMonthlySpend] = useState<number>(2500000); // Default $2.5M
    const [integrationType, setIntegrationType] = useState<'ttd' | 'dv360' | 'xandr'>('ttd');
    const [showCustomQuote, setShowCustomQuote] = useState<boolean>(false);
    const [customQuoteStatus, setCustomQuoteStatus] = useState<string>('');

    // Compute plan parameters
    const plan = BILLING_PLANS.find(p => p.id === selectedPlan) || BILLING_PLANS[2];
    
    // Programmatic savings formula (programmatic waste ~ 18.4% average cost recovery)
    const expectedRecoveryRate = 0.184; 
    const grossSavings = monthlySpend * expectedRecoveryRate;
    
    // CPM calculations
    const estimatedCPMVolume = (monthlySpend / 5.0) * 1000; // Assume $5 average CPM
    const variableCPMCost = (estimatedCPMVolume / 1000) * plan.cpmRate;
    const totalSubscriptionCost = plan.basePrice + variableCPMCost;
    const netSavings = grossSavings - totalSubscriptionCost;
    const roiMultiplier = totalSubscriptionCost > 0 ? (grossSavings / totalSubscriptionCost).toFixed(1) : '0';

    const handleCustomPricingRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setCustomQuoteStatus('SUBMITTING');
        setTimeout(() => {
            setCustomQuoteStatus('SUCCESS');
        }, 1200);
    };

    return (
        <div className="bg-white border border-slate-200 dark:bg-[#080B10]/80 dark:border-white/5 shadow-sm hover:shadow-md rounded-2xl p-6 relative overflow-hidden flex flex-col gap-6 h-[420px] font-mono text-xs transition-all">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/90">
                            DSP Pre-Bid Subscription & Billing
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Activate low-latency bid filters, manage API seats, and verify ROI</p>
                    </div>
                </div>
                <span className="text-[9px] bg-emerald-50 border border-emerald-250 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 font-bold px-2 py-0.5 rounded shadow-sm">
                    ACTIVE SUBSCRIPTION
                </span>
            </div>

            {/* Layout Wrapper */}
            <div className="flex-1 flex gap-6 min-h-0">
                
                {/* Left Side: Plans Selection & Custom Pricing */}
                <div className="w-1/2 flex flex-col gap-3 pr-3 border-r border-slate-200 dark:border-white/5 justify-between">
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] pr-1 investigation-scroll">
                        <span className="text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest block mb-1 font-bold">SELECT PRE-BID PLAN</span>
                        {BILLING_PLANS.map(p => {
                            const isSelected = p.id === selectedPlan;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPlan(p.id)}
                                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                                        isSelected 
                                            ? 'bg-emerald-50 border border-emerald-250 text-emerald-950 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-white shadow-sm' 
                                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350 dark:bg-white/[0.01] dark:border-white/5 dark:text-white/50 dark:hover:text-white dark:hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-center w-full font-bold text-[10.5px]">
                                        <span>{p.name}</span>
                                        <span className="text-emerald-600 dark:text-emerald-400" suppressHydrationWarning={true}>${p.basePrice.toLocaleString()}/mo</span>
                                    </div>
                                    <div className="text-[9px] text-slate-500 dark:text-white/60 leading-normal font-sans pr-1">
                                        {p.description}
                                    </div>
                                    <div className="text-[8px] text-slate-450 dark:text-white/30 uppercase font-black tracking-widest mt-1">
                                        + ${p.cpmRate.toFixed(3)} CPM audited volume
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom pricing consultation CTA */}
                    <div className="pt-2 border-t border-slate-200 dark:border-white/5 shrink-0 select-none">
                        {!showCustomQuote ? (
                            <button
                                onClick={() => setShowCustomQuote(true)}
                                className="w-full p-2 rounded bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:border-purple-500/20 dark:text-purple-400 font-bold uppercase text-[9.5px] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Request Custom Pricing Schedule</span>
                            </button>
                        ) : (
                            <div className="p-2.5 rounded bg-purple-50 border border-purple-200 dark:bg-purple-950/10 dark:border-purple-500/20 flex flex-col gap-2 shadow-sm">
                                <div className="flex justify-between items-center text-[9px] text-purple-700 dark:text-purple-300 font-bold uppercase">
                                    <span>Custom Entitlements</span>
                                    <button onClick={() => setShowCustomQuote(false)} className="text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white font-bold">CLOSE</button>
                                </div>
                                {customQuoteStatus !== 'SUCCESS' ? (
                                    <form onSubmit={handleCustomPricingRequest} className="flex flex-col gap-1.5">
                                        <input
                                            type="email"
                                            placeholder="Enter corporate email..."
                                            required
                                            className="bg-slate-100 dark:bg-[#03060a] border border-slate-300 dark:border-white/10 rounded p-1.5 text-slate-800 dark:text-white text-[9.5px] focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={customQuoteStatus === 'SUBMITTING'}
                                            className="p-1.5 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-500/30 dark:text-purple-300 dark:hover:bg-purple-500/40 text-[9px] font-bold uppercase transition-all cursor-pointer"
                                        >
                                            {customQuoteStatus === 'SUBMITTING' ? 'Submitting...' : 'Send Custom Proposal'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 py-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Enterprise schedule request sent!</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Interactive Net Campaign ROI Simulator */}
                <div className="flex-1 bg-[#03060a] dark:bg-[#03060a]/90 border border-slate-950 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-0 select-none">
                    <div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-350 dark:text-emerald-400 uppercase font-black tracking-widest mb-3">
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Campaign ROI twin simulator</span>
                        </div>

                        {/* Slider inputs */}
                        <div className="flex flex-col gap-3 font-mono">
                            <div className="flex justify-between items-center text-[9.5px]">
                                <span className="text-white/40">Monthly Ad Spend:</span>
                                <span className="text-white font-bold">${(monthlySpend / 1000000).toFixed(2)}M</span>
                            </div>
                            <input
                                type="range"
                                min={100000}
                                max={10000000}
                                step={100000}
                                value={monthlySpend}
                                onChange={(e) => setMonthlySpend(parseInt(e.target.value))}
                                className="w-full accent-emerald-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                            />

                            <div className="flex justify-between items-center text-[9.5px] mt-1">
                                <span className="text-white/40">DSP Seat Partner:</span>
                                <div className="flex gap-1.5 font-bold">
                                    <button
                                        onClick={() => setIntegrationType('ttd')}
                                        className={`px-1.5 py-0.5 rounded border text-[8px] transition-all cursor-pointer ${
                                            integrationType === 'ttd' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-transparent border-white/5 text-white/35'
                                        }`}
                                    >
                                        TTD
                                    </button>
                                    <button
                                        onClick={() => setIntegrationType('dv360')}
                                        className={`px-1.5 py-0.5 rounded border text-[8px] transition-all cursor-pointer ${
                                            integrationType === 'dv360' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-transparent border-white/5 text-white/35'
                                        }`}
                                    >
                                        DV360
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sim Results */}
                    <div className="border-t border-white/5 pt-3 flex flex-col gap-2 mt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-[9px] uppercase">Gross Waste Recovered:</span>
                            <span className="text-emerald-350 dark:text-emerald-400 font-extrabold text-xs" suppressHydrationWarning={true}>+${Math.floor(grossSavings).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-[9px] uppercase">License & CPM Cost:</span>
                            <span className="text-red-400 font-bold" suppressHydrationWarning={true}>-${Math.floor(totalSubscriptionCost).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-dashed border-white/5 pt-1.5 mt-0.5">
                            <span className="text-white font-bold text-[9.5px] uppercase">Net ROI Savings:</span>
                            <div className="text-right">
                                <div className="text-emerald-350 dark:text-emerald-400 font-black text-sm select-all" suppressHydrationWarning={true}>${Math.floor(netSavings).toLocaleString()}</div>
                                <div className="text-[7.5px] text-emerald-350/60 dark:text-emerald-400/60 font-bold uppercase tracking-wider">{roiMultiplier}x ROI Multiplier</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
