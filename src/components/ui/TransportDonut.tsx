import { ExpenseRow } from "@/pages/types";
import { useState } from "react";

function TransportDonut({
  data,
  colors,
}: {
  data: ExpenseRow[];
  colors: string[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 80, cy = 80, R = 62, r = 44, GAP = 0.04;

  // Build arc paths
  const arcs: { d: string; color: string; item: ExpenseRow; i: number }[] = [];
  let angle = -Math.PI / 2;
  data.forEach((item, i) => {
    const frac = total > 0 ? item.value / total : 0;
    const sweep = frac * 2 * Math.PI - GAP;
    const a1 = angle + GAP / 2;
    const a2 = a1 + sweep;
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    const x3 = cx + r * Math.cos(a2), y3 = cy + r * Math.sin(a2);
    const x4 = cx + r * Math.cos(a1), y4 = cy + r * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;
    arcs.push({
      d: `M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${x3},${y3} A${r},${r},0,${large},0,${x4},${y4} Z`,
      color: colors[i % colors.length],
      item,
      i,
    });
    angle += frac * 2 * Math.PI;
  });

  const activeItem = hovered !== null ? data[hovered] : null;

  return (
    <div className="flex items-center gap-5 flex-nowrap min-w-0">
      {/* Donut */}
      <svg
        width={160}
        height={160}
        viewBox="0 0 160 160"
        className="shrink-0"
      >
        {arcs.map(({ d, color, i }) => (
          <path
            key={i}
            d={d}
            fill={color}
            stroke="hsl(var(--card))"
            strokeWidth={2}
            opacity={hovered === null || hovered === i ? 1 : 0.3}
            className="cursor-pointer transition-opacity duration-150"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={r - 2} fill="hsl(var(--card))" />
        {/* Center label */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground"
          fontSize={activeItem ? 16 : 18}
          fontWeight={500}
        >
          {activeItem ? activeItem.value : total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          className="fill-muted-foreground"
        >
          {activeItem ? activeItem.name : "total pax"}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {data.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-2 cursor-pointer transition-opacity duration-150"
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.35 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="text-sm text-muted-foreground truncate flex-1">
              {item.name}
            </span>
            <span className="text-sm font-medium tabular-nums">
              {item.value}
            </span>
            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}