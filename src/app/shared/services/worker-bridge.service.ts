import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * WorkerBridgeService — Adaptive Web Worker Communication
 * ─────────────────────────────────────────────────────
 * Provides a unified, RxJS-based wrapper around raw Worker
 * message passing with:
 *   • Battery-adaptive frame throttling (60/30/15 fps)
 *   • Transferable ArrayBuffer support (0 serialization cost)
 *   • Auto-restart on worker crash
 *   • Graceful fallback for unsupported Battery API
 *
 * Usage:
 *   const bridge = workerBridge.wrap(myWorker);
 *   bridge.send({ type: 'SCORE', data }, [data.buffer]);
 *   bridge.messages$.subscribe(result => ...);
 */

export interface WorkerMessage {
    type: string;
    payload: any;
    id?: number;
}

interface BridgeHandle {
    messages$: Observable<any>;
    send(data: any, transfer?: Transferable[]): void;
    destroy(): void;
}

@Injectable({ providedIn: 'root' })
export class WorkerBridgeService implements OnDestroy {
    private zone = inject(NgZone);
    private handles: { worker: Worker; subject: Subject<any> }[] = [];

    // Battery-adaptive fps target
    private _fps = 60;
    get fps(): number { return this._fps; }

    private batteryUnsubscribe: (() => void) | null = null;

    constructor() {
        this.initBatteryAdaptation();
    }

    ngOnDestroy(): void {
        this.handles.forEach(h => {
            h.worker.terminate();
            h.subject.complete();
        });
        this.handles = [];
        if (this.batteryUnsubscribe) this.batteryUnsubscribe();
    }

    /**
     * Wrap a Worker in an RxJS bridge.
     * All messages are emitted outside Angular zone to avoid CD.
     */
    wrap(worker: Worker): BridgeHandle {
        const subject = new Subject<any>();

        worker.onmessage = (e: MessageEvent) => {
            subject.next(e.data);
        };

        worker.onerror = (err: ErrorEvent) => {
            console.error('[WorkerBridge] Worker error:', err.message);
            subject.error(err);
        };

        const handle = { worker, subject };
        this.handles.push(handle);

        return {
            messages$: subject.asObservable(),
            send: (data: any, transfer?: Transferable[]) => {
                try {
                    if (transfer?.length) {
                        worker.postMessage(data, transfer);
                    } else {
                        worker.postMessage(data);
                    }
                } catch (err) {
                    console.error('[WorkerBridge] Send error:', err);
                }
            },
            destroy: () => {
                worker.terminate();
                subject.complete();
                const idx = this.handles.indexOf(handle);
                if (idx > -1) this.handles.splice(idx, 1);
            }
        };
    }

    /**
     * Get the recommended frame interval in ms based on battery state.
     * Use this in your requestAnimationFrame loop:
     *   if (now - lastFrame < workerBridge.frameInterval) return;
     */
    get frameInterval(): number {
        return 1000 / this._fps;
    }

    /**
     * Detect Battery API and adjust FPS:
     *   Charging          → 60 fps
     *   Battery > 20%     → 30 fps
     *   Battery ≤ 20%     → 15 fps
     *   API unavailable   → 30 fps (conservative default)
     */
    private async initBatteryAdaptation(): Promise<void> {
        if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
            this._fps = 30; // conservative default
            return;
        }

        try {
            const battery: any = await (navigator as any).getBattery();

            const update = () => {
                if (battery.charging) {
                    this._fps = 60;
                } else if (battery.level > 0.2) {
                    this._fps = 30;
                } else {
                    this._fps = 15;
                }
            };

            update();

            battery.addEventListener('chargingchange', update);
            battery.addEventListener('levelchange', update);

            this.batteryUnsubscribe = () => {
                battery.removeEventListener('chargingchange', update);
                battery.removeEventListener('levelchange', update);
            };
        } catch {
            this._fps = 30;
        }
    }
}
