import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

interface SimulationStep {
    time: string;
    stage: string;
    description: string;
    magniteTrust: number;
    openxTrust: number;
    leakage: number;
    toxicity: number;
}

const PLAYBACK_STEPS: SimulationStep[] = [
    {
        time: '14:02:10',
        stage: 'Baseline Ingress',
        description: 'Normal traffic routes verified across NA/EMEA pipelines. Brand safety 98.4%.',
        magniteTrust: 96,
        openxTrust: 92,
        leakage: 0,
        toxicity: 4
    },
    {
        time: '14:15:32',
        stage: 'Emulator Signature Cloned',
        description: 'First anomalies registered in LATAM. 4 duplicate Roku device hashes detected.',
        magniteTrust: 91,
        openxTrust: 90,
        leakage: 42,
        toxicity: 12
    },
    {
        time: '14:28:05',
        stage: 'Reseller Path Inflation',
        description: 'Attack vectors scale. 18 duplicate reseller pathways opened on Magnite SSP.',
        magniteTrust: 74,
        openxTrust: 86,
        leakage: 184,
        toxicity: 28
    },
    {
        time: '14:40:00',
        stage: 'Spoofing Peak Escalation',
        description: 'High-density CTV emulator farm targeting Hulu and Magnite linear channels.',
        magniteTrust: 52,
        openxTrust: 71,
        leakage: 395,
        toxicity: 64
    },
    {
        time: '14:52:12',
        stage: 'Auto-Mitigation Active',
        description: 'Gatekeeper active. Consolidating paths directly to verified PMP exchanges.',
        magniteTrust: 78,
        openxTrust: 84,
        leakage: 227,
        toxicity: 38
    }
];

export const AttackPlaybackSimulator: React.FC = () => {
    const [stepIdx, setStepIdx] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying) {
            interval = setInterval(() => {
                setStepIdx((prev) => {
                    if (prev >= PLAYBACK_STEPS.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 3000); // 3 seconds per step
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying]);

    const activeStep = PLAYBACK_STEPS[stepIdx];

    const handleRestart = () => {
        setIsPlaying(false);
        setStepIdx(0);
    };

    return (
        <div className="glass rounded-2xl p-6 border border-white/5 bg-[#080B10]/80 relative overflow-hidden flex flex-col gap-4 h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-400" />
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            Operational Intelligence Playback
                        </h2>
                        <p className="text-[10px] text-white/40">Replay, pause, and analyze attack emergence timelines</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isPlaying
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                        }`}
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleRestart}
                        className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white/70 transition-all cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main simulation visual card */}
            <div className="flex-1 bg-[#03060a]/90 border border-white/5 rounded-xl p-4 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
                {/* Steps Timeline Header */}
                <div className="flex justify-between items-center text-[10px] font-mono text-white/30 border-b border-white/5 pb-2">
                    <span>STEP {stepIdx + 1} OF {PLAYBACK_STEPS.length}</span>
                    <span>TIMESTAMP: {activeStep.time}</span>
                </div>

                {/* Progress Pipeline Visualization */}
                <div className="flex items-center justify-between gap-2 my-2 font-mono text-[9px]">
                    {PLAYBACK_STEPS.map((step, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setIsPlaying(false); setStepIdx(idx); }}
                            className={`flex-1 h-2 rounded transition-all duration-300 ${
                                idx <= stepIdx
                                    ? idx === stepIdx && isPlaying
                                        ? 'bg-red-500 shadow-[0_0_4px_#ef4444] animate-pulse'
                                        : 'bg-blue-500'
                                    : 'bg-white/5'
                            }`}
                            title={step.stage}
                        />
                    ))}
                </div>

                {/* Stage title */}
                <div className="space-y-1 font-mono">
                    <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Stage: {activeStep.stage}</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans pl-3 pt-0.5">
                        {activeStep.description}
                    </p>
                </div>

                {/* Matrix Metrics */}
                <div className="grid grid-cols-2 gap-3 font-mono text-[10.5px] border-t border-white/5 pt-3.5">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-white/30">
                            <span>Magnite Trust</span>
                            <span className={activeStep.magniteTrust > 80 ? 'text-emerald-400' : 'text-red-400'}>
                                {activeStep.magniteTrust}%
                            </span>
                        </div>
                        <div className="flex justify-between text-white/30">
                            <span>OpenX Trust</span>
                            <span className={activeStep.openxTrust > 80 ? 'text-emerald-400' : 'text-red-400'}>
                                {activeStep.openxTrust}%
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-white/30">
                            <span>Leakage Rate</span>
                            <span className={activeStep.leakage > 100 ? 'text-red-400 font-bold' : 'text-white/60'}>
                                ${activeStep.leakage}/min
                            </span>
                        </div>
                        <div className="flex justify-between text-white/30">
                            <span>Graph Toxicity</span>
                            <span className={activeStep.toxicity > 40 ? 'text-red-400' : 'text-white/60'}>
                                {activeStep.toxicity}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
