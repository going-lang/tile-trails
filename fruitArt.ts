/**
 * Original 2D vector artwork for all 60 Tile Trails fruits.
 * Every fruit has a unique silhouette + palette + signature detail so none look alike.
 * Coordinates are in a ~100x100 design space centred on (0,0).
 */

type Ctx = CanvasRenderingContext2D;
type Stops = Array<[number, string]>;
type Pt = [number, number];

const OUTLINE = '#3D2817';
const LW = 5;

// ===================== Helpers =====================

function grad(ctx: Ctx, x: number, y: number, r: number, stops: Stops): CanvasGradient {
  const g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.34, r * 0.08, x, y, r * 1.05);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

function outline(ctx: Ctx, w = LW) {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = w;
  ctx.stroke();
}

function ball(ctx: Ctx, x: number, y: number, r: number, stops: Stops, w = LW) {
  ctx.fillStyle = grad(ctx, x, y, r, stops);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx, w);
}

function oval(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot: number, stops: Stops, w = LW) {
  ctx.fillStyle = grad(ctx, x, y, Math.max(rx, ry), stops);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx, w);
}

function shine(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot = -0.45, a = 0.7) {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

function leaf(ctx: Ctx, x: number, y: number, rot: number, len = 22, wid = 10, color = '#22C55E') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.5, wid, 0, 0);
  ctx.closePath();
  ctx.fill();
  outline(ctx, 3.5);
  ctx.strokeStyle = 'rgba(20,60,30,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(len - 4, 0);
  ctx.stroke();
  ctx.restore();
}

function stem(ctx: Ctx, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, color = '#6B4226', w = 5.5) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();
}

function dots(ctx: Ctx, pts: Pt[], r: number, color: string) {
  ctx.fillStyle = color;
  pts.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drupes(ctx: Ctx, pts: Pt[], r: number, hi: string, base: string, w = 3) {
  pts.forEach(([x, y]) => {
    ctx.fillStyle = grad(ctx, x, y, r, [[0, hi], [1, base]]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    outline(ctx, w);
  });
}

function sepals(ctx: Ctx, x: number, y: number, size = 14, color = '#22C55E') {
  ctx.fillStyle = color;
  for (const a of [-0.9, 0, 0.9]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.35, -size * 0.7);
    ctx.lineTo(0, -size * 1.4);
    ctx.lineTo(size * 0.35, -size * 0.7);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 3);
    ctx.restore();
  }
}

/** Round citrus cross-section */
function disc(ctx: Ctx, x: number, y: number, r: number, rind: string, pith: string, flesh: string, n = 8, seg = 'rgba(255,255,255,0.85)', fleshRatio = 0.76) {
  ctx.fillStyle = rind;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx);
  ctx.fillStyle = pith;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.88, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = flesh;
  ctx.beginPath();
  ctx.arc(x, y, r * fleshRatio, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = seg;
  ctx.lineWidth = 3;
  for (let i = 0; i < n; i++) {
    const a = (i * Math.PI * 2) / n;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * fleshRatio, y + Math.sin(a) * r * fleshRatio);
    ctx.stroke();
  }
  ctx.fillStyle = pith;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

/** Pizza-slice citrus wedge */
function wedge(ctx: Ctx, x: number, y: number, r: number, a0: number, a1: number, rind: string, pith: string, flesh: string, seg = 'rgba(255,255,255,0.85)', n = 3) {
  ctx.fillStyle = rind;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, a0, a1);
  ctx.closePath();
  ctx.fill();
  outline(ctx);
  ctx.fillStyle = pith;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r * 0.86, a0, a1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = flesh;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r * 0.74, a0 + 0.06, a1 - 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = seg;
  ctx.lineWidth = 2.5;
  for (let i = 1; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74);
    ctx.stroke();
  }
}

function star(ctx: Ctx, x: number, y: number, r: number, color: string, points = 5) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function applePath(ctx: Ctx) {
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.bezierCurveTo(28, -44, 48, -14, 40, 20);
  ctx.bezierCurveTo(34, 44, 14, 48, 0, 38);
  ctx.bezierCurveTo(-14, 48, -34, 44, -40, 20);
  ctx.bezierCurveTo(-48, -14, -28, -44, 0, -30);
  ctx.closePath();
}

function grapeBunch(ctx: Ctx, hi: string, base: string, tendril: boolean) {
  stem(ctx, 0, -40, 0, -30, 0, -18, '#65A30D', 5);
  leaf(ctx, 0, -32, -0.35, 26, 11, '#4ADE80');
  if (tendril) {
    ctx.strokeStyle = '#65A30D';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-22, -34, 6, 0, Math.PI * 1.7);
    ctx.stroke();
  }
  const pts: Pt[] = [
    [-16, -14], [0, -16], [16, -14],
    [-22, 2], [-8, 2], [8, 2], [22, 2],
    [-14, 18], [0, 18], [14, 18],
    [-8, 32], [8, 32],
    [0, 44],
  ];
  drupes(ctx, pts, 11, hi, base, 3.5);
  dots(ctx, [[-19, -17], [-3, -19], [-11, -1], [-17, 15], [-3, 29]], 2.2, 'rgba(255,255,255,0.75)');
}

function aggregate(ctx: Ctx, rows: number[][], r: number, hi: string, base: string, startY: number, gap: number) {
  const pts: Pt[] = [];
  rows.forEach((row, ri) => {
    row.forEach((x) => pts.push([x, startY + ri * gap]));
  });
  drupes(ctx, pts, r, hi, base, 3);
  pts.forEach(([x, y], i) => {
    if (i % 2 === 0) shine(ctx, x - r * 0.3, y - r * 0.3, r * 0.22, r * 0.3, -0.5, 0.55);
  });
}

// ===================== Main =====================

export function drawFruitArtwork(ctx: Ctx, motifId: number, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = LW;

  switch (((motifId % 60) + 60) % 60) {
    // ---------- SUNNY MEADOW ----------
    case 0: {
      // Orchard Red Apple
      stem(ctx, 0, -30, 5, -46, 12, -50);
      leaf(ctx, 2, -37, -2.5, 24, 10, '#34D399');
      applePath(ctx);
      ctx.fillStyle = grad(ctx, 0, 4, 48, [[0, '#FF8A8A'], [0.55, '#EF4444'], [1, '#B91C1C']]);
      ctx.fill();
      outline(ctx);
      shine(ctx, -16, -12, 6, 12);
      break;
    }
    case 1: {
      // Granny Smith Apple — bitten
      stem(ctx, 0, -30, 5, -46, 12, -50, '#5B371E');
      leaf(ctx, 2, -37, -0.6, 24, 10, '#16A34A');
      applePath(ctx);
      ctx.fillStyle = grad(ctx, 0, 4, 48, [[0, '#D9F99D'], [0.55, '#84CC16'], [1, '#4D7C0F']]);
      ctx.fill();
      outline(ctx);
      ctx.save();
      applePath(ctx);
      ctx.clip();
      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.arc(38, -2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(38, -2, 16, Math.PI * 0.55, Math.PI * 1.45);
      ctx.stroke();
      dots(ctx, [[27, -6], [28, 4]], 2.2, '#78350F');
      shine(ctx, -16, -12, 6, 12);
      break;
    }
    case 2: {
      // Honey Banana — bunch of two
      ctx.rotate(-0.15);
      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.moveTo(-26, -38);
      ctx.bezierCurveTo(-4, -36, 36, 2, 22, 42);
      ctx.bezierCurveTo(44, 20, 32, -36, -26, -38);
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = grad(ctx, 0, 0, 50, [[0, '#FEF9C3'], [0.5, '#FACC15'], [1, '#CA8A04']]);
      ctx.beginPath();
      ctx.moveTo(-30, -34);
      ctx.bezierCurveTo(-42, 16, 2, 52, 42, 26);
      ctx.bezierCurveTo(22, 14, -10, -8, -18, -36);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      dots(ctx, [[-24, -36]], 6, '#78350F');
      dots(ctx, [[42, 27]], 4, '#78350F');
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-22, -10);
      ctx.quadraticCurveTo(-8, 18, 18, 24);
      ctx.stroke();
      break;
    }
    case 3: {
      // Wild Strawberry
      ctx.fillStyle = grad(ctx, 0, 8, 46, [[0, '#FF8FA8'], [0.6, '#F43F5E'], [1, '#BE123C']]);
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.bezierCurveTo(42, -34, 46, 6, 18, 38);
      ctx.quadraticCurveTo(0, 52, -18, 38);
      ctx.bezierCurveTo(-46, 6, -42, -34, 0, -34);
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = '#FDE047';
      ([[-16, -6], [0, -2], [16, -6], [-22, 10], [-8, 14], [8, 14], [22, 10], [-10, 28], [10, 28], [0, 38]] as Pt[]).forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.moveTo(0, -44);
      ctx.lineTo(14, -30);
      ctx.lineTo(30, -36);
      ctx.lineTo(16, -18);
      ctx.lineTo(0, -24);
      ctx.lineTo(-16, -18);
      ctx.lineTo(-30, -36);
      ctx.lineTo(-14, -30);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      break;
    }
    case 4: {
      // Twin Sweet Cherries
      ctx.strokeStyle = '#65A30D';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.quadraticCurveTo(-14, -38, 0, -48);
      ctx.quadraticCurveTo(18, -38, 20, 12);
      ctx.stroke();
      leaf(ctx, 0, -48, 0.4, 24, 9, '#4ADE80');
      ball(ctx, -18, 14, 20, [[0, '#FB7185'], [0.6, '#E11D48'], [1, '#881337']]);
      ball(ctx, 20, 18, 19, [[0, '#FB7185'], [0.6, '#BE123C'], [1, '#4C0519']]);
      shine(ctx, -24, 8, 4, 6);
      shine(ctx, 14, 12, 3.5, 5.5);
      break;
    }
    case 5: {
      // Juicy Sun Peach
      stem(ctx, 0, -28, 0, -36, 0, -42, '#6B4226', 5);
      leaf(ctx, 0, -32, -0.5, 24, 10);
      ctx.fillStyle = grad(ctx, 0, 6, 46, [[0, '#FED7AA'], [0.45, '#FB923C'], [1, '#F43F5E']]);
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.bezierCurveTo(24, -38, 44, -14, 38, 16);
      ctx.bezierCurveTo(34, 40, 12, 46, 0, 42);
      ctx.bezierCurveTo(-12, 46, -34, 40, -38, 16);
      ctx.bezierCurveTo(-44, -14, -24, -38, 0, -26);
      ctx.fill();
      outline(ctx);
      ctx.strokeStyle = 'rgba(120,53,15,0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.quadraticCurveTo(6, 4, 0, 36);
      ctx.stroke();
      shine(ctx, -16, -6, 6, 12, -0.2);
      break;
    }
    case 6: {
      // Valencia Sweet Orange — whole + slice
      leaf(ctx, -18, -34, -0.9, 22, 10);
      ball(ctx, -8, 4, 32, [[0, '#FED7AA'], [0.5, '#F97316'], [1, '#C2410C']]);
      dots(ctx, [[-20, -2], [-8, -14], [2, 8], [-14, 14], [8, -6]], 1.6, 'rgba(124,45,18,0.35)');
      disc(ctx, 26, 20, 22, '#F97316', '#FFF7ED', '#FDBA74', 8);
      shine(ctx, -22, -10, 5, 9);
      break;
    }
    case 7: {
      // Eureka Yellow Lemon — pointed oval with dimples
      ctx.rotate(-0.3);
      ctx.fillStyle = grad(ctx, 0, 0, 46, [[0, '#FEF9C3'], [0.5, '#FACC15'], [1, '#CA8A04']]);
      ctx.beginPath();
      ctx.moveTo(-46, 0);
      ctx.bezierCurveTo(-40, -32, 40, -32, 46, 0);
      ctx.bezierCurveTo(40, 32, -40, 32, -46, 0);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = '#EAB308';
      dots(ctx, [[-47, 0], [47, 0]], 6, '#EAB308');
      ctx.beginPath();
      ctx.arc(-47, 0, 6, 0, Math.PI * 2);
      outline(ctx, 4);
      ctx.beginPath();
      ctx.arc(47, 0, 6, 0, Math.PI * 2);
      outline(ctx, 4);
      dots(ctx, [[-24, -10], [-10, 6], [6, -12], [20, 4], [-16, 16], [12, 16], [30, -6]], 1.8, 'rgba(133,77,14,0.35)');
      leaf(ctx, -30, -18, -2.2, 20, 9);
      shine(ctx, -14, -12, 9, 5, -0.2);
      break;
    }
    case 8: {
      // Fresh Meadow Lime — small green + wedge
      leaf(ctx, -30, -30, -0.8, 20, 9, '#16A34A');
      ball(ctx, -12, 6, 30, [[0, '#BBF7D0'], [0.5, '#22C55E'], [1, '#15803D']]);
      wedge(ctx, 24, 12, 28, -1.2, 1.35, '#16A34A', '#ECFDF5', '#86EFAC', 'rgba(255,255,255,0.9)', 3);
      shine(ctx, -22, -6, 5, 8);
      break;
    }
    case 9: {
      // Velvet Apricot — small, deep crease, freckles, twin leaves
      ball(ctx, 0, 6, 34, [[0, '#FED7AA'], [0.5, '#FB923C'], [1, '#EA580C']]);
      ctx.strokeStyle = 'rgba(124,45,18,0.55)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.quadraticCurveTo(6, 6, 0, 38);
      ctx.stroke();
      dots(ctx, [[-14, 0], [10, 14], [-6, 20], [16, -4]], 2, 'rgba(194,65,12,0.55)');
      leaf(ctx, 0, -28, -2.4, 18, 8);
      leaf(ctx, 0, -28, -0.7, 18, 8, '#16A34A');
      shine(ctx, -13, -8, 5, 10);
      break;
    }

    // ---------- CRYSTAL COAST ----------
    case 10: {
      // Tropical Coconut — hairy whole + cracked half
      ball(ctx, -10, -6, 30, [[0, '#A16207'], [0.6, '#78350F'], [1, '#451A03']]);
      ctx.strokeStyle = '#5B2A0B';
      ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        const a = -2.6 + i * 0.32;
        ctx.beginPath();
        ctx.arc(-10, -6, 30, a, a + 0.14);
        ctx.stroke();
      }
      dots(ctx, [[-20, -16], [-4, -18], [-12, -4]], 4.5, '#291102');
      ball(ctx, 24, 20, 22, [[0, '#7C3A0F'], [1, '#4A2208']]);
      ctx.fillStyle = '#FFFBEB';
      ctx.beginPath();
      ctx.arc(24, 20, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E7E5E4';
      ctx.beginPath();
      ctx.arc(24, 20, 9, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 11: {
      // Golden Pineapple
      ctx.fillStyle = '#16A34A';
      ([[-14, -36, -0.3], [0, -44, 0], [14, -36, 0.3], [-8, -28, -0.15], [8, -28, 0.15]] as Array<[number, number, number]>).forEach(([lx, ly, rot]) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(-8, -12);
        ctx.lineTo(0, -24);
        ctx.lineTo(8, -12);
        ctx.closePath();
        ctx.fill();
        outline(ctx, 4);
        ctx.restore();
      });
      const g = ctx.createLinearGradient(0, -16, 0, 42);
      g.addColorStop(0, '#FEF08A');
      g.addColorStop(0.5, '#FACC15');
      g.addColorStop(1, '#B45309');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 14, 30, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      outline(ctx);
      ctx.strokeStyle = '#854D0E';
      ctx.lineWidth = 3;
      [-14, 0, 14].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(dx - 14, -6);
        ctx.lineTo(dx + 14, 34);
        ctx.moveTo(dx + 14, -6);
        ctx.lineTo(dx - 14, 34);
        ctx.stroke();
      });
      break;
    }
    case 12: {
      // Crimson Watermelon wedge
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(0, -6, 44, Math.PI * 0.18, Math.PI * 0.82);
      ctx.lineTo(0, 36);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = '#DCFCE7';
      ctx.beginPath();
      ctx.arc(0, -6, 38, Math.PI * 0.22, Math.PI * 0.78);
      ctx.lineTo(0, 32);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = grad(ctx, 0, 10, 34, [[0, '#FF647C'], [0.7, '#EF4444'], [1, '#BE123C']]);
      ctx.beginPath();
      ctx.arc(0, -6, 34, Math.PI * 0.24, Math.PI * 0.76);
      ctx.lineTo(0, 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#18181B';
      ([[-10, 12], [10, 12], [0, 6], [-6, 20], [6, 20]] as Pt[]).forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 13: {
      // Purple Passionfruit — halved with seedy pulp
      ball(ctx, 0, 4, 38, [[0, '#C084FC'], [0.55, '#7E22CE'], [1, '#3B0764']]);
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(0, 4, 28, 0, Math.PI * 2);
      ctx.fill();
      const sacs: Pt[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI * 2) / 10;
        sacs.push([Math.cos(a) * 18, 4 + Math.sin(a) * 18]);
      }
      sacs.push([0, 4], [-8, -4], [8, 12]);
      drupes(ctx, sacs, 5.5, '#FEF3C7', '#F59E0B', 1.5);
      dots(ctx, sacs, 2.2, '#1F2937');
      break;
    }
    case 14: {
      // Golden Papaya — halved with seed cavity
      const g = ctx.createLinearGradient(-20, -30, 20, 30);
      g.addColorStop(0, '#FDE047');
      g.addColorStop(0.5, '#FB923C');
      g.addColorStop(1, '#EA580C');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.bezierCurveTo(20, -36, 38, 0, 32, 28);
      ctx.bezierCurveTo(24, 46, -24, 46, -32, 28);
      ctx.bezierCurveTo(-38, 0, -20, -36, 0, -38);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      ctx.strokeStyle = '#84CC16';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-6, -36);
      ctx.quadraticCurveTo(-30, -10, -28, 26);
      ctx.stroke();
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.ellipse(2, 8, 13, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      const seeds: Pt[] = [];
      for (let i = 0; i < 9; i++) seeds.push([2 + Math.sin(i * 1.5) * 5, -8 + i * 3.8]);
      dots(ctx, seeds, 2.5, '#18181B');
      break;
    }
    case 15: {
      // Golden Starfruit
      ctx.fillStyle = grad(ctx, 0, 0, 48, [[0, '#FEF9C3'], [0.5, '#FACC15'], [1, '#D97706']]);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 46 : 22;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      const tips: Pt[] = [];
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        tips.push([Math.cos(a) * 44, Math.sin(a) * 44]);
      }
      dots(ctx, tips, 4.5, '#65A30D');
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 16: {
      // Pink Guava — green whole + pink half
      leaf(ctx, -22, -30, -1.0, 22, 10, '#15803D');
      ball(ctx, -10, 2, 32, [[0, '#D9F99D'], [0.5, '#84CC16'], [1, '#4D7C0F']]);
      ball(ctx, 26, 18, 22, [[0, '#A3E635'], [1, '#65A30D']]);
      ctx.fillStyle = '#FDF2F8';
      ctx.beginPath();
      ctx.arc(26, 18, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(26, 18, 13, 0, Math.PI * 2);
      ctx.fill();
      const gs: Pt[] = [];
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8;
        gs.push([26 + Math.cos(a) * 8, 18 + Math.sin(a) * 8]);
      }
      dots(ctx, gs, 1.8, '#FFFBEB');
      break;
    }
    case 17: {
      // Giant Pomelo — large teardrop + thick-pith half
      ctx.fillStyle = grad(ctx, 0, 8, 46, [[0, '#F7FEE7'], [0.5, '#D9F99D'], [1, '#84CC16']]);
      ctx.beginPath();
      ctx.moveTo(0, -46);
      ctx.bezierCurveTo(30, -44, 46, -10, 44, 14);
      ctx.bezierCurveTo(42, 40, -42, 40, -44, 14);
      ctx.bezierCurveTo(-46, -10, -30, -44, 0, -46);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      dots(ctx, [[0, -44]], 5, '#4D7C0F');
      leaf(ctx, 2, -44, -0.5, 18, 8, '#16A34A');
      disc(ctx, 20, 18, 24, '#D9F99D', '#FFFFFF', '#FBCFE8', 9, 'rgba(255,255,255,0.95)', 0.6);
      break;
    }
    case 18: {
      // Honey Cantaloupe — netted crescent wedge
      const c0 = Math.PI * 0.12;
      const c1 = Math.PI * 0.88;
      ctx.fillStyle = '#D6B27A';
      ctx.beginPath();
      ctx.arc(0, -14, 48, c0, c1);
      ctx.arc(0, -14, 24, c1, c0, true);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = grad(ctx, 0, 14, 40, [[0, '#FED7AA'], [0.6, '#FB923C'], [1, '#EA580C']]);
      ctx.beginPath();
      ctx.arc(0, -14, 41, c0 + 0.04, c1 - 0.04);
      ctx.arc(0, -14, 24, c1 - 0.04, c0 + 0.04, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,90,50,0.7)';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 12; i++) {
        const a = c0 + ((c1 - c0) * (i + 0.5)) / 12;
        const x = Math.cos(a) * 44.5;
        const y = -14 + Math.sin(a) * 44.5;
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3);
        ctx.lineTo(x - 3, y + 3);
        ctx.stroke();
      }
      const cs: Pt[] = [];
      for (let i = 0; i < 6; i++) {
        const a = c0 + ((c1 - c0) * (i + 0.5)) / 6;
        cs.push([Math.cos(a) * 27, -14 + Math.sin(a) * 27]);
      }
      dots(cs.length ? ctx : ctx, cs, 2.2, '#FEF3C7');
      break;
    }
    case 19: {
      // Fresh Honeydew — smooth pale melon + slice
      oval(ctx, -8, 2, 34, 30, 0, [[0, '#F0FDF4'], [0.5, '#BBF7D0'], [1, '#4ADE80']]);
      ctx.strokeStyle = 'rgba(22,101,52,0.25)';
      ctx.lineWidth = 2;
      [-18, 0, 18].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(-8 + dx, -26);
        ctx.quadraticCurveTo(-8 + dx * 1.3, 2, -8 + dx, 30);
        ctx.stroke();
      });
      ball(ctx, 26, 22, 19, [[0, '#86EFAC'], [1, '#22C55E']]);
      ctx.fillStyle = '#DCFCE7';
      ctx.beginPath();
      ctx.arc(26, 22, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.ellipse(26, 22, 6, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      dots(ctx, [[24, 18], [28, 22], [25, 26]], 1.6, '#D6B27A');
      break;
    }

    // ---------- CANDY VALLEY ----------
    case 20: {
      // Honey Tangerine — squat with peel curl
      oval(ctx, 0, 8, 36, 30, 0, [[0, '#FED7AA'], [0.45, '#FB923C'], [1, '#EA580C']]);
      dots(ctx, [[-16, 0], [-4, 14], [10, -2], [18, 14], [-22, 16]], 1.6, 'rgba(154,52,18,0.35)');
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(28, -6);
      ctx.bezierCurveTo(52, -18, 58, 14, 40, 30);
      ctx.stroke();
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = '#FFF7ED';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      dots(ctx, [[-2, -22]], 4, '#5B371E');
      leaf(ctx, -4, -24, -2.2, 20, 9);
      shine(ctx, -18, -4, 6, 9);
      break;
    }
    case 21: {
      // Sweet Lychee — bumpy shell, peeled corner
      stem(ctx, 10, -30, 16, -42, 26, -48, '#5B371E', 4.5);
      leaf(ctx, 22, -44, 0.3, 18, 8, '#16A34A');
      ball(ctx, 0, 6, 32, [[0, '#FDA4AF'], [0.5, '#F43F5E'], [1, '#BE123C']]);
      const bumps: Pt[] = [];
      for (let i = 0; i < 14; i++) {
        const a = (i * Math.PI * 2) / 14;
        const rr = i % 2 ? 24 : 14;
        bumps.push([Math.cos(a) * rr, 6 + Math.sin(a) * rr]);
      }
      dots(ctx, bumps, 2.6, 'rgba(136,19,55,0.55)');
      ctx.fillStyle = '#FFF7ED';
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.arc(0, 6, 32, -1.25, -0.05);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9F1239';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(10, -24);
      ctx.moveTo(0, 6);
      ctx.lineTo(32, 4);
      ctx.stroke();
      break;
    }
    case 22: {
      // Golden Mirabelle — trio of tiny freckled plums
      stem(ctx, 0, -6, 4, -30, 12, -46, '#5B371E', 4.5);
      leaf(ctx, 10, -44, -0.3, 18, 8);
      const st: Stops = [[0, '#FEF9C3'], [0.5, '#FBBF24'], [1, '#D97706']];
      ball(ctx, -20, 10, 17, st, 4);
      ball(ctx, 18, 14, 17, st, 4);
      ball(ctx, 0, -6, 17, st, 4);
      dots(ctx, [[-24, 6], [-14, 14], [14, 10], [22, 18], [-4, -10], [6, -2]], 1.7, 'rgba(220,38,38,0.6)');
      shine(ctx, -26, 4, 3, 5);
      shine(ctx, -6, -12, 3, 5);
      break;
    }
    case 23: {
      // Turkish Black Fig — split showing pink interior
      stem(ctx, 0, -38, 4, -46, 10, -50, '#5B371E', 5);
      ctx.fillStyle = grad(ctx, 0, 6, 46, [[0, '#C084FC'], [0.5, '#6B21A8'], [1, '#3B0764']]);
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.bezierCurveTo(24, -30, 42, 6, 32, 28);
      ctx.bezierCurveTo(22, 44, -22, 44, -32, 28);
      ctx.bezierCurveTo(-42, 6, -24, -30, 0, -38);
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.bezierCurveTo(18, 4, 18, 30, 0, 36);
      ctx.bezierCurveTo(-18, 30, -18, 4, 0, -6);
      ctx.fill();
      outline(ctx, 3);
      dots(ctx, [[-6, 8], [4, 4], [6, 16], [-4, 22], [2, 28]], 1.6, '#FEF3C7');
      break;
    }
    case 24: {
      // Sweet Kumquat — three ovals on a twig
      stem(ctx, -40, 30, -10, 0, 30, -34, '#5B371E', 5);
      leaf(ctx, -8, -6, -2.6, 22, 9);
      leaf(ctx, 8, -18, 0.5, 20, 8, '#16A34A');
      const st: Stops = [[0, '#FED7AA'], [0.5, '#F97316'], [1, '#C2410C']];
      oval(ctx, -26, 10, 12, 17, -0.4, st, 4);
      oval(ctx, 0, 24, 12, 17, 0.2, st, 4);
      oval(ctx, 26, 4, 12, 17, 0.3, st, 4);
      shine(ctx, -30, 3, 3, 5);
      shine(ctx, 22, -3, 3, 5);
      break;
    }
    case 25: {
      // Sweet Clementine — navel dimple + big leaf
      ball(ctx, 0, 6, 34, [[0, '#FFEDD5'], [0.45, '#FB923C'], [1, '#EA580C']]);
      dots(ctx, [[-14, -6], [-2, 8], [14, -4], [-18, 14], [10, 20]], 1.5, 'rgba(154,52,18,0.3)');
      dots(ctx, [[0, 28]], 6, '#C2410C');
      dots(ctx, [[0, 28]], 2.5, '#FDBA74');
      leaf(ctx, -2, -27, -1.1, 26, 11, '#16A34A');
      shine(ctx, -14, -8, 5, 9);
      break;
    }
    case 26: {
      // Queen Mangosteen — purple with green calyx + white segments
      ctx.fillStyle = '#65A30D';
      [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((a) => {
        ctx.save();
        ctx.translate(0, -24);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, -9, 7, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        outline(ctx, 3);
        ctx.restore();
      });
      ball(ctx, 0, 8, 38, [[0, '#A855F7'], [0.5, '#581C87'], [1, '#2E1065']]);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 16, 18, 0, Math.PI * 2);
      ctx.fill();
      outline(ctx, 3);
      ctx.strokeStyle = '#C4B5FD';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(Math.cos(a) * 17, 16 + Math.sin(a) * 17);
        ctx.stroke();
      }
      dots(ctx, [[0, -26]], 5, '#3F2A16');
      break;
    }
    case 27: {
      // Sweet Mulberry — long aggregate
      stem(ctx, 0, -40, 2, -48, 6, -54, '#65A30D', 4.5);
      leaf(ctx, 4, -46, 0.5, 18, 8);
      const pts: Pt[] = [];
      for (let r = 0; r < 5; r++) pts.push([-8, -30 + r * 14], [8, -30 + r * 14]);
      pts.push([0, 40]);
      drupes(ctx, pts, 10, '#BE123C', '#4C0519', 2.5);
      shine(ctx, -11, -33, 2.5, 3.5);
      shine(ctx, 5, -5, 2.5, 3.5);
      break;
    }
    case 28: {
      // Forest Boysenberry — big-drupelet round aggregate
      sepals(ctx, 0, -34, 12, '#22C55E');
      drupes(ctx, [[-12, -18], [12, -18], [-22, 2], [0, -2], [22, 2], [-12, 20], [12, 20], [0, 36]], 13, '#9F1239', '#4C0519', 3);
      shine(ctx, -16, -22, 3, 4);
      shine(ctx, -4, -6, 3, 4);
      break;
    }
    case 29: {
      // Sugar Custard Apple — heart shape with scale pattern
      stem(ctx, 0, -34, 2, -42, 6, -48, '#5B371E', 5);
      const heart = () => {
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.bezierCurveTo(26, -42, 46, -10, 36, 16);
        ctx.bezierCurveTo(28, 36, 10, 44, 0, 42);
        ctx.bezierCurveTo(-10, 44, -28, 36, -36, 16);
        ctx.bezierCurveTo(-46, -10, -26, -42, 0, -34);
        ctx.closePath();
      };
      heart();
      ctx.fillStyle = grad(ctx, 0, 4, 46, [[0, '#BBF7D0'], [0.5, '#4ADE80'], [1, '#15803D']]);
      ctx.fill();
      outline(ctx);
      ctx.save();
      heart();
      ctx.clip();
      ctx.strokeStyle = 'rgba(20,83,45,0.5)';
      ctx.lineWidth = 2;
      for (let row = -28; row <= 40; row += 12) {
        const off = ((row / 12) % 2 === 0) ? 0 : 7;
        for (let col = -42 + off; col <= 42; col += 14) {
          ctx.beginPath();
          ctx.arc(col, row, 7, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
      break;
    }

    // ---------- MYSTIC FOREST ----------
    case 30: {
      // Wild Blueberry — cluster of three with star crowns
      leaf(ctx, -6, -30, -2.4, 20, 8);
      const st: Stops = [[0, '#93C5FD'], [0.5, '#2563EB'], [1, '#1E3A8A']];
      ([[-18, -8], [18, -4], [0, 18]] as Pt[]).forEach(([x, y]) => {
        ball(ctx, x, y, 18, st, 4);
        star(ctx, x, y - 9, 6, '#1E40AF');
        shine(ctx, x - 7, y - 6, 3, 4.5, -0.4, 0.55);
      });
      break;
    }
    case 31: {
      // Forest Blackberry — tall cone aggregate
      sepals(ctx, 0, -38, 12, '#22C55E');
      aggregate(ctx, [[-11, 11], [-22, 0, 22], [-14, 14], [-8, 8], [0]], 11, '#4C1D95', '#1E1B4B', -26, 15);
      break;
    }
    case 32: {
      // Dark Elderberry — umbel on red stems
      leaf(ctx, -6, 36, -0.9, 20, 8, '#15803D');
      const tips: Pt[] = [[-34, -20], [-20, -32], [-4, -38], [12, -36], [28, -26], [-30, 0], [30, -4], [6, -16], [-12, -10]];
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.lineTo(0, 10);
      ctx.stroke();
      tips.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
      drupes(ctx, tips, 7, '#6D28D9', '#1E1B4B', 2.5);
      break;
    }
    case 33: {
      // Tart Gooseberry — translucent veined oval with tail
      stem(ctx, 0, -30, 2, -40, 6, -46, '#65A30D', 4);
      oval(ctx, 0, 6, 27, 32, 0, [[0, '#ECFCCB'], [0.5, '#A3E635'], [1, '#65A30D']]);
      ctx.strokeStyle = 'rgba(63,98,18,0.5)';
      ctx.lineWidth = 2.2;
      [-16, -8, 0, 8, 16].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(dx * 0.5, -24);
        ctx.quadraticCurveTo(dx * 1.4, 6, dx * 0.5, 36);
        ctx.stroke();
      });
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(-4, 46);
      ctx.lineTo(4, 46);
      ctx.closePath();
      ctx.fill();
      shine(ctx, -10, -10, 6, 10);
      break;
    }
    case 34: {
      // Red Currant Cluster — hanging string
      stem(ctx, -30, -42, -10, -20, 10, 36, '#65A30D', 4);
      leaf(ctx, -32, -40, -0.4, 22, 10);
      const pts: Pt[] = [[-22, -30], [-14, -14], [-6, 2], [2, 16], [10, 30], [-4, -22], [6, -6], [14, 8], [20, 22]];
      drupes(ctx, pts, 9, '#FCA5A5', '#DC2626', 2.5);
      dots(ctx, pts.map(([x, y]) => [x, y + 5] as Pt), 1.6, '#7F1D1D');
      pts.forEach(([x, y]) => shine(ctx, x - 3, y - 3, 2, 2.6, -0.4, 0.75));
      break;
    }
    case 35: {
      // Black Currant Cluster — with lobed leaf
      stem(ctx, -30, -42, -10, -20, 10, 36, '#65A30D', 4);
      leaf(ctx, -34, -40, -0.9, 20, 9, '#15803D');
      leaf(ctx, -34, -40, -0.1, 20, 9, '#16A34A');
      leaf(ctx, -34, -40, 0.7, 20, 9, '#15803D');
      const pts: Pt[] = [[-22, -28], [-14, -12], [-6, 4], [2, 18], [10, 32], [-4, -20], [6, -4], [14, 10], [20, 24]];
      drupes(ctx, pts, 9.5, '#4C1D95', '#111827', 2.5);
      dots(ctx, pts.map(([x, y]) => [x, y + 5.5] as Pt), 1.6, '#020617');
      pts.forEach(([x, y], i) => { if (i % 2 === 0) shine(ctx, x - 3, y - 3, 2, 2.6, -0.4, 0.55); });
      break;
    }
    case 36: {
      // Crimson Cranberry — three glossy oblongs
      stem(ctx, -18, -22, -20, -34, -14, -44, '#65A30D', 3.5);
      const st: Stops = [[0, '#FCA5A5'], [0.5, '#DC2626'], [1, '#7F1D1D']];
      oval(ctx, -18, -6, 14, 18, -0.4, st, 4);
      oval(ctx, 18, -2, 14, 18, 0.3, st, 4);
      oval(ctx, 0, 24, 14, 18, 0.1, st, 4);
      dots(ctx, [[-12, 10], [22, 14], [1, 40]], 2, '#450A0A');
      shine(ctx, -22, -12, 3, 5);
      shine(ctx, 14, -8, 3, 5);
      shine(ctx, -4, 18, 3, 5);
      break;
    }
    case 37: {
      // Golden Cloudberry — amber raspberry-like aggregate
      sepals(ctx, 0, -32, 16, '#4ADE80');
      aggregate(ctx, [[-10, 10], [-20, 0, 20], [-10, 10], [0]], 12, '#FDE68A', '#F59E0B', -18, 15);
      break;
    }
    case 38: {
      // Amazon Acai Berry — bunch under a palm frond
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-46, -42);
      ctx.lineTo(34, -14);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const tx = -40 + i * 10;
        const ty = -40 + i * 3.4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 6, ty + 16);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 2, ty - 14);
        ctx.stroke();
      }
      drupes(ctx, [[-10, 6], [10, 6], [0, 20], [-18, 22], [18, 22], [-8, 36], [8, 36]], 11, '#6D28D9', '#1E1B4B', 3);
      shine(ctx, -13, 2, 2.5, 3.5, -0.4, 0.6);
      shine(ctx, 15, 18, 2.5, 3.5, -0.4, 0.6);
      break;
    }
    case 39: {
      // Miracle Sweet Berry — elongated red on leafy stem with sparkle
      stem(ctx, 0, 44, -2, 20, 0, 4, '#5B371E', 5);
      leaf(ctx, -2, 24, -2.8, 26, 8, '#166534');
      leaf(ctx, 2, 24, -0.35, 26, 8, '#15803D');
      ctx.fillStyle = grad(ctx, 0, -12, 26, [[0, '#FCA5A5'], [0.5, '#EF4444'], [1, '#991B1B']]);
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.bezierCurveTo(16, -36, 16, 10, 0, 14);
      ctx.bezierCurveTo(-16, 10, -16, -36, 0, -38);
      ctx.fill();
      outline(ctx);
      star(ctx, 20, -30, 7, '#FFFFFF', 4);
      shine(ctx, -6, -24, 3, 8, -0.1);
      break;
    }

    // ---------- CLOUD KINGDOM ----------
    case 40: {
      // Japanese Yuzu — bumpy yellow-green
      ctx.fillStyle = grad(ctx, 0, 4, 34, [[0, '#ECFCCB'], [0.5, '#A3E635'], [1, '#65A30D']]);
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i * Math.PI * 2) / 40;
        const r = 33 + 2.6 * Math.sin(i * 1.9);
        const x = Math.cos(a) * r;
        const y = 4 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      const tex: Pt[] = [];
      for (let i = 0; i < 18; i++) {
        const a = i * 2.4;
        const rr = 8 + (i % 4) * 6;
        tex.push([Math.cos(a) * rr, 4 + Math.sin(a) * rr]);
      }
      dots(ctx, tex, 1.9, 'rgba(63,98,18,0.4)');
      dots(ctx, [[0, -30]], 4, '#4D7C0F');
      leaf(ctx, -4, -30, -2.3, 22, 10, '#15803D');
      shine(ctx, -13, -8, 5, 8);
      break;
    }
    case 41: {
      // Ruby Dragonfruit — magenta with green flame scales
      ctx.fillStyle = grad(ctx, 0, 4, 46, [[0, '#F9A8D4'], [0.6, '#DB2777'], [1, '#9D174D']]);
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.bezierCurveTo(34, -28, 44, 16, 0, 42);
      ctx.bezierCurveTo(-44, 16, -34, -28, 0, -38);
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = '#4ADE80';
      ([[-24, -14, -0.6], [24, -14, 0.6], [-28, 10, -0.4], [28, 10, 0.4], [0, -42, 0], [0, 40, 3.14], [-14, 26, -0.8], [14, 26, 0.8]] as Array<[number, number, number]>).forEach(([sx, sy, rot]) => {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(8, -12, 14, 0);
        ctx.closePath();
        ctx.fill();
        outline(ctx, 3);
        ctx.restore();
      });
      shine(ctx, -12, -14, 5, 9);
      break;
    }
    case 42: {
      // Emerald Muscat Grape — green bunch
      grapeBunch(ctx, '#ECFCCB', '#84CC16', false);
      break;
    }
    case 43: {
      // Royal Concord Grape — purple bunch with tendril
      grapeBunch(ctx, '#C084FC', '#581C87', true);
      break;
    }
    case 44: {
      // Golden Quince — knobby pear shape
      stem(ctx, 0, -36, 3, -44, 8, -50, '#5B371E', 5);
      leaf(ctx, 4, -46, 0.4, 20, 9, '#15803D');
      ctx.fillStyle = grad(ctx, 0, 6, 46, [[0, '#FEF9C3'], [0.5, '#FACC15'], [1, '#CA8A04']]);
      ctx.beginPath();
      ctx.moveTo(0, -36);
      ctx.bezierCurveTo(18, -38, 26, -20, 28, -4);
      ctx.bezierCurveTo(40, 10, 40, 40, 0, 44);
      ctx.bezierCurveTo(-40, 40, -40, 10, -28, -4);
      ctx.bezierCurveTo(-26, -20, -18, -38, 0, -36);
      ctx.fill();
      outline(ctx);
      const kst: Stops = [[0, '#FEF08A'], [1, '#D97706']];
      ball(ctx, -30, 12, 7, kst, 3);
      ball(ctx, 30, 14, 7, kst, 3);
      ball(ctx, -18, 38, 7, kst, 3);
      ball(ctx, 20, 38, 7, kst, 3);
      shine(ctx, -8, -6, 12, 20, -0.2, 0.3);
      break;
    }
    case 45: {
      // Dragon Eye Longan — tan whole + peeled "eye"
      stem(ctx, -14, -30, -8, -40, 0, -46, '#5B371E', 4.5);
      ball(ctx, -14, -4, 26, [[0, '#F5DEB3'], [0.5, '#D4A373'], [1, '#8B5E34']]);
      dots(ctx, [[-24, -12], [-8, -16], [-16, 4], [-2, 0]], 1.6, 'rgba(120,80,40,0.45)');
      ball(ctx, 22, 14, 22, [[0, '#E9C99B'], [1, '#B07D45']]);
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(22, 10, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(22, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      shine(ctx, 18, 4, 3, 5, -0.3, 0.9);
      break;
    }
    case 46: {
      // Emerald Feijoa — oval whole + jelly-centre half
      oval(ctx, -14, 0, 22, 34, -0.15, [[0, '#86EFAC'], [0.5, '#16A34A'], [1, '#14532D']]);
      dots(ctx, [[-16, 33]], 4, '#3F2A16');
      oval(ctx, 24, 8, 20, 30, 0, [[0, '#4ADE80'], [1, '#166534']]);
      ctx.fillStyle = '#D9F99D';
      ctx.beginPath();
      ctx.ellipse(24, 8, 15, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F7FEE7';
      ctx.beginPath();
      ctx.ellipse(24, 8, 8, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(22,101,52,0.5)';
      ctx.lineWidth = 2;
      [[24, -8], [32, 8], [24, 24], [16, 8]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(24, 8);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
      break;
    }
    case 47: {
      // Ruby Blood Orange — orange outside, crimson slice
      leaf(ctx, -20, -32, -0.9, 22, 10);
      ball(ctx, -10, 4, 32, [[0, '#FDBA74'], [0.5, '#F97316'], [1, '#C2410C']]);
      disc(ctx, 26, 18, 22, '#F97316', '#FFF7ED', '#B91C1C', 8, 'rgba(255,255,255,0.75)');
      shine(ctx, -22, -8, 5, 8);
      break;
    }
    case 48: {
      // Sliced Emerald Kiwi
      ball(ctx, 0, 0, 42, [[0, '#A16207'], [1, '#78350F']]);
      ctx.fillStyle = grad(ctx, 0, 0, 38, [[0, '#FEF9C3'], [0.3, '#A3E635'], [1, '#65A30D']]);
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      const ks: Pt[] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16;
        ks.push([Math.cos(a) * 22, Math.sin(a) * 24]);
      }
      dots(ctx, ks, 2.2, '#18181B');
      break;
    }
    case 49: {
      // Ruby Pomegranate — crown + aril window
      ctx.fillStyle = grad(ctx, 0, 6, 46, [[0, '#FB7185'], [0.6, '#BE123C'], [1, '#881337']]);
      ctx.beginPath();
      ctx.moveTo(-14, -32);
      ctx.lineTo(-20, -44);
      ctx.lineTo(-8, -36);
      ctx.lineTo(0, -46);
      ctx.lineTo(8, -36);
      ctx.lineTo(20, -44);
      ctx.lineTo(14, -32);
      ctx.bezierCurveTo(44, -18, 44, 28, 16, 42);
      ctx.bezierCurveTo(0, 48, -16, 42, -16, 42);
      ctx.bezierCurveTo(-44, 28, -44, -18, -14, -32);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = '#4C0519';
      ctx.beginPath();
      ctx.arc(0, 10, 18, 0, Math.PI * 2);
      ctx.fill();
      drupes(ctx, [[-8, 6], [0, 2], [8, 6], [-6, 14], [6, 14], [0, 18]], 3.8, '#FDA4AF', '#F43F5E', 1.2);
      shine(ctx, -22, -14, 5, 10);
      break;
    }

    // ---------- DINO ISLAND ----------
    case 50: {
      // Golden Durian — spiky rim
      stem(ctx, 0, -38, 2, -46, 4, -52, '#5B371E', 5.5);
      ctx.fillStyle = grad(ctx, 0, 4, 44, [[0, '#FEF08A'], [0.5, '#CA8A04'], [1, '#713F12']]);
      ctx.beginPath();
      ctx.ellipse(0, 4, 34, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      outline(ctx);
      ctx.fillStyle = '#A16207';
      for (let i = 0; i < 18; i++) {
        const a = (i * Math.PI * 2) / 18;
        const bx = Math.cos(a) * 34;
        const by = 4 + Math.sin(a) * 40;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(bx - ny * 5, by + nx * 5);
        ctx.lineTo(bx + nx * 11, by + ny * 11);
        ctx.lineTo(bx + ny * 5, by - nx * 5);
        ctx.closePath();
        ctx.fill();
        outline(ctx, 2.5);
      }
      const th: Pt[] = [];
      for (let y = -22; y <= 30; y += 13) for (let x = -20; x <= 20; x += 13) th.push([x + (y % 26 === 0 ? 6 : 0), y]);
      dots(ctx, th, 2.4, '#854D0E');
      break;
    }
    case 51: {
      // Giant Jackfruit — bumpy hexagonal skin
      stem(ctx, 0, -38, 2, -46, 6, -52, '#5B371E', 6);
      oval(ctx, 0, 6, 34, 44, 0.1, [[0, '#D9F99D'], [0.5, '#84CC16'], [1, '#4D7C0F']]);
      for (let y = -30; y <= 42; y += 11) {
        const off = ((y / 11) % 2 === 0) ? 0 : 5.5;
        for (let x = -30 + off; x <= 30; x += 11) {
          if ((x / 34) ** 2 + ((y - 6) / 44) ** 2 < 0.82) {
            ctx.fillStyle = '#65A30D';
            ctx.beginPath();
            ctx.arc(x, y, 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(63,98,18,0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
      shine(ctx, -12, -18, 6, 12, -0.2, 0.35);
      break;
    }
    case 52: {
      // Tropical Breadfruit — hexagon-tiled round
      stem(ctx, 0, -36, 2, -44, 4, -50, '#5B371E', 6);
      ball(ctx, 0, 4, 40, [[0, '#BBF7D0'], [0.5, '#4ADE80'], [1, '#166534']]);
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 4, 38, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = 'rgba(20,83,45,0.55)';
      ctx.lineWidth = 2;
      const hs = 8;
      for (let row = -5; row <= 5; row++) {
        for (let col = -5; col <= 5; col++) {
          const hx = col * hs * 1.75 + (row % 2 ? hs * 0.875 : 0);
          const hy = 4 + row * hs * 1.5;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3 + Math.PI / 6;
            const px = hx + Math.cos(a) * hs;
            const py = hy + Math.sin(a) * hs;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
      break;
    }
    case 53: {
      // Prickly Cactus Pear — with cactus pad
      oval(ctx, -22, 20, 20, 26, -0.4, [[0, '#4ADE80'], [1, '#15803D']]);
      dots(ctx, [[-28, 8], [-16, 12], [-30, 24], [-18, 28], [-24, 38]], 1.8, '#FEF3C7');
      oval(ctx, 12, -4, 26, 34, 0.2, [[0, '#FB7185'], [0.5, '#E11D48'], [1, '#881337']]);
      ([[0, -24], [22, -18], [6, -2], [24, 6], [2, 18], [18, 24]] as Pt[]).forEach(([x, y]) => {
        dots(ctx, [[x, y]], 3, '#FEF3C7');
        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4, y - 5);
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y - 4);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 1, y + 6);
        ctx.stroke();
      });
      shine(ctx, 2, -20, 4, 8);
      break;
    }
    case 54: {
      // Spiky Rambutan — soft hairs
      ball(ctx, 0, 0, 34, [[0, '#FCA5A5'], [0.5, '#DC2626'], [1, '#991B1B']]);
      ctx.strokeStyle = '#84CC16';
      ctx.lineWidth = 3.5;
      for (let i = 0; i < 18; i++) {
        const a = (i * Math.PI * 2) / 18;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 32, Math.sin(a) * 32);
        ctx.quadraticCurveTo(Math.cos(a + 0.3) * 46, Math.sin(a + 0.3) * 46, Math.cos(a) * 50, Math.sin(a) * 50);
        ctx.stroke();
      }
      dots(ctx, Array.from({ length: 18 }, (_, i) => [Math.cos((i * Math.PI * 2) / 18) * 50, Math.sin((i * Math.PI * 2) / 18) * 50] as Pt), 2, '#EF4444');
      shine(ctx, -12, -12, 5, 8);
      break;
    }
    case 55: {
      // Golden Plantain — thick, straight, ridged
      ctx.rotate(-0.35);
      ctx.fillStyle = grad(ctx, 0, 0, 50, [[0, '#FEF3C7'], [0.5, '#EAB308'], [1, '#A16207']]);
      ctx.beginPath();
      ctx.moveTo(-40, -14);
      ctx.lineTo(30, -22);
      ctx.quadraticCurveTo(46, -18, 44, -6);
      ctx.lineTo(40, 14);
      ctx.quadraticCurveTo(36, 24, 24, 22);
      ctx.lineTo(-38, 12);
      ctx.quadraticCurveTo(-50, 6, -46, -6);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      ctx.strokeStyle = 'rgba(120,53,15,0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-36, -4);
      ctx.lineTo(34, -12);
      ctx.moveTo(-34, 6);
      ctx.lineTo(32, 0);
      ctx.stroke();
      dots(ctx, [[-44, -2]], 5, '#3F1F0A');
      dots(ctx, [[44, -8]], 4, '#3F1F0A');
      shine(ctx, -10, -12, 14, 3, -0.1, 0.5);
      break;
    }
    case 56: {
      // Orange Persimmon — flattened with 4-lobed calyx
      oval(ctx, 0, 8, 40, 32, 0, [[0, '#FED7AA'], [0.5, '#F97316'], [1, '#C2410C']]);
      ctx.fillStyle = '#4D7C0F';
      [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((a) => {
        ctx.save();
        ctx.translate(0, -20);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, -9, 7, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        outline(ctx, 3);
        ctx.restore();
      });
      dots(ctx, [[0, -22]], 5, '#3F2A16');
      shine(ctx, -16, -2, 7, 11);
      break;
    }
    case 57: {
      // Deep Purple Plum — cleft + dusty bloom
      stem(ctx, 0, -32, 3, -42, 8, -48, '#5B371E', 5);
      ball(ctx, 0, 6, 38, [[0, '#C4B5FD'], [0.45, '#6D28D9'], [1, '#2E1065']]);
      ctx.strokeStyle = 'rgba(46,16,101,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.quadraticCurveTo(8, 6, 0, 42);
      ctx.stroke();
      ctx.fillStyle = 'rgba(221,214,254,0.35)';
      ctx.beginPath();
      ctx.ellipse(-10, -6, 16, 20, -0.3, 0, Math.PI * 2);
      ctx.fill();
      shine(ctx, -15, -10, 5, 11);
      break;
    }
    case 58: {
      // Sweet Tamarind Pod — lumpy curved pod
      stem(ctx, -40, -24, -44, -32, -46, -40, '#5B371E', 4.5);
      const pts: Pt[] = [[-36, -18], [-22, -6], [-6, 4], [10, 12], [26, 16], [40, 14]];
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      pts.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.stroke();
      ctx.strokeStyle = '#A16207';
      ctx.lineWidth = 24;
      ctx.stroke();
      pts.forEach(([x, y]) => {
        ctx.fillStyle = grad(ctx, x, y, 13, [[0, '#D97706'], [1, '#92400E']]);
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = 'rgba(69,26,3,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2;
        const my = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.beginPath();
        ctx.moveTo(mx - 3, my - 12);
        ctx.lineTo(mx + 3, my + 12);
        ctx.stroke();
      }
      pts.forEach(([x, y], i) => { if (i % 2 === 0) shine(ctx, x - 4, y - 5, 3, 4, -0.4, 0.45); });
      break;
    }
    case 59:
    default: {
      // Astral Star Mango — kidney shape with sparkle
      ctx.rotate(-0.4);
      ctx.fillStyle = grad(ctx, 0, 0, 48, [[0, '#FEF08A'], [0.4, '#F59E0B'], [0.8, '#EF4444'], [1, '#B91C1C']]);
      ctx.beginPath();
      ctx.moveTo(-34, -10);
      ctx.bezierCurveTo(-30, -40, 20, -40, 36, -14);
      ctx.bezierCurveTo(50, 10, 20, 44, -8, 38);
      ctx.bezierCurveTo(-36, 32, -42, 10, -34, -10);
      ctx.closePath();
      ctx.fill();
      outline(ctx);
      stem(ctx, -30, -14, -34, -24, -36, -34, '#5B371E', 5);
      leaf(ctx, -32, -30, -0.2, 22, 9, '#15803D');
      star(ctx, 16, -20, 8, '#FFFFFF');
      star(ctx, 26, 2, 4, 'rgba(255,255,255,0.85)');
      shine(ctx, -12, -18, 8, 5, -0.3);
      break;
    }
  }

  ctx.restore();
}
