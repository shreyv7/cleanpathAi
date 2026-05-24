import React, { useRef, useEffect, useState, useCallback } from 'react';
import { type GraphNode, type GraphEdge } from '@/data/investigationData';
import { ZoomIn, ZoomOut, Maximize2, Focus } from 'lucide-react';

interface ForensicsGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    onNodeClick?: (node: GraphNode) => void;
}

const NODE_COLORS: Record<string, string> = {
    dsp: '#3B82F6',
    ssp: '#8B5CF6',
    exchange: '#F59E0B',
    publisher: '#EF4444',
    reseller: '#F97316',
    gatekeeper: '#10B981',
};

const EDGE_COLORS: Record<string, string> = {
    BID_FLOW: '#3B82F680',
    FEE_EXTRACT: '#F59E0B80',
    DUPLICATE: '#EF444480',
    REROUTE: '#10B98180',
    TRUST_DECAY: '#EF4444B0',
};

export const ForensicsGraph: React.FC<ForensicsGraphProps> = ({ nodes, edges, onNodeClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const animFrameRef = useRef<number>(0);
    const particleOffsetRef = useRef(0);
    const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
    const mouseRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });

    // Layout nodes in a force-directed-ish arrangement
    const layoutNodes = useCallback((width: number, height: number) => {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.32;

        nodes.forEach((node, i) => {
            const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            // Gatekeeper in center
            if (node.type === 'gatekeeper') {
                nodePositionsRef.current.set(node.id, { x: cx, y: cy });
            } else {
                const r = node.type === 'publisher' ? radius * 1.15 : radius * (0.7 + (i % 3) * 0.2);
                nodePositionsRef.current.set(node.id, {
                    x: cx + Math.cos(angle) * r,
                    y: cy + Math.sin(angle) * r,
                });
            }
        });
    }, [nodes]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = container.clientWidth;
        const h = container.clientHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.scale(dpr, dpr);

        if (nodePositionsRef.current.size === 0) {
            layoutNodes(w, h);
        }

        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        // Draw edges
        edges.forEach(edge => {
            const src = nodePositionsRef.current.get(edge.source);
            const tgt = nodePositionsRef.current.get(edge.target);
            if (!src || !tgt) return;

            // Edge line
            ctx.beginPath();
            ctx.moveTo(src.x, src.y);
            ctx.lineTo(tgt.x, tgt.y);
            ctx.strokeStyle = edge.suspicious ? '#EF4444' + '60' : (EDGE_COLORS[edge.type] || '#ffffff20');
            ctx.lineWidth = Math.max(1, edge.weight * 2.5);
            ctx.stroke();

            // Particle flow animation
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const numParticles = Math.max(2, Math.floor(dist / 60));

            for (let p = 0; p < numParticles; p++) {
                const t = ((particleOffsetRef.current * (edge.suspicious ? 3 : 1.5) + p * (1 / numParticles)) % 1);
                const px = src.x + dx * t;
                const py = src.y + dy * t;

                ctx.beginPath();
                ctx.arc(px, py, edge.suspicious ? 2.5 : 1.8, 0, Math.PI * 2);
                ctx.fillStyle = edge.suspicious ? '#EF4444' : (EDGE_COLORS[edge.type]?.replace('80', 'FF') || '#3B82F6');
                ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * Math.PI);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Arrow head
            const arrowSize = 8;
            const angle = Math.atan2(dy, dx);
            const arrowX = tgt.x - Math.cos(angle) * 24;
            const arrowY = tgt.y - Math.sin(angle) * 24;

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - arrowSize * Math.cos(angle - 0.4), arrowY - arrowSize * Math.sin(angle - 0.4));
            ctx.lineTo(arrowX - arrowSize * Math.cos(angle + 0.4), arrowY - arrowSize * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fillStyle = edge.suspicious ? '#EF444490' : '#ffffff30';
            ctx.fill();
        });

        // Draw nodes
        nodes.forEach(node => {
            const pos = nodePositionsRef.current.get(node.id);
            if (!pos) return;

            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNode?.id === node.id;
            const color = NODE_COLORS[node.type] || '#ffffff';
            const radius = node.type === 'gatekeeper' ? 22 : node.type === 'publisher' ? 18 : 14;

            // Glow ring for suspicious/selected
            if (isSelected || node.riskScore > 70) {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius + 8, 0, Math.PI * 2);
                ctx.strokeStyle = node.riskScore > 70 ? '#EF444440' : '#3B82F640';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Outer ring
            if (isHovered) {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = color + '60';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Node body
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(1, color + '15');
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = color + '80';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Inner dot
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Label
            ctx.font = '10px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = isHovered ? '#ffffff' : '#ffffff90';
            ctx.fillText(node.label, pos.x, pos.y + radius + 14);

            // Type badge
            ctx.font = '8px ui-monospace, monospace';
            ctx.fillStyle = '#ffffff40';
            ctx.fillText(node.type.toUpperCase(), pos.x, pos.y + radius + 24);
        });

        ctx.restore();

        // Hovered node tooltip
        if (hoveredNode) {
            const pos = nodePositionsRef.current.get(hoveredNode.id);
            if (pos) {
                const tx = pos.x * zoom + offset.x + 30;
                const ty = pos.y * zoom + offset.y - 20;
                const tooltipW = 200;
                const tooltipH = 100;

                ctx.fillStyle = '#0D1117F0';
                ctx.strokeStyle = '#ffffff15';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(tx, ty, tooltipW, tooltipH);
                ctx.fill();
                ctx.stroke();

                ctx.font = 'bold 11px ui-sans-serif, system-ui';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.fillText(hoveredNode.domain, tx + 12, ty + 20);

                ctx.font = '10px ui-monospace, monospace';
                ctx.fillStyle = '#ffffff60';
                ctx.fillText(`Risk Score: ${hoveredNode.riskScore}`, tx + 12, ty + 38);
                ctx.fillText(`Avg CPM: $${hoveredNode.avgCpm.toFixed(2)}`, tx + 12, ty + 54);
                ctx.fillText(`Volume: ${hoveredNode.bidVolume.toLocaleString()}`, tx + 12, ty + 70);
                ctx.fillText(`Trust: ${hoveredNode.trustLevel.toUpperCase()}`, tx + 12, ty + 86);
            }
        }

        particleOffsetRef.current += 0.004;
        animFrameRef.current = requestAnimationFrame(draw);
    }, [nodes, edges, zoom, offset, hoveredNode, selectedNode, layoutNodes]);

    useEffect(() => {
        animFrameRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [draw]);

    // Mouse handlers
    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left - offset.x) / zoom;
        const my = (e.clientY - rect.top - offset.y) / zoom;
        mouseRef.current = { x: mx, y: my };

        if (isDraggingRef.current) {
            setOffset(prev => ({
                x: prev.x + (e.clientX - lastMouseRef.current.x),
                y: prev.y + (e.clientY - lastMouseRef.current.y),
            }));
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
            return;
        }

        // Hit test
        let found: GraphNode | null = null;
        for (const node of nodes) {
            const pos = nodePositionsRef.current.get(node.id);
            if (!pos) continue;
            const dx = mx - pos.x;
            const dy = my - pos.y;
            const r = node.type === 'gatekeeper' ? 22 : node.type === 'publisher' ? 18 : 14;
            if (dx * dx + dy * dy < (r + 6) * (r + 6)) {
                found = node;
                break;
            }
        }
        setHoveredNode(found);
        if (canvas) canvas.style.cursor = found ? 'pointer' : isDraggingRef.current ? 'grabbing' : 'grab';
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (hoveredNode) {
            setSelectedNode(hoveredNode);
            onNodeClick?.(hoveredNode);
        } else {
            isDraggingRef.current = true;
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.92 : 1.08;
        setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-[#060810] rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="absolute top-4 left-5 z-10 pointer-events-none">
                <h3 className="text-sm font-bold text-white/80 tracking-tight">Supply Path Reconstruction</h3>
                <p className="text-[10px] text-white/25 mt-0.5">Live traffic flow • {nodes.length} nodes • {edges.length} relationships</p>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                    <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} className="p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                    <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                    <Focus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Edge Legend */}
            <div className="absolute bottom-4 left-5 z-10 flex items-center gap-4">
                {Object.entries({ 'Bid Flow': '#3B82F6', 'Fee Extract': '#F59E0B', 'Duplicate': '#EF4444', 'Reroute': '#10B981', 'Trust Decay': '#EF4444' }).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[9px] text-white/25 font-mono">{label}</span>
                    </div>
                ))}
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            />
        </div>
    );
};
