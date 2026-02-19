import {
    Component, ElementRef, OnDestroy, OnInit,
    ViewChild, ChangeDetectorRef, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import p5 from 'p5';

import { PatternEngineService } from './services/pattern-engine.service';
import { ScoringEngineService } from './services/scoring-engine.service';
import { ProgressTrackerService } from './services/progress-tracker.service';
import { OnboardingService } from './services/onboarding.service';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { STAGE_GUIDES, StageGuide } from './data/stage-guides.data';
import {
    IPatternGenerator, SkillMetrics, StrokePoint, GuruStage
} from './models/pattern.interface';

@Component({
    selector: 'app-rangoli-learning',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, OnboardingComponent],
    templateUrl: './rangoli-learning.component.html',
    styleUrls: ['./rangoli-learning.component.scss']
})
export class RangoliLearningComponent implements OnInit, OnDestroy {

    @ViewChild('targetCanvas', { static: false }) targetRef!: ElementRef;
    @ViewChild('playerCanvas', { static: false }) playerRef!: ElementRef;

    // ── Core State ─────────────────────────────────────────────────
    patterns: IPatternGenerator[] = [];
    currentPattern: IPatternGenerator | null = null;
    gameState: 'GALLERY' | 'PREVIEW' | 'PLAYING' | 'RESULTS' = 'GALLERY';

    // Gallery
    galleryTier: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';

    // Learning aids
    showGhostOverlay = true;
    showGuides = true;

    // ── Guru Protocol State ────────────────────────────────────────
    currentStage = signal<number>(1);
    guruScore = signal<number>(0);
    stageGuide = signal<StageGuide | null>(null);
    showInfoPopover = signal<boolean>(false);
    accuracy = 0;
    startTime = 0;

    // Real-time metrics (live during drawing)
    liveMetrics = signal<SkillMetrics>({
        pressureConsistency: 0,
        velocityConsistency: 0,
        angularPrecision: 0,
        strokeOrderCompliance: 0,
        flowStateIndex: 0
    });

    // Session tracking
    private sessionId = '';
    private sessionStart = 0;
    private completedMetrics: SkillMetrics = {
        pressureConsistency: 0, velocityConsistency: 0,
        angularPrecision: 0, strokeOrderCompliance: 0, flowStateIndex: 0
    };
    sessionFeedback: string[] = [];
    sessionPassed = false;
    newAchievements: any[] = [];
    finalGuruScore = 0;

    // Per-stroke live buffers
    private pressureBuf: number[] = [];
    private velocityPts: { x: number; y: number; t: number }[] = [];
    private strokeAngles: number[] = [];
    private strokeCounter = 0;

    // Stage info
    readonly stageGuides = STAGE_GUIDES;
    readonly GuruStage = GuruStage;

    // Computed
    stageLabel = computed(() => {
        const labels = ['Foundation', 'Control', 'Symmetry', 'Composition', 'Mastery'];
        return labels[(this.currentStage() - 1)] ?? 'Foundation';
    });

    guruScoreColor = computed(() => {
        const s = this.guruScore();
        if (s >= 85) return '#4ECDC4'; // Teal — Mastery
        if (s >= 65) return '#FFD93D'; // Gold — Advanced
        if (s >= 40) return '#FF6B9D'; // Pink — Intermediate
        return '#a0a0c0';              // Gray — Beginner
    });

    // ── p5 Instances ──────────────────────────────────────────────
    private p5Target: p5 | null = null;
    private p5Player: p5 | null = null;

    // ── Web Workers ───────────────────────────────────────────────
    private bioWorker: Worker | null = null;
    private flowWorker: Worker | null = null;
    private strokeWorker: Worker | null = null;

    constructor(
        public onboarding: OnboardingService,
        private patternService: PatternEngineService,
        private scoringService: ScoringEngineService,
        public progressService: ProgressTrackerService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.patterns = this.patternService.getPatterns();
        this.currentStage.set(this.progressService.currentStage());
        this.guruScore.set(this.progressService.guruScore());
        this.stageGuide.set(STAGE_GUIDES[this.currentStage() - 1]);
        this.initWorkers();
    }

    ngOnDestroy(): void {
        this.cleanupP5();
        this.terminateWorkers();
    }

    // ── Worker Lifecycle ──────────────────────────────────────────

    private initWorkers(): void {
        try {
            this.bioWorker = new Worker(new URL('./biomechanics.worker', import.meta.url), { type: 'module' });
            this.flowWorker = new Worker(new URL('./flow-state.worker', import.meta.url), { type: 'module' });
            this.strokeWorker = new Worker(new URL('./stroke-order.worker', import.meta.url), { type: 'module' });
        } catch (e) {
            console.warn('[Workers] Web Workers unavailable, scoring in-thread.', e);
        }
    }

    private terminateWorkers(): void {
        this.bioWorker?.terminate();
        this.flowWorker?.terminate();
        this.strokeWorker?.terminate();
        this.bioWorker = this.flowWorker = this.strokeWorker = null;
    }

    // ── Gallery ───────────────────────────────────────────────────

    get filteredPatterns() {
        const start = this.galleryTier === 'Beginner' ? 0 : this.galleryTier === 'Intermediate' ? 15 : 35;
        const end = this.galleryTier === 'Beginner' ? 15 : this.galleryTier === 'Intermediate' ? 35 : 50;
        return this.patterns.slice(start, end);
    }

    isUnlocked(id: number): boolean {
        return this.progressService.isPatternUnlocked(id);
    }

    selectPattern(pattern: IPatternGenerator): void {
        if (!this.progressService.isPatternUnlocked(pattern.id)) return;
        this.currentPattern = pattern;
        this.gameState = 'PREVIEW';
    }

    async startLevel(): Promise<void> {
        if (!this.currentPattern) return;
        this.gameState = 'PLAYING';
        this.startTime = Date.now();
        this.sessionStart = Date.now();
        this.resetLiveMetrics();

        this.sessionId = await this.progressService.startSession(
            this.currentPattern.id,
            this.currentStage()
        );

        this.cdr.detectChanges();
        setTimeout(() => this.initGameLoop(), 100);
    }

    // ── p5 Initialization ─────────────────────────────────────────

    private initGameLoop(): void {
        this.cleanupP5();
        if (!this.targetRef || !this.playerRef) {
            console.error('Canvas elements not found in DOM');
            return;
        }

        // Target (reference) canvas
        const targetSketch = (p: p5) => {
            p.setup = () => {
                const w = this.targetRef.nativeElement.offsetWidth;
                const h = this.targetRef.nativeElement.offsetHeight;
                p.createCanvas(w, h);
                p.noLoop();
                this.renderTargetPattern(p);
            };
        };

        // Player canvas with metric collection
        const playerSketch = (p: p5) => {
            let layer: p5.Graphics;
            let lastVelX = 0, lastVelY = 0, lastT = 0;

            p.setup = () => {
                const w = this.playerRef.nativeElement.offsetWidth;
                const h = this.playerRef.nativeElement.offsetHeight;
                p.createCanvas(w, h);
                layer = p.createGraphics(w, h);
            };

            p.draw = () => {
                p.background(10, 10, 20);

                if (this.showGuides && this.currentPattern) {
                    this.drawGuides(p);
                }

                if (this.showGhostOverlay && this.currentPattern) {
                    p.push();
                    (p.drawingContext as any).globalAlpha = 0.18;
                    this.currentPattern.generate(p, p.width / 2, p.height / 2, Math.min(p.width, p.height) * 0.4);
                    p.pop();
                }

                p.image(layer, 0, 0);

                if (p.mouseIsPressed && this.isOnCanvas(p)) {
                    const cx = p.width / 2;
                    const cy = p.height / 2;
                    const now = p.millis();

                    // ── Stroke metrics ──────────────────────────
                    const dx = p.mouseX - p.pmouseX;
                    const dy = p.mouseY - p.pmouseY;
                    const dt = now - lastT;
                    const speed = dt > 0 ? Math.hypot(dx, dy) / dt : 0; // px/ms

                    // Pressure: use PointerEvent if available, else velocity-inverse
                    const pressure = this.getPressure(speed);

                    this.pressureBuf.push(pressure);
                    this.velocityPts.push({ x: p.mouseX, y: p.mouseY, t: now });

                    // Track angle from center
                    const angle = Math.atan2(p.mouseY - cy, p.mouseX - cx) * (180 / Math.PI);
                    if ((p.mouseX - p.pmouseX) ** 2 + (p.mouseY - p.pmouseY) ** 2 > 16) {
                        this.strokeAngles.push(((angle % 360) + 360) % 360);
                    }

                    lastT = now;
                    lastVelX = dx; lastVelY = dy;

                    // ── Draw stroke ─────────────────────────────
                    layer.push();
                    layer.stroke(255, 107, 157);
                    layer.strokeWeight(3 + pressure * 5);
                    layer.strokeCap(p.ROUND);
                    layer.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
                    layer.pop();

                    // ── Pressure gauge (inline draw) ────────────
                    this.drawPressureBar(p, pressure);
                }
            };

            p.mouseReleased = () => {
                this.strokeCounter++;
                this.onStrokeEnd();
            };
        };

        this.p5Target = new p5(targetSketch, this.targetRef.nativeElement);
        this.p5Player = new p5(playerSketch, this.playerRef.nativeElement);
    }

    private isOnCanvas(p: p5): boolean {
        return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
    }

    private getPressure(speed: number): number {
        // 1. Check for PointerEvent pressure from the p5 canvas element
        const canvas = this.playerRef?.nativeElement?.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
            const pe = (canvas as any).__lastPressure as number | undefined;
            if (pe && pe > 0) return pe;
        }
        // 2. Velocity-inverse simulation: slow = controlled = ~70%, fast spikes = less control
        const clampedSpeed = Math.min(speed, 5); // px/ms cap
        return 0.55 + (1 - clampedSpeed / 5) * 0.20; // 0.55–0.75
    }

    // ── Per-stroke callback (async) ────────────────────────────────

    private async onStrokeEnd(): Promise<void> {
        if (this.pressureBuf.length === 0) return;

        const [pressureScore, velocityScore, angularScore] = await Promise.all([
            this.scorePressure(this.pressureBuf.slice()),
            this.scoreVelocity(this.velocityPts.slice()),
            this.scoreAngles(this.strokeAngles.slice(), this.currentPattern?.symmetryAxes ?? 4)
        ]);

        const combined: SkillMetrics = {
            pressureConsistency: pressureScore,
            velocityConsistency: velocityScore,
            angularPrecision: angularScore,
            strokeOrderCompliance: this.completedMetrics.strokeOrderCompliance || 1.0,
            flowStateIndex: (pressureScore + velocityScore + angularScore) / 3
        };

        this.liveMetrics.set(combined);

        // Update accuracy from visual scoring too
        this.updateVisualScore();
        this.cdr.markForCheck();
    }

    // ── Worker-backed scoring ─────────────────────────────────────

    private scorePressure(samples: number[]): Promise<number> {
        return new Promise((resolve) => {
            if (!this.bioWorker || samples.length < 2) { resolve(0.85); return; }
            const onMsg = (e: MessageEvent) => {
                this.bioWorker!.removeEventListener('message', onMsg);
                resolve(isNaN(e.data?.score) ? 0.85 : e.data.score);
            };
            this.bioWorker.addEventListener('message', onMsg);
            this.bioWorker.postMessage({ type: 'COMPUTE_PRESSURE', pressureSamples: samples });
        });
    }

    private scoreVelocity(pts: { x: number; y: number; t: number }[]): Promise<number> {
        return new Promise((resolve) => {
            if (!this.flowWorker || pts.length < 3) { resolve(0.85); return; }
            const onMsg = (e: MessageEvent) => {
                this.flowWorker!.removeEventListener('message', onMsg);
                resolve(isNaN(e.data?.score) ? 0.85 : e.data.score);
            };
            this.flowWorker.addEventListener('message', onMsg);
            this.flowWorker.postMessage({ type: 'COMPUTE_VELOCITY_CV', points: pts });
        });
    }

    private scoreAngles(angles: number[], symmetry: number): Promise<number> {
        return new Promise((resolve) => {
            if (!this.strokeWorker || angles.length < 2) { resolve(0.85); return; }
            const onMsg = (e: MessageEvent) => {
                this.strokeWorker!.removeEventListener('message', onMsg);
                resolve(isNaN(e.data?.score) ? 0.85 : e.data.score);
            };
            this.strokeWorker.addEventListener('message', onMsg);
            this.strokeWorker.postMessage({ type: 'COMPUTE_ANGULAR_ERROR', strokeAngles: angles, symmetryAxes: symmetry });
        });
    }

    // ── Visual Accuracy (existing worker) ─────────────────────────

    private updateVisualScore(): void {
        if (!this.p5Player || !this.p5Target) return;
        const playerEl = this.playerRef?.nativeElement?.querySelector('canvas') as HTMLCanvasElement;
        const targetEl = this.targetRef?.nativeElement?.querySelector('canvas') as HTMLCanvasElement;
        if (playerEl?.width > 0 && targetEl?.width > 0) {
            this.scoringService.calculateScore(playerEl, targetEl)
                .then(score => {
                    this.accuracy = isNaN(score) ? 0 : Math.round(Math.max(0, Math.min(100, score)));
                    this.cdr.markForCheck();
                })
                .catch(() => { this.accuracy = 0; });
        }
    }

    // ── Finish Level ──────────────────────────────────────────────

    async finishLevel(): Promise<void> {
        if (!this.currentPattern) return;
        const durationMs = Date.now() - this.sessionStart;

        // Final metrics
        const m = this.liveMetrics();

        const result = await this.progressService.completeSession(
            this.sessionId,
            this.currentStage(),
            this.currentPattern.id,
            m,
            durationMs
        );

        this.progressService.completePattern(
            this.currentPattern.id, this.accuracy, durationMs / 1000
        );

        this.completedMetrics = m;
        this.sessionFeedback = result.feedback;
        this.sessionPassed = result.passed;
        this.newAchievements = result.newAchievements;
        this.finalGuruScore = result.guruScore;
        this.guruScore.set(result.guruScore);
        this.currentStage.set(this.progressService.currentStage());
        this.stageGuide.set(STAGE_GUIDES[this.currentStage() - 1]);

        this.gameState = 'RESULTS';
        this.cdr.markForCheck();
    }

    // ── Drawing Helpers ───────────────────────────────────────────

    private renderTargetPattern(p: p5): void {
        if (!this.currentPattern) return;
        p.background(10, 10, 20);
        const s = Math.min(p.width, p.height) * 0.4;
        this.currentPattern.generate(p, p.width / 2, p.height / 2, s);
    }

    private drawGuides(p: p5): void {
        const axes = this.currentPattern?.symmetryAxes || 4;
        const cx = p.width / 2, cy = p.height / 2;
        const r = Math.min(p.width, p.height) * 0.45;
        p.push();
        p.translate(cx, cy);
        p.stroke(255, 255, 255, 25);
        p.strokeWeight(1);
        p.noFill();
        for (let i = 0; i < axes; i++) {
            p.push(); p.rotate(p.TWO_PI / axes * i); p.line(0, 0, r, 0); p.pop();
        }
        p.circle(0, 0, r * 0.5);
        p.circle(0, 0, r * 1.0);
        p.pop();
    }

    private drawPressureBar(p: p5, pressure: number): void {
        const x = p.width - 22;
        const h = p.height * 0.6;
        const y = (p.height - h) / 2;
        const filled = pressure * h;

        p.push();
        p.noStroke();

        // Background
        p.fill(255, 255, 255, 15);
        p.rect(x, y, 8, h, 4);

        // Level
        const c = this.pressureColor(pressure);
        p.fill(c.r, c.g, c.b, 200);
        p.rect(x, y + h - filled, 8, filled, 4);

        // Label
        p.fill(255, 255, 255, 80);
        p.textSize(8);
        p.textAlign(p.CENTER);
        p.text('P', x + 4, y - 6);
        p.pop();
    }

    private pressureColor(p: number): { r: number; g: number; b: number } {
        if (p < 0.50) return { r: 78, g: 205, b: 196 };  // Teal — too light
        if (p < 0.75) return { r: 255, g: 217, b: 61 };  // Gold — sweet spot
        return { r: 255, g: 107, b: 157 };   // Pink — too heavy
    }

    // ── Info Popover ──────────────────────────────────────────────

    openInfoPopover(): void {
        this.stageGuide.set(STAGE_GUIDES[this.currentStage() - 1]);
        this.showInfoPopover.set(true);
    }

    closeInfoPopover(): void {
        this.showInfoPopover.set(false);
    }

    // ── Utilities ─────────────────────────────────────────────────

    private resetLiveMetrics(): void {
        this.pressureBuf = [];
        this.velocityPts = [];
        this.strokeAngles = [];
        this.strokeCounter = 0;
        this.liveMetrics.set({
            pressureConsistency: 0, velocityConsistency: 0,
            angularPrecision: 0, strokeOrderCompliance: 0, flowStateIndex: 0
        });
    }

    cleanupP5(): void {
        this.p5Target?.remove();
        this.p5Player?.remove();
        this.p5Target = this.p5Player = null;
    }

    backToGallery(): void {
        this.gameState = 'GALLERY';
        this.cleanupP5();
        this.resetLiveMetrics();
        this.newAchievements = [];
    }

    metricPct(val: number): number { return Math.round(val * 100); }
    stageIsUnlocked(s: number): boolean { return this.progressService.isStageUnlocked(s); }
}
