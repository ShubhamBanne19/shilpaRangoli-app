import { Injectable, signal } from '@angular/core';

// ========== INTERFACES ==========

export interface Point { x: number; y: number; }

export interface GhostHandAnimation {
    type: 'pressure-demo' | 'velocity-demo' | 'angle-demo';
    duration: number;         // ms
    path: Point[];
    pressureProfile?: number[]; // Synchronized 0-1 values
    label: string;
    audioHint?: string;
}

export interface ValidationRule {
    metric: 'pressureConsistency' | 'velocityConsistency' | 'angularPrecision';
    threshold: number;
    feedbackMessage: string;
}

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    demoAnimation: GhostHandAnimation;
    validation: ValidationRule;
    minAttempts: number;
    successThreshold: number;
    hints: string[];
}

// =======================================================================

@Injectable({ providedIn: 'root' })
export class OnboardingService {
    private readonly KEY = 'shilparangoli-onboarding-complete';

    // Angular Signal — synchronous reactive state
    isOnboardingComplete = signal<boolean>(false);
    currentStep = signal<number>(0);

    readonly steps: TutorialStep[] = [
        {
            id: 'grip_introduction',
            title: 'Step 1 · The Sacred Grip',
            description: 'Watch the ghost hand hold the virtual brush. Notice the steady pressure — never tense, never limp.',
            demoAnimation: {
                type: 'pressure-demo',
                duration: 5000,
                path: this.straightLinePath(),
                pressureProfile: this.constantPressure(0.70, 100),
                label: 'Constant 70% pressure — notice the steady line width'
            },
            validation: {
                metric: 'pressureConsistency',
                threshold: 0.20,   // Allow σ < 0.20 for this intro step
                feedbackMessage: 'Try to match the ghost hand\'s steady pressure'
            },
            minAttempts: 2,
            successThreshold: 0.65,
            hints: [
                'Rest your ring and pinky fingers on the desk',
                'Wrist stays relaxed — never tense',
                'Think of holding a delicate grain of rice'
            ]
        },
        {
            id: 'velocity_control',
            title: 'Step 2 · Steady as a Stream',
            description: 'The ghost hand moves at a constant speed. Your line should flow like honey — smooth and unbroken.',
            demoAnimation: {
                type: 'velocity-demo',
                duration: 6000,
                path: this.curvedPath(),
                label: 'Constant speed along an S-curve',
                audioHint: 'Match the rhythm of your breathing to the motion'
            },
            validation: {
                metric: 'velocityConsistency',
                threshold: 0.25,
                feedbackMessage: 'Your speed is too jerky. Breathe out slowly as you draw.'
            },
            minAttempts: 2,
            successThreshold: 0.65,
            hints: [
                'Exhale slowly as you draw the line',
                'Don\'t focus on the cursor tip — see the whole line',
                'Pretend you\'re drawing through honey'
            ]
        },
        {
            id: 'angle_awareness',
            title: 'Step 3 · The Compass Within',
            description: 'Draw four strokes at perfect 90° angles from the center. Imagine a clock: 12, 3, 6, 9.',
            demoAnimation: {
                type: 'angle-demo',
                duration: 8000,
                path: this.radialPath(4),
                label: '4-fold radial strokes at 0°, 90°, 180°, 270°'
            },
            validation: {
                metric: 'angularPrecision',
                threshold: 8,  // degrees error allowed in tutorial
                feedbackMessage: 'Use the clock face: pivot your wrist at the center'
            },
            minAttempts: 2,
            successThreshold: 0.60,
            hints: [
                'Your wrist is the pivot — rotate, don\'t translate',
                'Visualize a clock overlay on the canvas',
                'Count out loud: "Twelve… three… six… nine…"'
            ]
        }
    ];

    constructor() {
        const done = localStorage.getItem(this.KEY);
        this.isOnboardingComplete.set(done === 'true');
    }

    completeOnboarding(): void {
        localStorage.setItem(this.KEY, 'true');
        this.isOnboardingComplete.set(true);
    }

    resetOnboarding(): void {
        localStorage.removeItem(this.KEY);
        this.isOnboardingComplete.set(false);
        this.currentStep.set(0);
    }

    nextStep(): void {
        const next = this.currentStep() + 1;
        if (next >= this.steps.length) {
            this.completeOnboarding();
        } else {
            this.currentStep.set(next);
        }
    }

    // ── Path Generators ──────────────────────────────────────────────

    private straightLinePath(): Point[] {
        return Array.from({ length: 100 }, (_, i) => ({
            x: 60 + i * 2.8,   // Across ~280px
            y: 200
        }));
    }

    private curvedPath(): Point[] {
        const pts: Point[] = [];
        for (let t = 0; t <= 1; t += 0.01) {
            pts.push({
                x: 60 + t * 360,
                y: 200 + Math.sin(t * Math.PI * 2) * 70
            });
        }
        return pts;
    }

    private radialPath(axes: number): Point[] {
        const cx = 240, cy = 200, r = 120;
        const pts: Point[] = [];
        for (let i = 0; i < axes; i++) {
            const angle = (i * 360 / axes) * (Math.PI / 180);
            for (let j = 0; j <= 20; j++) {
                const frac = j / 20;
                pts.push({ x: cx + Math.cos(angle) * r * frac, y: cy + Math.sin(angle) * r * frac });
            }
            // Brief pause between strokes (duplicate last point)
            for (let k = 0; k < 5; k++) {
                pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
            }
        }
        return pts;
    }

    private constantPressure(value: number, count: number): number[] {
        return Array(count).fill(value);
    }
}
