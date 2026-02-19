import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import p5 from 'p5';
import { PatternEngineService } from './services/pattern-engine.service';
import { ScoringEngineService } from './services/scoring-engine.service';
import { ProgressTrackerService } from './services/progress-tracker.service';
import { IPatternGenerator, PatternLayer, Difficulty } from './models/pattern.interface';

@Component({
    selector: 'app-rangoli-learning',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './rangoli-learning.component.html',
    styleUrls: ['./rangoli-learning.component.scss']
})
export class RangoliLearningComponent implements OnInit, OnDestroy {
    @ViewChild('targetCanvas', { static: false }) targetRef!: ElementRef;
    @ViewChild('playerCanvas', { static: false }) playerRef!: ElementRef;

    // State
    patterns: IPatternGenerator[] = [];
    currentPattern: IPatternGenerator | null = null;
    gameState: 'GALLERY' | 'PREVIEW' | 'PLAYING' | 'RESULTS' = 'GALLERY';

    // Game Vars
    p5Target: p5 | null = null;
    p5Player: p5 | null = null;
    accuracy: number = 0;
    startTime: number = 0;

    // Learning Aids
    showGhostOverlay: boolean = true;
    showGuides: boolean = true;

    // Gallery Pagination
    galleryTier: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';

    constructor(
        private patternService: PatternEngineService,
        private scoringService: ScoringEngineService,
        private progressService: ProgressTrackerService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.patterns = this.patternService.getPatterns();
    }

    ngOnDestroy(): void {
        this.cleanupP5();
    }

    selectPattern(pattern: IPatternGenerator): void {
        if (!this.progressService.isPatternUnlocked(pattern.id)) return;
        this.currentPattern = pattern;
        this.gameState = 'PREVIEW';
    }

    startLevel(): void {
        this.gameState = 'PLAYING';
        this.startTime = Date.now();
        this.cdr.detectChanges(); // Force DOM update so ViewChildren exist
        setTimeout(() => this.initGameLoop(), 100);
    }

    // --- P5 Initialization ---

    private initGameLoop(): void {
        this.cleanupP5();

        if (!this.targetRef || !this.playerRef) {
            console.error('Canvas elements not found!');
            return;
        }

        // Target Sketch
        const targetSketch = (p: p5) => {
            p.setup = () => {
                const w = this.targetRef.nativeElement.offsetWidth;
                const h = this.targetRef.nativeElement.offsetHeight;
                p.createCanvas(w, h);
                p.noLoop();
                this.renderTargetPattern(p);
            };
        };

        // Player Sketch
        const playerSketch = (p: p5) => {
            let userLayer: p5.Graphics; // Off-screen buffer for user drawings

            p.setup = () => {
                const w = this.playerRef.nativeElement.offsetWidth;
                const h = this.playerRef.nativeElement.offsetHeight;
                p.createCanvas(w, h);
                userLayer = p.createGraphics(w, h);
            };

            p.draw = () => {
                p.background(10, 10, 20); // Dark Background

                const cx = p.width / 2;
                const cy = p.height / 2;
                const size = Math.min(p.width, p.height) * 0.4;

                // 1. Draw Guides (Bottom Layer)
                if (this.showGuides && this.currentPattern) {
                    this.drawGuides(p);
                }

                // 2. Draw Ghost Overlay (Middle Layer)
                if (this.showGhostOverlay && this.currentPattern) {
                    p.push();
                    (p.drawingContext as any).globalAlpha = 0.2; // Faint transparency
                    this.currentPattern.generate(p, cx, cy, size);
                    p.pop();
                }

                // 3. Draw User Layer (Top Layer)
                p.image(userLayer, 0, 0);

                // Logic to draw on userLayer
                if (p.mouseIsPressed) {
                    // MANUAL DRAWING: No auto-symmetry loop.
                    // The user must manually replicate the pattern.

                    userLayer.push();
                    userLayer.translate(cx, cy);

                    const mx = p.mouseX - cx;
                    const my = p.mouseY - cy;
                    const pmx = p.pmouseX - cx;
                    const pmy = p.pmouseY - cy;

                    userLayer.stroke(255, 107, 157); // #FF6B9D
                    userLayer.strokeWeight(4);
                    userLayer.strokeCap(p.ROUND);

                    // Draw single stroke
                    userLayer.line(mx, my, pmx, pmy);

                    userLayer.pop();
                }
            };

            p.mouseReleased = () => {
                this.updateScore();
            };
        };

        this.p5Target = new p5(targetSketch, this.targetRef.nativeElement);
        this.p5Player = new p5(playerSketch, this.playerRef.nativeElement);
    }

    private drawGuides(p: p5): void {
        const axes = this.currentPattern?.symmetryAxes || 4;
        const cx = p.width / 2;
        const cy = p.height / 2;
        const r = Math.min(p.width, p.height) * 0.45;

        p.push();
        p.translate(cx, cy);
        p.stroke(255, 255, 255, 30); // Faint white for dark mode
        p.strokeWeight(1);
        p.noFill();

        // Radial lines
        for (let i = 0; i < axes; i++) {
            p.push();
            p.rotate(p.TWO_PI / axes * i);
            p.line(0, 0, r, 0);
            p.pop();
        }

        // Concentric circles
        p.circle(0, 0, r * 0.5);
        p.circle(0, 0, r * 1.0);
        p.pop();
    }

    private renderTargetPattern(p: p5): void {
        if (!this.currentPattern) return;
        p.background(10, 10, 20); // Dark Background
        const s = Math.min(p.width, p.height) * 0.4;
        this.currentPattern.generate(p, p.width / 2, p.height / 2, s);
    }

    private updateScore(): void {
        if (!this.p5Player || !this.p5Target) return;

        // Safety check for cached elements
        const playerCanvas = this.playerRef?.nativeElement?.querySelector('canvas');
        const targetCanvas = this.targetRef?.nativeElement?.querySelector('canvas');

        if (playerCanvas && targetCanvas && playerCanvas.width > 0 && targetCanvas.width > 0) {
            this.scoringService.calculateScore(playerCanvas, targetCanvas)
                .then(score => {
                    // NaN check
                    this.accuracy = isNaN(score) ? 0 : Math.round(score);
                })
                .catch(err => {
                    console.error("Scoring error:", err);
                    this.accuracy = 0;
                });
        }
    }

    finishLevel(): void {
        if (this.currentPattern) {
            const timeTaken = (Date.now() - this.startTime) / 1000;
            this.progressService.completePattern(this.currentPattern.id, this.accuracy, timeTaken);
            this.gameState = 'RESULTS';
        }
    }

    cleanupP5(): void {
        this.p5Target?.remove();
        this.p5Player?.remove();
        this.p5Target = null;
        this.p5Player = null;
    }

    // UI Helpers
    get filteredPatterns() {
        const start = this.galleryTier === 'Beginner' ? 0 :
            this.galleryTier === 'Intermediate' ? 15 : 35;
        const end = this.galleryTier === 'Beginner' ? 15 :
            this.galleryTier === 'Intermediate' ? 35 : 50;
        return this.patterns.slice(start, end);
    }

    isUnlocked(id: number): boolean {
        return this.progressService.isPatternUnlocked(id);
    }

    backToGallery(): void {
        this.gameState = 'GALLERY';
        this.cleanupP5();
    }
}
