import { Injectable, signal } from '@angular/core';

/**
 * DrawingStateService
 * ─────────────────────────────────────────────────────
 * Tracks whether the user is actively drawing on a canvas.
 * The GestureDirective uses this to conditionally preventDefault()
 * on touch events — scroll is blocked ONLY during active drawing.
 *
 * ⚠️ Anti-Pattern Alert: Do NOT use BehaviorSubject here.
 * Signal is synchronous (no async overhead) which is critical
 * when checked 60× per second inside NgZone.runOutsideAngular.
 */
@Injectable({ providedIn: 'root' })
export class DrawingStateService {
    /** True while the user is actively touching/drawing on a canvas */
    readonly isDrawing = signal<boolean>(false);

    /** True when any canvas is in the viewport and eligible for drawing */
    readonly canvasActive = signal<boolean>(false);

    startDrawing(): void {
        this.isDrawing.set(true);
    }

    stopDrawing(): void {
        this.isDrawing.set(false);
    }

    activateCanvas(): void {
        this.canvasActive.set(true);
    }

    deactivateCanvas(): void {
        this.canvasActive.set(false);
        this.isDrawing.set(false);
    }
}
