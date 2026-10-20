export interface CertificateData {
  name: string;
  quests: number;
  totalQuests: number;
  stars: number;
  totalStars: number;
  xp: number;
  date: string;
}

const WIDTH = 1200;
const HEIGHT = 630;
const FONT = 'system-ui, Segoe UI, Roboto, sans-serif';

/** Draw a shareable completion certificate; returns null where canvas is unavailable (tests, old browsers). */
export function drawCertificate(data: CertificateData): HTMLCanvasElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow1 = ctx.createRadialGradient(120, 0, 0, 120, 0, 700);
  glow1.addColorStop(0, 'rgba(255, 92, 138, 0.3)');
  glow1.addColorStop(1, 'rgba(255, 92, 138, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow2 = ctx.createRadialGradient(WIDTH - 100, HEIGHT, 0, WIDTH - 100, HEIGHT, 700);
  glow2.addColorStop(0, 'rgba(139, 92, 246, 0.32)');
  glow2.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = 'rgba(232, 237, 248, 0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, WIDTH - 72, HEIGHT - 72);

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
  gradient.addColorStop(0, '#ff5c8a');
  gradient.addColorStop(1, '#8b5cf6');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#9aa8c7';
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText('ANGULAR QUEST · THE WORKSHOP', WIDTH / 2, 110);
  ctx.fillStyle = gradient;
  ctx.font = `900 56px ${FONT}`;
  ctx.fillText('Certificate of Completion', WIDTH / 2, 185);
  ctx.fillStyle = '#9aa8c7';
  ctx.font = `400 24px ${FONT}`;
  ctx.fillText('This certifies that', WIDTH / 2, 250);
  ctx.fillStyle = '#e8edf8';
  ctx.font = `800 64px ${FONT}`;
  ctx.fillText(data.name || 'An Angular Apprentice', WIDTH / 2, 330);
  ctx.fillStyle = '#9aa8c7';
  ctx.font = `400 24px ${FONT}`;
  ctx.fillText('turned the build green and mastered modern Angular:', WIDTH / 2, 385);
  ctx.fillText(
    'standalone components, signals, zoneless change detection, routing, testing and delivery.',
    WIDTH / 2,
    420,
  );
  ctx.fillStyle = '#fbbf24';
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText(
    `${data.quests} / ${data.totalQuests} quests · ★ ${data.stars} / ${data.totalStars} · ${data.xp} XP`,
    WIDTH / 2,
    485,
  );
  ctx.fillStyle = '#6b7a9b';
  ctx.font = `400 20px ${FONT}`;
  ctx.fillText(`${data.date} · angular-quest.vercel.app`, WIDTH / 2, 560);
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
