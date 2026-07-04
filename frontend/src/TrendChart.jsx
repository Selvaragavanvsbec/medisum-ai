import { useEffect, useRef, useState } from "react";

/* Animated line chart drawn as inline SVG — no chart library needed. */
export function TrendChart({ points, color = "#8b5cf6", height = 130 }) {
  const pathRef = useRef();
  const [len, setLen] = useState(0);
  const w = 100; // viewBox width units
  const h = 40;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pad = 4;

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? w / 2 : pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.value - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const line = coords.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2)).join(" ");
  const area = line + ` L${coords[coords.length - 1][0].toFixed(2)} ${h} L${coords[0][0].toFixed(2)} ${h} Z`;

  useEffect(() => {
    if (pathRef.current) {
      const l = pathRef.current.getTotalLength();
      setLen(l);
      pathRef.current.style.strokeDasharray = l;
      pathRef.current.style.strokeDashoffset = l;
      requestAnimationFrame(() => {
        pathRef.current.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)";
        pathRef.current.style.strokeDashoffset = 0;
      });
    }
  }, [line]);

  const gid = "g" + color.replace("#", "");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} opacity={len ? 1 : 0} style={{ transition: "opacity .6s .5s" }} />
      <path ref={pathRef} d={line} fill="none" stroke={color} strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill={color} vectorEffect="non-scaling-stroke"
          opacity={len ? 1 : 0} style={{ transition: `opacity .3s ${0.6 + i * 0.08}s` }} />
      ))}
    </svg>
  );
}
