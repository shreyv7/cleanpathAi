
import React, { useMemo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Dynamic import with SSR disabled because react-force-graph uses browser-only APIs (canvas)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface PathGraphProps {
    data?: {
        nodes: any[];
        links: any[];
    };
    width?: number;
    height?: number;
}

/**
 * Task 6.1: Integrate Graph Rendering Library
 * This component provides a canvas for visualizing supply chain topology.
 * Uses react-force-graph-2d for high-performance canvas rendering.
 */
export const PathGraph: React.FC<PathGraphProps> = ({ data, width, height }) => {
    const [containerWidth, setContainerWidth] = useState(800);
    const router = useRouter();

    useEffect(() => {
        const updateWidth = () => {
            const container = document.getElementById('graph-container');
            if (container) {
                setContainerWidth(container.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const graphData = useMemo(() => {
        if (data && data.nodes.length > 0) return data;

        // Return empty or placeholder data if nothing provided
        return { nodes: [], links: [] };
    }, [data]);

    return (
        <div
            id="graph-container"
            className="w-full h-[500px] rounded-2xl border border-white/5 bg-[#0D1117] overflow-hidden relative glass transition-all hover:border-white/10"
        >
            <div className="absolute top-6 left-8 z-10 pointer-events-none">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    Supply Path Topology
                </h3>
                <p className="text-white/40 mt-1">
                    Visualizing auction paths and intermediary hops.
                </p>
            </div>

            {/* Empty view or graph will render here */}
            {typeof window !== 'undefined' && (
                <ForceGraph2D
                    graphData={graphData}
                    width={width || containerWidth}
                    height={height || 500}
                    nodeAutoColorBy="label"
                    nodeLabel={(node: any) => `${node.label}: ${node.properties?.domain || node.id}`}
                    onNodeClick={(node: any) => {
                        const domain = node.properties?.domain || node.id;
                        if (domain) {
                            router.push(`/investigate/${encodeURIComponent(domain)}`);
                        }
                    }}
                    linkDirectionalArrowLength={6}
                    linkDirectionalArrowRelPos={1}
                    backgroundColor="#0D1117"
                />
            )}

            {!data || data.nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-white/20 font-mono italic">
                        [ No Graph Data Loaded ]
                    </p>
                </div>
            )}
        </div>
    );
};
