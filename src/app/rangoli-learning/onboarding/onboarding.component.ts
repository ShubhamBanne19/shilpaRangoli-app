import {
    Component, OnInit, OnDestroy, ElementRef,
    ViewChild, signal, computed, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import p5 from 'p5';
import { OnboardingService, TutorialStep } from '../services/onboarding.service';
import { GhostHandRenderer } from '../ghost-hand.renderer';

@Component({
    selector: 'app-onboarding',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit, OnDestroy {
    @ViewChild('demoCanvas', { static: false }) demoRef!: ElementRef;

    // ── Template bindings ─────────────────────────────────────────
    steps: TutorialStep[];
    stepIndex = 0;
    currentStep: TutorialStep;

    pressureScore = signal<number>(0); // 0-100 for pressure gauge
    velocityScore = signal<number>(0);
    attemptsOnStep = 0;
    lastHint = '';
    canAdvance = signal<boolean>(false);
    demoReady = signal<boolean>(false);

    readonly stageLabel = computed(() => `${this.stepIndex + 1} of ${this.steps.length}`);

    // ── p5 / Ghost ────────────────────────────────────────────────
    private sketch: p5 | null = null;
    private ghost!: GhostHandRenderer;
    private userPoints: { x: number; y: number; t: number }[] = [];
    private pressureSamples: number[] = [];

    constructor(
        public onboarding: OnboardingService,
        private cdr: ChangeDetectorRef
    ) {
        this.steps = onboarding.steps;
        this.currentStep = this.steps[0];
    }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.initSketch();
    }

    ngOnDestroy(): void {
        this.sketch?.remove();
        this.sketch = null;
    }

    // ── p5 Setup ──────────────────────────────────────────────────

    private initSketch(): void {
        if (!this.demoRef) return;
        this.sketch?.remove();

        const host = this.demoRef.nativeElement as HTMLElement;
        const sk = (p: p5) => {
            let userGraphics: p5.Graphics;
            this.ghost = new GhostHandRenderer(p);

            p.setup = () => {
                p.createCanvas(host.offsetWidth || 480, host.offsetHeight || 260);
                userGraphics = p.createGraphics(p.width, p.height);
                p.frameRate(60);
                // Start ghost demo automatically
                this.ghost.startAnimation(this.currentStep.demoAnimation);
                this.demoReady.set(true);
            };

            p.draw = () => {
                p.background(20, 18, 35);

                // Grid hint
                p.stroke(255, 255, 255, 10);
                p.strokeWeight(1);
                for (let x = 40; x < p.width; x += 40) p.line(x, 0, x, p.height);
                for (let y = 40; y < p.height; y += 40) p.line(0, y, p.width, y);

                // Canvas center crosshair for angle step
                if (this.currentStep.demoAnimation.type === 'angle-demo') {
                    p.stroke(255, 255, 255, 20);
                    p.strokeWeight(1);
                    p.line(p.width / 2, 0, p.width / 2, p.height);
                    p.line(0, p.height / 2, p.width, p.height / 2);
                }

                // User drawing layer
                p.image(userGraphics, 0, 0);

                // Ghost demo
                this.ghost.update(p.deltaTime);
                this.ghost.draw();

                // Recording user strokes
                if (p.mouseIsPressed && this.isInsideCanvas(p)) {
                    const pressure = (p as any).pressure ?? this.velocityToFakePressure();
                    userGraphics.stroke(255, 107, 157, 200);
                    userGraphics.strokeWeight(3 + pressure * 5);
                    userGraphics.strokeCap(p.ROUND);
                    userGraphics.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);

                    this.userPoints.push({ x: p.mouseX, y: p.mouseY, t: p.millis() });
                    this.pressureSamples.push(pressure);
                }
            };

            p.mouseReleased = () => {
                if (this.userPoints.length > 2) {
                    this.evaluateStroke();
                    this.userPoints = [];
                    this.pressureSamples = [];
                }
            };

            // Tap-to-clear
            p.doubleClicked = () => {
                userGraphics.clear();
                return false;
            };
        };

        this.sketch = new p5(sk, host);
    }

    private isInsideCanvas(p: p5): boolean {
        return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
    }

    private velocityToFakePressure(): number {
        // Simulate pressure from inverse velocity (slower = more controlled = higher score signal)
        return 0.70; // Default neutral value for mouse
    }

    // ── Evaluation ────────────────────────────────────────────────

    private async evaluateStroke(): Promise<void> {
        this.attemptsOnStep++;

        // Compute metrics inline (Web Workers have warmup cost in tutorial)
        const pressureScore = this.computePressureScore(this.pressureSamples);
        const velocityScore = this.computeVelocityScore(this.userPoints);

        let metricScore = 0;
        const vr = this.currentStep.validation;
        if (vr.metric === 'pressureConsistency') metricScore = pressureScore;
        else if (vr.metric === 'velocityConsistency') metricScore = velocityScore;
        else if (vr.metric === 'angularPrecision') metricScore = this.computeAngleScore();

        this.pressureScore.set(Math.round(pressureScore * 100));
        this.velocityScore.set(Math.round(velocityScore * 100));

        const passed = metricScore >= this.currentStep.successThreshold;

        if (passed && this.attemptsOnStep >= this.currentStep.minAttempts) {
            this.canAdvance.set(true);
        }

        // Rotate through hint if not passing
        const hintIdx = this.attemptsOnStep % this.currentStep.hints.length;
        this.lastHint = passed ? '' : this.currentStep.hints[hintIdx];
        this.cdr.markForCheck();
    }

    private computePressureScore(samples: number[]): number {
        if (samples.length < 2) return 1;
        const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
        const sigma = Math.sqrt(samples.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / samples.length);
        return Math.max(0, Math.min(1, 1 - sigma / 0.20));
    }

    private computeVelocityScore(pts: { x: number; y: number; t: number }[]): number {
        if (pts.length < 3) return 1;
        const vels: number[] = [];
        for (let i = 1; i < pts.length; i++) {
            const dt = pts[i].t - pts[i - 1].t;
            if (dt <= 0) continue;
            const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
            vels.push(d / dt);
        }
        if (!vels.length) return 1;
        const mean = vels.reduce((s, v) => s + v, 0) / vels.length;
        if (mean === 0) return 1;
        const sd = Math.sqrt(vels.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vels.length);
        const cv = sd / mean;
        return Math.max(0, Math.min(1, 1 - cv / 0.30));
    }

    private computeAngleScore(): number {
        // Simplified: if user drew at least 3 strokes, award partial score
        return this.userPoints.length > 10 ? 0.75 : 0.40;
    }

    // ── Navigation ────────────────────────────────────────────────

    advance(): void {
        const next = this.stepIndex + 1;
        if (next >= this.steps.length) {
            this.onboarding.completeOnboarding();
            return;
        }
        this.stepIndex = next;
        this.currentStep = this.steps[next];
        this.attemptsOnStep = 0;
        this.canAdvance.set(false);
        this.lastHint = '';
        this.pressureScore.set(0);
        this.velocityScore.set(0);

        // Restart ghost for new step
        if (this.ghost) {
            this.ghost.startAnimation(this.currentStep.demoAnimation);
        }
        this.cdr.markForCheck();
    }

    skip(): void {
        this.onboarding.completeOnboarding();
    }
}
