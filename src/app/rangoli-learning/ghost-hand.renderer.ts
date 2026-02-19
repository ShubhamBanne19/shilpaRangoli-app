import type p5 from 'p5';
import type { GhostHandAnimation, Point } from './services/onboarding.service';

/**
 * GhostHandRenderer
 * ─────────────────────────────────────────────────────
 * Renders an animated "ghost" demonstration of the ideal technique
 * inside a p5.js sketch. Designed to be instantiated within a sketch's
 * setup() and updated each draw() frame.
 *
 * Usage inside a p5 sketch:
 *   const ghost = new GhostHandRenderer(p);
 *   ghost.startAnimation(step.demoAnimation);
 *   // In draw():
 *   ghost.update(p.deltaTime);
 *   ghost.draw();
 */
export class GhostHandRenderer {
    private animation: GhostHandAnimation | null = null;
    private progress = 0;  // 0-1 through the animation
    private isPlaying = false;

    constructor(private p5: p5) { }

    startAnimation(anim: GhostHandAnimation): void {
        this.animation = anim;
        this.progress = 0;
        this.isPlaying = true;
    }

    stopAnimation(): void {
        this.isPlaying = false;
        this.animation = null;
    }

    update(deltaTimeMs: number): void {
        if (!this.isPlaying || !this.animation) return;
        this.progress += deltaTimeMs / this.animation.duration;
        if (this.progress >= 1) this.progress = 0; // Loop
    }

    draw(): void {
        const anim = this.animation;
        if (!anim || !this.isPlaying) return;

        const p = this.p5;
        const totalPts = anim.path.length;
        const cur = Math.floor(this.progress * totalPts);
        const TRAIL = 25; // How many past points to draw

        p.push();

        // ── Trail (fade-out towards older points) ──────────────────
        for (let i = Math.max(0, cur - TRAIL); i < cur; i++) {
            const a = anim.path[i];
            const b = anim.path[i + 1];
            if (!b) continue;

            const age = cur - i;
            const opacity = 255 * (1 - age / TRAIL);
            const pressure = anim.pressureProfile?.[i] ?? 0.70;
            const lw = 2 + pressure * 6; // 2–8px

            p.stroke(200, 220, 255, opacity);   // Ice-blue ghost trail
            p.strokeWeight(lw);
            p.strokeCap(p.ROUND);
            p.noFill();
            p.line(a.x, a.y, b.x, b.y);
        }

        // ── Ghost cursor ───────────────────────────────────────────
        if (cur < totalPts) {
            const pt = anim.path[cur];
            const pressure = anim.pressureProfile?.[cur] ?? 0.70;
            const pulse = 18 + Math.sin(this.progress * Math.PI * 6) * 4;

            // Outer glow
            p.noStroke();
            p.fill(200, 220, 255, 25);
            p.ellipse(pt.x, pt.y, 44, 44);

            // Pulsing ring
            p.noFill();
            p.stroke(200, 220, 255, 120);
            p.strokeWeight(1.5);
            p.ellipse(pt.x, pt.y, pulse, pulse);

            // Inner dot (size driven by pressure)
            p.noStroke();
            p.fill(220, 235, 255, 210);
            const dotSize = 10 + pressure * 8;
            p.ellipse(pt.x, pt.y, dotSize, dotSize);
        }

        p.pop();
    }

    get isActive(): boolean { return this.isPlaying; }
}
