import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScoringEngineService {
    private worker: Worker | null = null;

    constructor() {
        if (typeof Worker !== 'undefined') {
            // Initialize Web Worker
            this.worker = new Worker(new URL('../accuracy.worker', import.meta.url));
        } else {
            console.warn('Web Workers are not supported in this environment.');
        }
    }

    calculateScore(
        playerCanvas: HTMLCanvasElement,
        targetCanvas: HTMLCanvasElement
    ): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                resolve(0); // Fallback
                return;
            }

            const pCtx = playerCanvas.getContext('2d');
            const tCtx = targetCanvas.getContext('2d');

            if (!pCtx || !tCtx) {
                resolve(0);
                return;
            }

            // Get image data
            // For performance, we might resize/downsample before sending?
            // Worker expects raw data.
            const pData = pCtx.getImageData(0, 0, playerCanvas.width, playerCanvas.height).data;
            const tData = tCtx.getImageData(0, 0, targetCanvas.width, targetCanvas.height).data;

            this.worker.onmessage = ({ data }) => {
                resolve(data);
            };

            this.worker.onerror = (err) => {
                console.error('Worker error:', err);
                reject(err);
            };

            this.worker.postMessage({
                playerImageData: pData,
                targetImageData: tData,
                tolerance: 15
            });
        });
    }

    terminate() {
        this.worker?.terminate();
    }
}
