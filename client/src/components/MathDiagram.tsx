/**
 * MathDiagram — renders SVG diagrams from JSON descriptions.
 *
 * Supported diagram types:
 *   triangle, polygon, circle, angle, number-line,
 *   coordinate, grid, venn, bar-chart
 */

interface DiagramProps {
  diagram: DiagramData;
  className?: string;
}

// ─── Type definitions ────────────────────────────────────────────────────────

export type DiagramData =
  | TriangleDiagram
  | PolygonDiagram
  | CircleDiagram
  | AngleDiagram
  | NumberLineDiagram
  | CoordinateDiagram
  | GridDiagram
  | VennDiagram
  | BarChartDiagram;

interface TriangleDiagram {
  type: "triangle";
  vertices: [number, number][];
  labels?: { vertices?: string[]; sides?: string[]; angles?: string[] };
  showRightAngle?: number; // vertex index
}

interface PolygonDiagram {
  type: "polygon";
  vertices: [number, number][];
  labels?: { vertices?: string[]; sides?: string[] };
}

interface CircleDiagram {
  type: "circle";
  center: [number, number];
  radius: number;
  labels?: { center?: string; radius?: string; points?: { pos: [number, number]; label: string }[] };
  showRadius?: boolean;
  showDiameter?: boolean;
  sectors?: { startAngle: number; endAngle: number; color?: string }[];
}

interface AngleDiagram {
  type: "angle";
  vertex: [number, number];
  ray1End: [number, number];
  ray2End: [number, number];
  label?: string;
  showArc?: boolean;
}

interface NumberLineDiagram {
  type: "number-line";
  min: number;
  max: number;
  step: number;
  points?: { value: number; label?: string; color?: string }[];
  highlights?: { from: number; to: number; color?: string }[];
}

interface CoordinateDiagram {
  type: "coordinate";
  xRange: [number, number];
  yRange: [number, number];
  points?: { pos: [number, number]; label?: string; color?: string }[];
  lines?: { from: [number, number]; to: [number, number]; color?: string; dashed?: boolean }[];
  shapes?: { type: "polygon"; vertices: [number, number][]; color?: string }[];
}

interface GridDiagram {
  type: "grid";
  rows: number;
  cols: number;
  filled?: [number, number][]; // [row, col] of filled cells
  labels?: { pos: [number, number]; text: string }[];
  cellSize?: number;
}

interface VennDiagram {
  type: "venn";
  sets: { label: string; values?: string[] }[];
  intersection?: string[];
}

interface BarChartDiagram {
  type: "bar-chart";
  data: { label: string; value: number; color?: string }[];
  yLabel?: string;
  xLabel?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const W = 320;
const H = 240;
const PAD = 30;
const COLORS = {
  line: "hsl(var(--foreground))",
  fill: "hsl(var(--primary) / 0.15)",
  accent: "hsl(var(--primary))",
  text: "hsl(var(--foreground))",
  muted: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--border))",
};

// ─── Main component ─────────────────────────────────────────────────────────

export function MathDiagram({ diagram, className }: DiagramProps) {
  return (
    <div className={`flex justify-center my-4 ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="max-w-md w-full"
        style={{ maxHeight: 280 }}
      >
        <DiagramRenderer diagram={diagram} />
      </svg>
    </div>
  );
}

function DiagramRenderer({ diagram }: { diagram: DiagramData }) {
  switch (diagram.type) {
    case "triangle": return <TriangleRenderer d={diagram} />;
    case "polygon": return <PolygonRenderer d={diagram} />;
    case "circle": return <CircleRenderer d={diagram} />;
    case "angle": return <AngleRenderer d={diagram} />;
    case "number-line": return <NumberLineRenderer d={diagram} />;
    case "coordinate": return <CoordinateRenderer d={diagram} />;
    case "grid": return <GridRenderer d={diagram} />;
    case "venn": return <VennRenderer d={diagram} />;
    case "bar-chart": return <BarChartRenderer d={diagram} />;
    default: return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scalePoints(vertices: [number, number][]): [number, number][] {
  const xs = vertices.map(v => v[0]);
  const ys = vertices.map(v => v[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scale = Math.min((W - 2 * PAD) / rangeX, (H - 2 * PAD) / rangeY);
  const offX = (W - rangeX * scale) / 2;
  const offY = (H - rangeY * scale) / 2;
  // Flip Y axis
  return vertices.map(([x, y]) => [
    offX + (x - minX) * scale,
    H - offY - (y - minY) * scale,
  ]);
}

function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function offsetLabel(mid: [number, number], center: [number, number], dist = 14): [number, number] {
  const dx = mid[0] - center[0];
  const dy = mid[1] - center[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [mid[0] + (dx / len) * dist, mid[1] + (dy / len) * dist];
}

// ─── Triangle ────────────────────────────────────────────────────────────────

function TriangleRenderer({ d }: { d: TriangleDiagram }) {
  const pts = scalePoints(d.vertices);
  const pointsStr = pts.map(p => p.join(",")).join(" ");
  const center: [number, number] = [
    pts.reduce((s, p) => s + p[0], 0) / 3,
    pts.reduce((s, p) => s + p[1], 0) / 3,
  ];

  return (
    <g>
      <polygon points={pointsStr} fill={COLORS.fill} stroke={COLORS.line} strokeWidth={2} />
      {/* Vertex labels */}
      {d.labels?.vertices?.map((label, i) => {
        const [lx, ly] = offsetLabel(pts[i], center, 18);
        return <text key={`v${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill={COLORS.text} fontSize={13} fontWeight={600}>{label}</text>;
      })}
      {/* Side labels */}
      {d.labels?.sides?.map((label, i) => {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const mid2 = midpoint(a, b);
        const [lx, ly] = offsetLabel(mid2, center, 16);
        return <text key={`s${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill={COLORS.accent} fontSize={12}>{label}</text>;
      })}
      {/* Angle labels */}
      {d.labels?.angles?.map((label, i) => {
        const [lx, ly] = offsetLabel(pts[i], center, -20);
        return <text key={`a${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill={COLORS.muted} fontSize={11}>{label}</text>;
      })}
      {/* Right angle marker */}
      {d.showRightAngle !== undefined && (() => {
        const vi = d.showRightAngle!;
        const p = pts[vi];
        const prev = pts[(vi + pts.length - 1) % pts.length];
        const next = pts[(vi + 1) % pts.length];
        const size = 12;
        const d1x = (prev[0] - p[0]), d1y = (prev[1] - p[1]);
        const d2x = (next[0] - p[0]), d2y = (next[1] - p[1]);
        const len1 = Math.sqrt(d1x * d1x + d1y * d1y) || 1;
        const len2 = Math.sqrt(d2x * d2x + d2y * d2y) || 1;
        const u1: [number, number] = [d1x / len1 * size, d1y / len1 * size];
        const u2: [number, number] = [d2x / len2 * size, d2y / len2 * size];
        return (
          <polyline
            points={`${p[0] + u1[0]},${p[1] + u1[1]} ${p[0] + u1[0] + u2[0]},${p[1] + u1[1] + u2[1]} ${p[0] + u2[0]},${p[1] + u2[1]}`}
            fill="none" stroke={COLORS.line} strokeWidth={1.5}
          />
        );
      })()}
    </g>
  );
}

// ─── Polygon ─────────────────────────────────────────────────────────────────

function PolygonRenderer({ d }: { d: PolygonDiagram }) {
  const pts = scalePoints(d.vertices);
  const pointsStr = pts.map(p => p.join(",")).join(" ");
  const center: [number, number] = [
    pts.reduce((s, p) => s + p[0], 0) / pts.length,
    pts.reduce((s, p) => s + p[1], 0) / pts.length,
  ];

  return (
    <g>
      <polygon points={pointsStr} fill={COLORS.fill} stroke={COLORS.line} strokeWidth={2} />
      {d.labels?.vertices?.map((label, i) => {
        const [lx, ly] = offsetLabel(pts[i], center, 18);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill={COLORS.text} fontSize={13} fontWeight={600}>{label}</text>;
      })}
      {d.labels?.sides?.map((label, i) => {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const mid2 = midpoint(a, b);
        const [lx, ly] = offsetLabel(mid2, center, 16);
        return <text key={`s${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill={COLORS.accent} fontSize={12}>{label}</text>;
      })}
    </g>
  );
}

// ─── Circle ──────────────────────────────────────────────────────────────────

function CircleRenderer({ d }: { d: CircleDiagram }) {
  const scale = Math.min(W - 2 * PAD, H - 2 * PAD) / (d.radius * 2.5);
  const cx = W / 2;
  const cy = H / 2;
  const r = d.radius * scale;

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={COLORS.fill} stroke={COLORS.line} strokeWidth={2} />
      {/* Sectors */}
      {d.sectors?.map((sector, i) => {
        const s = (sector.startAngle * Math.PI) / 180;
        const e = (sector.endAngle * Math.PI) / 180;
        const x1 = cx + r * Math.cos(s), y1 = cy - r * Math.sin(s);
        const x2 = cx + r * Math.cos(e), y2 = cy - r * Math.sin(e);
        const large = sector.endAngle - sector.startAngle > 180 ? 1 : 0;
        return (
          <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 0 ${x2},${y2} Z`}
            fill={sector.color ?? "hsl(var(--primary) / 0.3)"} stroke={COLORS.line} strokeWidth={1} />
        );
      })}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill={COLORS.line} />
      {d.labels?.center && (
        <text x={cx + 8} y={cy - 8} fill={COLORS.text} fontSize={12}>{d.labels.center}</text>
      )}
      {/* Radius line */}
      {d.showRadius && (
        <>
          <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={COLORS.accent} strokeWidth={1.5} strokeDasharray="4,3" />
          {d.labels?.radius && (
            <text x={cx + r / 2} y={cy - 8} textAnchor="middle" fill={COLORS.accent} fontSize={11}>{d.labels.radius}</text>
          )}
        </>
      )}
      {/* Diameter line */}
      {d.showDiameter && (
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={COLORS.accent} strokeWidth={1.5} strokeDasharray="4,3" />
      )}
      {/* Points on circle */}
      {d.labels?.points?.map((pt, i) => {
        const angle = (Math.atan2(-(pt.pos[1] - d.center[1]), pt.pos[0] - d.center[0]));
        const px = cx + r * Math.cos(angle);
        const py = cy - r * Math.sin(angle);
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={3} fill={COLORS.accent} />
            <text x={px + 10 * Math.cos(angle)} y={py - 10 * Math.sin(angle)} textAnchor="middle" fill={COLORS.text} fontSize={12}>{pt.label}</text>
          </g>
        );
      })}
    </g>
  );
}

// ─── Angle ───────────────────────────────────────────────────────────────────

function AngleRenderer({ d }: { d: AngleDiagram }) {
  const pts = scalePoints([d.vertex, d.ray1End, d.ray2End]);
  const [v, r1, r2] = pts;
  const arcR = 30;
  const a1 = Math.atan2(r1[1] - v[1], r1[0] - v[0]);
  const a2 = Math.atan2(r2[1] - v[1], r2[0] - v[0]);

  return (
    <g>
      <line x1={v[0]} y1={v[1]} x2={r1[0]} y2={r1[1]} stroke={COLORS.line} strokeWidth={2} />
      <line x1={v[0]} y1={v[1]} x2={r2[0]} y2={r2[1]} stroke={COLORS.line} strokeWidth={2} />
      {d.showArc !== false && (
        <path
          d={`M${v[0] + arcR * Math.cos(a1)},${v[1] + arcR * Math.sin(a1)} A${arcR},${arcR} 0 0 ${a2 > a1 ? 1 : 0} ${v[0] + arcR * Math.cos(a2)},${v[1] + arcR * Math.sin(a2)}`}
          fill="none" stroke={COLORS.accent} strokeWidth={1.5}
        />
      )}
      {d.label && (
        <text
          x={v[0] + (arcR + 12) * Math.cos((a1 + a2) / 2)}
          y={v[1] + (arcR + 12) * Math.sin((a1 + a2) / 2)}
          textAnchor="middle" dominantBaseline="central" fill={COLORS.accent} fontSize={13} fontWeight={600}
        >{d.label}</text>
      )}
      <circle cx={v[0]} cy={v[1]} r={3} fill={COLORS.line} />
    </g>
  );
}

// ─── Number Line ─────────────────────────────────────────────────────────────

function NumberLineRenderer({ d }: { d: NumberLineDiagram }) {
  const y = H / 2;
  const range = d.max - d.min || 1;
  const toX = (val: number) => PAD + ((val - d.min) / range) * (W - 2 * PAD);

  const ticks: number[] = [];
  for (let v = d.min; v <= d.max; v += d.step) ticks.push(v);

  return (
    <g>
      {/* Main line */}
      <line x1={PAD - 10} y1={y} x2={W - PAD + 10} y2={y} stroke={COLORS.line} strokeWidth={2} markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.line} />
        </marker>
      </defs>
      {/* Ticks */}
      {ticks.map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1={y - 6} x2={toX(v)} y2={y + 6} stroke={COLORS.line} strokeWidth={1.5} />
          <text x={toX(v)} y={y + 20} textAnchor="middle" fill={COLORS.text} fontSize={11}>{v}</text>
        </g>
      ))}
      {/* Highlighted ranges */}
      {d.highlights?.map((h, i) => (
        <line key={i} x1={toX(h.from)} y1={y} x2={toX(h.to)} y2={y}
          stroke={h.color ?? COLORS.accent} strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* Points */}
      {d.points?.map((p, i) => (
        <g key={i}>
          <circle cx={toX(p.value)} cy={y} r={5} fill={p.color ?? COLORS.accent} />
          {p.label && (
            <text x={toX(p.value)} y={y - 14} textAnchor="middle" fill={COLORS.accent} fontSize={12} fontWeight={600}>{p.label}</text>
          )}
        </g>
      ))}
    </g>
  );
}

// ─── Coordinate Plane ────────────────────────────────────────────────────────

function CoordinateRenderer({ d }: { d: CoordinateDiagram }) {
  const [xMin, xMax] = d.xRange;
  const [yMin, yMax] = d.yRange;
  const toX = (v: number) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const toY = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  return (
    <g>
      {/* Grid */}
      {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).map(x => (
        <line key={`gx${x}`} x1={toX(x)} y1={PAD} x2={toX(x)} y2={H - PAD} stroke={COLORS.grid} strokeWidth={0.5} />
      ))}
      {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map(y => (
        <line key={`gy${y}`} x1={PAD} y1={toY(y)} x2={W - PAD} y2={toY(y)} stroke={COLORS.grid} strokeWidth={0.5} />
      ))}
      {/* Axes */}
      {xMin <= 0 && xMax >= 0 && (
        <line x1={toX(0)} y1={PAD - 5} x2={toX(0)} y2={H - PAD + 5} stroke={COLORS.line} strokeWidth={1.5} />
      )}
      {yMin <= 0 && yMax >= 0 && (
        <line x1={PAD - 5} y1={toY(0)} x2={W - PAD + 5} y2={toY(0)} stroke={COLORS.line} strokeWidth={1.5} />
      )}
      {/* Axis labels */}
      {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).filter(x => x !== 0).map(x => (
        <text key={`lx${x}`} x={toX(x)} y={toY(0) + 16} textAnchor="middle" fill={COLORS.muted} fontSize={10}>{x}</text>
      ))}
      {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).filter(y => y !== 0).map(y => (
        <text key={`ly${y}`} x={toX(0) - 12} y={toY(y) + 4} textAnchor="middle" fill={COLORS.muted} fontSize={10}>{y}</text>
      ))}
      {/* Shapes */}
      {d.shapes?.map((shape, i) => {
        if (shape.type === "polygon") {
          const pts = shape.vertices.map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ");
          return <polygon key={i} points={pts} fill={shape.color ?? COLORS.fill} stroke={COLORS.accent} strokeWidth={1.5} />;
        }
        return null;
      })}
      {/* Lines */}
      {d.lines?.map((l, i) => (
        <line key={i} x1={toX(l.from[0])} y1={toY(l.from[1])} x2={toX(l.to[0])} y2={toY(l.to[1])}
          stroke={l.color ?? COLORS.accent} strokeWidth={1.5} strokeDasharray={l.dashed ? "5,4" : undefined} />
      ))}
      {/* Points */}
      {d.points?.map((p, i) => (
        <g key={i}>
          <circle cx={toX(p.pos[0])} cy={toY(p.pos[1])} r={4} fill={p.color ?? COLORS.accent} />
          {p.label && (
            <text x={toX(p.pos[0]) + 8} y={toY(p.pos[1]) - 8} fill={COLORS.text} fontSize={11} fontWeight={600}>{p.label}</text>
          )}
        </g>
      ))}
    </g>
  );
}

// ─── Grid ────────────────────────────────────────────────────────────────────

function GridRenderer({ d }: { d: GridDiagram }) {
  const cs = d.cellSize ?? Math.min((W - 2 * PAD) / d.cols, (H - 2 * PAD) / d.rows);
  const offX = (W - d.cols * cs) / 2;
  const offY = (H - d.rows * cs) / 2;
  const filledSet = new Set((d.filled ?? []).map(([r, c]) => `${r},${c}`));

  return (
    <g>
      {Array.from({ length: d.rows }, (_, r) =>
        Array.from({ length: d.cols }, (_, c) => (
          <rect key={`${r}-${c}`}
            x={offX + c * cs} y={offY + r * cs} width={cs} height={cs}
            fill={filledSet.has(`${r},${c}`) ? COLORS.accent : "none"}
            fillOpacity={filledSet.has(`${r},${c}`) ? 0.3 : 0}
            stroke={COLORS.line} strokeWidth={1}
          />
        ))
      )}
      {d.labels?.map((l, i) => (
        <text key={i}
          x={offX + l.pos[1] * cs + cs / 2} y={offY + l.pos[0] * cs + cs / 2}
          textAnchor="middle" dominantBaseline="central" fill={COLORS.text} fontSize={12} fontWeight={600}
        >{l.text}</text>
      ))}
    </g>
  );
}

// ─── Venn Diagram ────────────────────────────────────────────────────────────

function VennRenderer({ d }: { d: VennDiagram }) {
  const r = 70;
  const overlap = 30;

  if (d.sets.length === 2) {
    const cx1 = W / 2 - overlap;
    const cx2 = W / 2 + overlap;
    const cy = H / 2;

    return (
      <g>
        <circle cx={cx1} cy={cy} r={r} fill="hsl(210 80% 60% / 0.2)" stroke="hsl(210 80% 60%)" strokeWidth={2} />
        <circle cx={cx2} cy={cy} r={r} fill="hsl(0 80% 60% / 0.2)" stroke="hsl(0 80% 60%)" strokeWidth={2} />
        <text x={cx1 - 25} y={cy - r - 10} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600}>{d.sets[0].label}</text>
        <text x={cx2 + 25} y={cy - r - 10} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600}>{d.sets[1].label}</text>
        {/* Set values */}
        {d.sets[0].values?.map((v, i) => (
          <text key={`a${i}`} x={cx1 - 20} y={cy - 10 + i * 16} textAnchor="middle" fill={COLORS.text} fontSize={11}>{v}</text>
        ))}
        {d.sets[1].values?.map((v, i) => (
          <text key={`b${i}`} x={cx2 + 20} y={cy - 10 + i * 16} textAnchor="middle" fill={COLORS.text} fontSize={11}>{v}</text>
        ))}
        {d.intersection?.map((v, i) => (
          <text key={`i${i}`} x={W / 2} y={cy - 10 + i * 16} textAnchor="middle" fill={COLORS.accent} fontSize={11} fontWeight={600}>{v}</text>
        ))}
      </g>
    );
  }

  // Single set fallback
  return (
    <g>
      <circle cx={W / 2} cy={H / 2} r={r} fill={COLORS.fill} stroke={COLORS.line} strokeWidth={2} />
      <text x={W / 2} y={H / 2 - r - 10} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600}>{d.sets[0]?.label}</text>
    </g>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function BarChartRenderer({ d }: { d: BarChartDiagram }) {
  const maxVal = Math.max(...d.data.map(x => x.value), 1);
  const barW = Math.min(40, (W - 2 * PAD - 20) / d.data.length - 8);
  const chartH = H - 2 * PAD;
  const startX = PAD + 20;

  const defaultColors = ["#60a5fa", "#34d399", "#fbbf24", "#f97316", "#a855f7", "#ec4899", "#06b6d4"];

  return (
    <g>
      {/* Y axis */}
      <line x1={startX} y1={PAD} x2={startX} y2={H - PAD} stroke={COLORS.line} strokeWidth={1.5} />
      {/* X axis */}
      <line x1={startX} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={COLORS.line} strokeWidth={1.5} />
      {/* Y ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = H - PAD - frac * chartH;
        const val = Math.round(frac * maxVal);
        return (
          <g key={frac}>
            <line x1={startX - 4} y1={y} x2={startX} y2={y} stroke={COLORS.line} strokeWidth={1} />
            <text x={startX - 8} y={y + 4} textAnchor="end" fill={COLORS.muted} fontSize={10}>{val}</text>
          </g>
        );
      })}
      {/* Bars */}
      {d.data.map((item, i) => {
        const barH = (item.value / maxVal) * chartH;
        const x = startX + 15 + i * (barW + 8);
        const y = H - PAD - barH;
        const color = item.color ?? defaultColors[i % defaultColors.length];
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx={3} />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill={COLORS.text} fontSize={10} fontWeight={600}>{item.value}</text>
            <text x={x + barW / 2} y={H - PAD + 14} textAnchor="middle" fill={COLORS.muted} fontSize={9}>{item.label}</text>
          </g>
        );
      })}
      {/* Labels */}
      {d.yLabel && <text x={12} y={H / 2} textAnchor="middle" fill={COLORS.muted} fontSize={10} transform={`rotate(-90, 12, ${H / 2})`}>{d.yLabel}</text>}
    </g>
  );
}
