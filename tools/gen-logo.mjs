/**
 * Affixa logo generator — computes the calligraphic "A" mark outlines from
 * centerlines + width profiles (Catmull-Rom spline sampling, normal offsetting)
 * and writes public/logo.svg.
 *
 * Run: node tools/gen-logo.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Centripetal-ish Catmull-Rom sampling through control points ──
function catmullRom(pts, samplesPerSeg = 12) {
  const out = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 0; i < P.length - 3; i++) {
    const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
    for (let s = 0; s < samplesPerSeg; s++) {
      const t = s / samplesPerSeg;
      const t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ── Smooth width interpolation (monotone-ish cubic over profile stops) ──
function widthAt(profile, t) {
  // profile: [{t, w}, ...] sorted by t
  if (t <= profile[0].t) return profile[0].w;
  if (t >= profile[profile.length - 1].t) return profile[profile.length - 1].w;
  let i = 0;
  while (i < profile.length - 2 && profile[i + 1].t < t) i++;
  const a = profile[i], b = profile[i + 1];
  const u = (t - a.t) / (b.t - a.t);
  const s = u * u * (3 - 2 * u); // smoothstep
  return a.w + (b.w - a.w) * s;
}

// ── Offset a centerline by ±width/2 to build a closed outline ──
function strokeOutline(centerline, profile, samplesPerSeg = 6) {
  const pts = catmullRom(centerline, samplesPerSeg);
  const n = pts.length;
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    let dx = next.x - prev.x, dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const nx = -dy, ny = dx; // normal
    const t = i / (n - 1);
    const h = widthAt(profile, t) / 2;
    left.push({ x: pts[i].x + nx * h, y: pts[i].y + ny * h });
    right.push({ x: pts[i].x - nx * h, y: pts[i].y - ny * h });
  }
  return [...left, ...right.reverse()];
}

// ── Convert outline points to a smooth path (Catmull-Rom → cubic Bezier) ──
function toSmoothPath(poly, closed = true) {
  const P = poly;
  const n = P.length;
  const at = i => P[((i % n) + n) % n];
  let d = `M${P[0].x.toFixed(2)} ${P[0].y.toFixed(2)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d + (closed ? ' Z' : '');
}

// ── Bounding box helper ──
function bbox(paths) {
  const xs = [], ys = [];
  for (const d of paths) {
    for (const m of d.matchAll(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g)) {
      xs.push(parseFloat(m[1])); ys.push(parseFloat(m[2]));
    }
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

// ══════════════ MARK GEOMETRY (pre-fit coordinates) ══════════════

// Right leg: apex → down-right → flared sharp tip (gold)
const rightLeg = strokeOutline(
  [
    { x: 36.4, y: 12.6 },
    { x: 40.2, y: 21.8 },
    { x: 43.4, y: 30.8 },
    { x: 45.6, y: 37.8 },
    { x: 47.4, y: 43 },
    { x: 49.4, y: 46.6 },
  ],
  [
    { t: 0, w: 0 },
    { t: 0.08, w: 1.6 },
    { t: 0.2, w: 3.2 },
    { t: 0.4, w: 4.4 },
    { t: 0.6, w: 4.8 },
    { t: 0.75, w: 5.2 },
    { t: 0.88, w: 5.6 },
    { t: 0.95, w: 3.4 },
    { t: 1, w: 0 },
  ],
);

// Left leg → bottom hook → rising sharp tip (teal)
const leftLeg = strokeOutline(
  [
    { x: 36.4, y: 12.6 },
    { x: 33.4, y: 20.5 },
    { x: 31.2, y: 27 },
    { x: 29.8, y: 32.5 },
    { x: 28.9, y: 38 },
    { x: 29.2, y: 43.5 },
    { x: 30.6, y: 48.4 },
    { x: 33.2, y: 52.4 },
    { x: 36.8, y: 54.6 },
    { x: 40.6, y: 53.6 },
    { x: 42.4, y: 50.2 },
    { x: 42.4, y: 46.6 },
    { x: 41.6, y: 43.4 },
    { x: 40.4, y: 41.2 },
  ],
  [
    { t: 0, w: 0 },
    { t: 0.12, w: 2.2 },
    { t: 0.25, w: 3.4 },
    { t: 0.45, w: 3.8 },
    { t: 0.6, w: 4.0 },
    { t: 0.75, w: 4.4 },
    { t: 0.87, w: 3.8 },
    { t: 0.95, w: 2.0 },
    { t: 1, w: 0 },
  ],
);

// Blade crossbar (sage) — thin wedge from star to a sharp point upper-right
const blade = 'M19.8 33.6 Q35.4 29.6 52.3 27.4 Q34.6 31.6 20.6 38.6 Z';

// Diamond sparkle (gold) — concave-sided 4-point star at the blade's left end
const star = 'M21 28.5 Q24.1 32.9 29.5 34.5 Q24.3 38.3 22.5 42.5 Q19.7 37.4 14.5 36.5 Q19.6 33.9 21 28.5 Z';

// ── Fit all shapes into the badge with even padding ──
const dRight = toSmoothPath(rightLeg);
const dLeft = toSmoothPath(leftLeg);
const bb = bbox([dRight, dLeft, blade, star]);
const TARGET = { cx: 32, cy: 32.5, w: 34, h: 39 };
const scale = Math.min(TARGET.w / (bb.x1 - bb.x0), TARGET.h / (bb.y1 - bb.y0));
const cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2;
const transform = `translate(${(TARGET.cx - cx * scale).toFixed(3)} ${(TARGET.cy - cy * scale).toFixed(3)}) scale(${scale.toFixed(4)})`;

// ── Compose SVG ──
const svg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2B5F51"/>
      <stop offset="52%" stop-color="#173B32"/>
      <stop offset="100%" stop-color="#0D2620"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logoGrad)"/>
  <rect x="3" y="3" width="58" height="58" rx="15" stroke="#DAF1DE" stroke-opacity="0.16" stroke-width="2"/>
  <g transform="${transform}">
    <path d="${dRight}" fill="#e2b857"/>
    <path d="${dLeft}" fill="#7ec8c8"/>
    <path d="${blade}" fill="#8EB69B"/>
    <path d="${star}" fill="#e2b857"/>
  </g>
</svg>
`;

const out = join(__dirname, '..', 'frontend', 'public', 'logo.svg');
writeFileSync(out, svg);
console.log('wrote', out, `(${svg.length} bytes)`, 'bbox', bb, 'scale', scale.toFixed(3));
