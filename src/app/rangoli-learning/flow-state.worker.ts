/// <reference lib="webworker" />
/**
 * flow-state.worker.ts
 * Computes STROKE_VELOCITY_CONSISTENCY — Stage 2 primary metric.
 * Also contributes to Stage 5 Flow State Index.
 *
 * Input:  { type: 'COMPUTE_VELOCITY_CV', points: {x,y,t}[] }
 * Output: { score: number }  // 0-1 (1 = perfectly smooth velocity)
 *
 * Algorithm:
 *   1. Compute instantaneous velocity between adjacent points: v[i] = dist/dt
 *   2. Filter out zero-dt samples (stuck pointer)
 *   3. CV = std_dev(velocities) / mean(velocities)
 *   4. Score = clamp(1 - CV/0.30, 0, 1)  — target CV < 0.20
 *   5. Penalize spikes: if any v[i] > 3× mean, deduct 0.05 per spike
 */

addEventListener('message', ({ data }) => {
    if (!data || data.type !== 'COMPUTE_VELOCITY_CV') {
        postMessage({ score: 0, details: { error: 'Invalid message type' } });
        return;
    }

    const points: { x: number; y: number; t: number }[] = data.points;

    if (!points || points.length < 3) {
        postMessage({ score: 1.0, details: { pointCount: points?.length ?? 0 } });
        return;
    }

    const result = computeVelocityCV(points);
    postMessage(result);
});

function dist2D(ax: number, ay: number, bx: number, by: number): number {
    return Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
}

function computeVelocityCV(points: { x: number; y: number; t: number }[]): {
    score: number;
    details: Record<string, number>;
} {
    const velocities: number[] = [];

    for (let i = 1; i < points.length; i++) {
        const dt = points[i].t - points[i - 1].t;
        if (dt <= 0) continue; // Skip stuck pointer frames
        const d = dist2D(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
        velocities.push(d / dt); // px/ms
    }

    if (velocities.length < 2) {
        return { score: 1.0, details: { velocitySamples: velocities.length } };
    }

    const n = velocities.length;
    const mean = velocities.reduce((s, v) => s + v, 0) / n;

    if (mean === 0) {
        return { score: 1.0, details: { mean: 0, cv: 0 } };
    }

    const variance = velocities.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Score CV against target of 0.20 (max forgiveness 0.30)
    const TARGET_CV = 0.30;
    let score = Math.max(0, Math.min(1, 1 - (cv / TARGET_CV)));

    // Penalize velocity spikes (> 3× mean)
    const spikeCount = velocities.filter(v => v > mean * 3).length;
    score = Math.max(0, score - spikeCount * 0.05);

    return {
        score: +score.toFixed(4),
        details: {
            n,
            mean: +mean.toFixed(4),
            stdDev: +stdDev.toFixed(4),
            cv: +cv.toFixed(4),
            spikeCount,
            targetCV: 0.20
        }
    };
}
