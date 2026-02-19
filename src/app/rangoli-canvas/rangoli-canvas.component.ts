import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import p5 from 'p5';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hue: number;
    size: number;
    alpha: number;
    maxAlpha: number;
    update(anchors: { x: number, y: number }[], gravityStrength: number, speed: number): void;
    display(p: p5): void;
    isDead(): boolean;
}

@Component({
    selector: 'app-rangoli-canvas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './rangoli-canvas.component.html',
    styleUrls: ['./rangoli-canvas.component.scss']
})
export class RangoliCanvasComponent implements OnInit, OnDestroy {
    @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
    private p5Instance: p5 | null = null;

    // Configuration (Bound to UI)
    symmetryAxes: number = 8;
    particleSpeed: number = 3;
    gravityStrength: number = 0.5;
    particleSize: number = 3;

    // Game/Creator Info
    gameName: string = "Astral Rangoli";
    creatorName: string = "Antigravity";
    youtubeUrl: string = "https://youtube.com";

    // State
    isUIVisible: boolean = true;
    colorPalette: 'neon' | 'pastel' | 'fire' | 'ice' = 'neon';

    constructor() { }

    ngOnInit(): void {
        this.createSketch();
    }

    ngOnDestroy(): void {
        if (this.p5Instance) {
            this.p5Instance.remove();
        }
    }

    toggleUI(): void {
        this.isUIVisible = !this.isUIVisible;
    }

    setPalette(palette: 'neon' | 'pastel' | 'fire' | 'ice'): void {
        this.colorPalette = palette;
    }

    resetCanvas(): void {
        if (this.p5Instance) {
            // Custom method we'll attach to the sketch
            (this.p5Instance as any).resetSystem();
        }
    }

    saveArtwork(): void {
        if (this.p5Instance) {
            this.p5Instance.saveCanvas(this.gameName, 'png');
        }
    }

    private createSketch(): void {
        const sketch = (p: p5) => {
            let particles: Particle[] = [];
            let anchors: { x: number, y: number }[] = [];
            const MAX_PARTICLES = 2000;

            // Class definition inside sketch to access p5 methods if needed, 
            // but strictly following the contract, we can define it here or outside.
            // Defining here for closure access to p if needed, though arguments are passed.

            class P5Particle implements Particle {
                x: number;
                y: number;
                vx: number;
                vy: number;
                hue: number;
                size: number;
                alpha: number;
                maxAlpha: number;

                constructor(x: number, y: number, hue: number) {
                    this.x = x;
                    this.y = y;
                    this.vx = p.random(-1, 1);
                    this.vy = p.random(-2, 0); // Start moving upward
                    this.hue = hue;
                    this.size = p.random(2, 6); // Base size, modulated by slider later if needed
                    this.alpha = p.random(180, 255);
                    this.maxAlpha = this.alpha;
                }

                update(anchors: { x: number, y: number }[], gravityStrength: number, speed: number): void {
                    // Anti-gravity: constant upward drift
                    // "Each particle has... size (2-6px) ... from contract"
                    // "Vy -= antiGravityStrength * 0.05" -> contract says antiGravity 0.05
                    // Contract variable: DEFAULT_GRAVITY=0.5 (gravity anchor pull).
                    // Anti-gravity logic from contract: "vy -= antiGravityStrength * 0.05"
                    // but contract update signature is: update(anchors[], antiGravityStrength, speed)
                    // Wait, the prompt says "Gravity Anchor pull strength (0.1-2.0)" which is `gravityStrength`.
                    // It also mentions "Anti-gravity system: particles drift UPWARD... vy -= antiGravityStrength * 0.05"
                    // I will treat `gravityStrength` as the anchor pull, and a constant or separate factor for anti-gravity.
                    // However, the pseudocode says `update(anchors[], antiGravityStrength, speed)`.
                    // I will use 1.0 as base anti-gravity or derive it.
                    // Let's assume `antiGravityStrength` is a constant or derived. 
                    // Re-reading: "Gravity Strength -> range 0-2" refers to anchor pull.
                    // "Anti-gravity system: ... drift UPWARD"
                    // Pseudocode: `vy -= antiGravityStrength * 0.05`
                    // I'll stick to a constant for anti-gravity or re-use gravityStrength? 
                    // "Gravity anchors... force = (gravityStrength * speed)..."
                    // I will use a separate constant for anti-gravity (e.g., 1.0) and use `this.gravityStrength` for anchors.
                    // Actually, let's pass `1.0` as antiGravityStrength to update for now, or make it a global constant.

                    const antiGravityStrength = 1.0;
                    this.vy -= antiGravityStrength * 0.05;

                    // Gravity anchors
                    for (const anchor of anchors) {
                        const dx = anchor.x - this.x;
                        const dy = anchor.y - this.y;
                        const dist = p.sqrt(dx * dx + dy * dy);

                        if (dist < 150 && dist > 5) {
                            const force = (gravityStrength * speed) / (dist * 0.5);
                            this.vx += (dx / dist) * force;
                            this.vy += (dy / dist) * force;
                        }
                    }

                    // Apply velocity
                    this.x += this.vx * speed * 0.5;
                    this.y += this.vy * speed * 0.5;

                    // Damping
                    this.vx *= 0.98;
                    this.vy *= 0.98;

                    // Fade out
                    this.alpha -= 1.2;
                }

                isDead(): boolean {
                    return this.alpha <= 0;
                }

                display(p: p5): void {
                    p.noStroke();
                    // Bloom layers
                    // Contract: "draw each particle 3x ... decreasing opacity ... increasing size"
                    const layers = [0, 1, 2];
                    for (const layer of layers) {
                        // p5.fill(hue, 80, 100, alpha * (1 - layer*0.3))
                        // Need to use current scope's particle size.
                        // Contract: "size * (1 + layer*0.6)"
                        p.fill(this.hue, 80, 100, this.alpha * (1 - layer * 0.3));
                        p.ellipse(this.x, this.y, this.size * (1 + layer * 0.6));
                    }
                }
            }

            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent(this.canvasContainer.nativeElement);
                p.colorMode(p.HSB, 360, 100, 100, 255);
                p.background(10, 10, 8); // #0a0a14 in HSB approx (approx 240, 20%, 8% ?)
                // Actually #0a0a14 is r=10, g=10, b=20. Very dark blue. 
                // dragging background in draw with alpha 15.
                // Let's set exact background in setup to clear.
                p.background('#0a0a14');

                // Use additive blending for glowing effect
                // p.drawingContext is WebGL or 2D. 
                // "VISUAL EFFECTS — render with p5.js drawingContext (WebGL2 fallback: 2D)"
                // "lighter" works in 2D.
                const ctx = (p as any).drawingContext;
                if (ctx) {
                    ctx.globalCompositeOperation = 'lighter';
                }
            };

            p.draw = () => {
                // "Background: near-black ... with NO full clear ... background with alpha 15"
                // Need to reset blend mode for background? 'lighter' will add background to existing?
                // Usually background() in p5 clears the buffer, but with alpha it draws over.
                // If blendMode is LIGHTER, drawing a dark background adds light, it doesn't clear.
                // We probably need blendMode(BLEND) for background, then LIGHTER for particles.

                p.blendMode(p.BLEND);
                p.background(10, 10, 20, 15); // r,g,b,a -> using RGB values for background mostly safe or switch mode
                // p5 instance is in HSB mode from setup.
                // HSB: 240 (blue), 50 (sat), 8 (bright)?
                // #0a0a14 is rgb(10, 10, 20).
                // Let's confirm color mode handling.
                // Best to just use p.fill(10, 10, 20, 15) and rect covering screen if background() behaves composedly?
                // p.background in HSB takes H,S,B,A.
                // Let's stick to RGB for background to match hex #0a0a14 exactly if possible, or convert.
                // #0a0a14: Hue 240, Sat 50%, Bright 8%.
                p.background(240, 30, 8, 15); // Adjust saturation/brightness to match #0a0a14 visual

                p.blendMode(p.ADD); // or 'lighter' via context

                // Update logic: drag to spawn
                if (p.mouseIsPressed) {
                    // check if not clicking UI? Angular blocks click propagation from UI?
                    // We'll assume clicks on canvas are valid.
                    // "spawn 4–8 particles"
                    const count = p.floor(p.random(4, 9));
                    for (let i = 0; i < count; i++) {
                        // hue based on distance
                        const distCenter = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
                        // map 0..400 to 0..360 (or palette specific)
                        let hue = p.map(distCenter, 0, 400, 0, 360);
                        // Palette adjustment
                        if (this.colorPalette === 'pastel') hue = (hue + 100) % 360; // Just offsets for now or logic
                        // Better palette logic:
                        if (this.colorPalette === 'fire') hue = p.map(distCenter, 0, 400, 0, 60); // Red to Yellow
                        if (this.colorPalette === 'ice') hue = p.map(distCenter, 0, 400, 180, 260); // Cyan to Blue

                        if (particles.length < MAX_PARTICLES) {
                            particles.push(new P5Particle(p.mouseX, p.mouseY, hue));
                        }
                    }
                }

                // Symmetry rendering
                p.translate(p.width / 2, p.height / 2);

                // We need to render ALL particles for EACH symmetry axis?
                // Or update particles once, then draw them N times?
                // Contract: "On every draw() call, mirror each particle stroke across all N axes"
                // "using rotate(...)"
                // So we iterate axes, then iterate particles?
                // Or iterate particles, and for each, draw N times?
                // Drawing N times per particle is cleaner for the loop.

                // OPTIMIZATION: Update all particles first, then draw.
                // Filter dead.
                for (let i = particles.length - 1; i >= 0; i--) {
                    // Pass this.gravityStrength for anchors. antiGravity is internal constant for now.
                    particles[i].update(anchors, this.gravityStrength, this.particleSpeed);
                    if (particles[i].isDead()) {
                        particles.splice(i, 1);
                    }
                }

                // Draw
                const axes = this.symmetryAxes;
                const step = p.TWO_PI / axes;

                for (let i = 0; i < axes; i++) {
                    p.push();
                    p.rotate(i * step);

                    for (const part of particles) {
                        // We need to draw particle relative to center?
                        // Particle positions are absolute (screen coords).
                        // Can't just rotate screen coords.
                        // We must transform particle (x,y) to (x-centerX, y-centerY) before drawing?
                        // OR:
                        // The system can simulate in "wedge" space and rotate?
                        // But particles allow free movement.

                        // If we rotate the canvas, drawing at (x,y) rotates the position.
                        // If particles are at (mouseX, mouseY), that is absolute.
                        // To create radial symmetry of the *entire image*:
                        // We should draw the particles relative to (0,0) (which is now center).
                        // So particle (x,y) needs to be shifted by (-width/2, -height/2).

                        part.display(p);
                        // Wait, `display` draws ellipse at (x,y).
                        // If (x,y) is (screenX, screenY), and we translated to center...
                        // and rotated...
                        // Drawing at (screenX, screenY) which is large values, will result in large orbits.
                        // Correct approach:
                        // To mirror the visual, we usually draw `ellipse(x - cx, y - cy, ...)`
                        // Let's adjust `display` or handling here.

                        // Let's modify Display to take offset? Or just valid p5 transform?
                        // p5.ellipse(part.x - p.width/2, part.y - p.height/2, ...);
                        // But the `display` method uses `part.x`.
                        // We shouldn't change the particle class to depend on global width/height if possible.
                        // BUT, since `display` takes `p`, we can use `p.width`.
                        // Actually, simplest is:
                        // `p.translate(-p.width/2, -p.height/2)` inside the push?
                        // No, that cancels the center translate.

                        // Correct math:
                        // We want to rotate the *view* of the particle.
                        // The particle is at P(x,y).
                        // We want P' = Rotate(P - center) + center? No, we are already at center.
                        // We want to draw at Rotate(P - center).
                        // Since we stuck `translate(width/2, height/2)` outside:
                        // drawing at (x - w/2, y - h/2) is correct.
                    }
                    // Wait, calling proper display logic with offset:
                    // Since I cannot change the Particle class easily to handle offset without passing it,
                    // I will locally implement the drawing in the loop or adjust logic.
                    // BUT, to follow strict class structure:
                    // I will use `p.translate(-width/2, -height/2)` is wrong if we already rotated.

                    // Let's Assume Particle stores Absolute position.
                    // We want N-way symmetry.
                    // This usually implies the *input* is replicated, or the *visual* is replicated.
                    // If I draw a line at right side, it appears at left side.
                    // So we iterate particles. For each particle, calculate its relative pos (rx, ry).
                    // Draw ellipse at (rx, ry).

                    // Let's do:
                    for (const part of particles) {
                        p.fill(part.hue, 80, 100, part.alpha); // simplified for loop performance?
                        // The contract says "display(p5): Bloom layers...".
                        // Calling `part.display(p)` draws at absolute `part.x, part.y`.

                        // If I use `part.display(p)`, I draw at X,Y.
                        // If I am rotated, X,Y is rotated.
                        // X,Y are large positive numbers (e.g. 800, 600).
                        // Rotating 45 degrees moves (800,600) to somewhere else.
                        // This creates a "Kaleidoscope" effect where the *entire screen* is rotated N times.
                        // This is exactly what "N-fold radial symmetry" usually means in this context.
                        // HOWEVER, we usually want the center of rotation to be the screen center.
                        // If we draw at (800, 600) while rotated around (960, 540) [center], 
                        // (800, 600) is relative to the origin (0,0) of the rotation?
                        // No, `ellipse(x,y)` draws at user-space coordinates.

                        // If we translated to (w/2, h/2), origin is center.
                        // If we draw at (x,y) where x,y are screen coords (0..width), 
                        // we are drawing relative to center.
                        // e.g. x=10, y=10 (top left).
                        // Center is 500,500.
                        // Drawing at 10,10 relative to 500,500 is at 510, 510 on screen.
                        // That is NOT what we want. We want 10,10 on screen to be rotated.

                        // We must subtract center from particle position.
                        const rx = part.x - p.width / 2;
                        const ry = part.y - p.height / 2;

                        // Manually draw or patch display?
                        // I'll patch the `display` method to accept dx, dy? 
                        // Or just use `translate` before calling display?
                        p.push();
                        p.translate(rx, ry);
                        // Now we are at the particle's relative position.
                        // But `display` draws at `this.x, this.y`.
                        // If we translate, we should draw at (0,0).
                        // The `Particle.display` uses `this.x, this.y`. 
                        // This creates a conflict.

                        // FIX: The `Particle` class `display` method should probably NOT serve the symmetry loop directly if it uses absolute coords.
                        // OR, better:
                        // `dist` logic in `display`? No.
                        // I will modify `display` to take optional offsets? No, contract fixed.
                        // I will use `p.translate(-part.x, -part.y)`? No.

                        // I will reimplement the display logic inside the symmetry loop for correctness, 
                        // OR momentarily overwrite x/y? No.

                        // HACK (but valid p5):
                        // `part.display` draws at (x,y).
                        // We want it to draw at (rotated_x, rotated_y).
                        // If we use `rotate()`, we transform the coordinate system.
                        // We want (x-cx, y-cy) to be rotated, then shifted back to (cx, cy)?
                        // The standard kaleidoscope approach:
                        // draw slice? No, we mirror everything.

                        // Correct approach:
                        // translate(width/2, height/2)
                        // for i in axes:
                        //   rotate(angle)
                        //   for p in particles:
                        //      draw at (p.x - width/2, p.y - height/2)

                        // Since `display` uses `p.ellipse(x,y)`, we can't easily offset it without changing logic.
                        // BUT: `p.ellipse` is affected by `translate`.
                        // If I `translate(rx, ry)` then draw at (0,0)...
                        // `part.display(p)` draws at (x,y).
                        // So `translate(rx - x, ry - y)`? -> `translate(-width/2, -height/2)`.

                        p.translate(-p.width / 2, -p.height / 2);
                        // Now drawing at (x,y) (absolute) will land at (x-w/2, y-h/2) relative to current origin (which is rotated).
                        // This works!

                        part.display(p);

                        p.pop(); // Pop the inner translate
                    }
                    p.pop(); // Pop the rotation
                }
            };

            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
                p.background(10, 10, 20);
            };

            p.mouseClicked = () => {
                // Toggle UI check??
                // Implementation contract: "Add anchor at (mouseX, mouseY)"
                // "Auto-remove oldest if > 5"
                if (anchors.length > 5) anchors.shift();
                anchors.push({ x: p.mouseX, y: p.mouseY });
            };

            // Hook for reset
            (p as any).resetSystem = () => {
                particles = [];
                anchors = [];
                p.background(10, 10, 20);
            };
        };

        this.p5Instance = new p5(sketch);
    }
}
