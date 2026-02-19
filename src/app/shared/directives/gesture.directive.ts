import {
    Directive, ElementRef, EventEmitter, NgZone,
    OnDestroy, OnInit, Output, inject
} from '@angular/core';
import { DrawingStateService } from '../services/drawing-state.service';

/**
 * GestureDirective — Touch Gesture System
 * ─────────────────────────────────────────────────────
 * Detects:
 *   • Long-Press (500ms threshold) → `longPress` event
 *   • Pinch-to-Zoom (dual-touch distance delta) → `pinchZoom` with scale factor
 *
 * Design decisions:
 *   1. All touch listeners run OUTSIDE Angular zone (NgZone.runOutsideAngular)
 *      to avoid 60× CD cycles/sec during drawing.
 *   2. Only `longPress` and `pinchZoom` emit re-enter the zone.
 *   3. `touchstart` and `touchmove` use `{ passive: false }` to allow
 *      preventDefault() during active drawing (blocks scroll).
 *   4. Handles `touchcancel` for phone calls / notification interrupts.
 *
 * Usage:
 *   <div appGesture (longPress)="onLongPress()" (pinchZoom)="onZoom($event)">
 */
@Directive({
    selector: '[appGesture]',
    standalone: true
})
export class GestureDirective implements OnInit, OnDestroy {
    @Output() longPress = new EventEmitter<void>();
    @Output() pinchZoom = new EventEmitter<number>(); // scale factor

    private el = inject(ElementRef);
    private zone = inject(NgZone);
    private drawingState = inject(DrawingStateService);

    // Long-press tracking
    private longPressTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly LONG_PRESS_MS = 500;
    private longPressFired = false;

    // Pinch tracking
    private initialPinchDist = 0;
    private lastScale = 1;

    // Cleanup
    private abortController = new AbortController();

    ngOnInit(): void {
        this.zone.runOutsideAngular(() => this.bindListeners());
    }

    ngOnDestroy(): void {
        this.abortController.abort();
        this.clearLongPressTimer();
    }

    private bindListeners(): void {
        const el = this.el.nativeElement as HTMLElement;
        const signal = this.abortController.signal;
        const opts: AddEventListenerOptions = { passive: false, signal };

        el.addEventListener('touchstart', (e) => this.onTouchStart(e), opts);
        el.addEventListener('touchmove', (e) => this.onTouchMove(e), opts);
        el.addEventListener('touchend', (e) => this.onTouchEnd(e), { signal });
        el.addEventListener('touchcancel', (e) => this.onTouchCancel(e), { signal });
    }

    // ── Touch Start ───────────────────────────────────────────────
    private onTouchStart(e: TouchEvent): void {
        if (e.touches.length === 1) {
            // Start long-press timer
            this.longPressFired = false;
            this.longPressTimer = setTimeout(() => {
                this.longPressFired = true;
                this.zone.run(() => this.longPress.emit());
            }, this.LONG_PRESS_MS);
        }

        if (e.touches.length === 2) {
            // Start pinch tracking
            this.clearLongPressTimer();
            this.initialPinchDist = this.getTouchDistance(e.touches[0], e.touches[1]);
            this.lastScale = 1;
            e.preventDefault(); // Block scroll during pinch
        }

        // Block scroll only if we're actively drawing on a canvas
        if (this.drawingState.isDrawing()) {
            e.preventDefault();
        }
    }

    // ── Touch Move ────────────────────────────────────────────────
    private onTouchMove(e: TouchEvent): void {
        // Any movement cancels long-press
        if (e.touches.length === 1 && this.longPressTimer) {
            const threshold = 10; // px dead zone
            // We don't track initial position in this simplified version —
            // cancel on any move to avoid incorrect long-press during drawing
            this.clearLongPressTimer();
        }

        if (e.touches.length === 2 && this.initialPinchDist > 0) {
            const currentDist = this.getTouchDistance(e.touches[0], e.touches[1]);
            const scale = currentDist / this.initialPinchDist;

            // Only emit if scale changed significantly (1% threshold)
            if (Math.abs(scale - this.lastScale) > 0.01) {
                this.lastScale = scale;
                this.zone.run(() => this.pinchZoom.emit(scale));
            }
            e.preventDefault();
        }

        // Block scroll during drawing
        if (this.drawingState.isDrawing()) {
            e.preventDefault();
        }
    }

    // ── Touch End / Cancel ────────────────────────────────────────
    private onTouchEnd(_e: TouchEvent): void {
        this.clearLongPressTimer();
        this.initialPinchDist = 0;
    }

    private onTouchCancel(_e: TouchEvent): void {
        // Phone call or notification interrupted gesture
        this.clearLongPressTimer();
        this.initialPinchDist = 0;
        this.drawingState.stopDrawing();
    }

    // ── Helpers ───────────────────────────────────────────────────
    private getTouchDistance(a: Touch, b: Touch): number {
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    private clearLongPressTimer(): void {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
}
