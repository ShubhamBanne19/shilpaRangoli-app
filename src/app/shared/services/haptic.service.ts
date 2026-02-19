import { Injectable } from '@angular/core';

/**
 * HapticService
 * ─────────────────────────────────────────────────────
 * Provides tactile feedback via the Vibration API.
 * Feature-detects `navigator.vibrate` and degrades gracefully.
 * Respects `prefers-reduced-motion` automatically.
 *
 * Usage:
 *   haptic.tap();      // 10ms micro-vibration
 *   haptic.success();  // celebratory pattern
 *   haptic.error();    // double-buzz warning
 */
@Injectable({ providedIn: 'root' })
export class HapticService {
    private readonly supported: boolean;
    private reducedMotion = false;

    constructor() {
        this.supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
        if (typeof window !== 'undefined') {
            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.matchMedia('(prefers-reduced-motion: reduce)')
                .addEventListener('change', (e) => this.reducedMotion = e.matches);
        }
    }

    /** Micro-vibration: 10ms — for button taps, mode selections */
    tap(): void {
        this.vibrate(10);
    }

    /** Pattern completion celebration: buzz-pause-buzz-pause-long-buzz */
    success(): void {
        this.vibrate([30, 50, 30, 50, 80]);
    }

    /** Error/warning: double short buzz */
    error(): void {
        this.vibrate([40, 30, 40]);
    }

    /** Undo action: single medium buzz */
    undo(): void {
        this.vibrate(25);
    }

    /** Stage advancement: rising pattern */
    stageUp(): void {
        this.vibrate([20, 30, 30, 30, 50, 30, 80]);
    }

    private vibrate(pattern: number | number[]): void {
        if (!this.supported || this.reducedMotion) return;
        try {
            navigator.vibrate(pattern);
        } catch {
            // Silently fail — some browsers restrict vibrate in background
        }
    }
}
