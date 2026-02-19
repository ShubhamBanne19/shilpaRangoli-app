/// <reference lib="webworker" />
/**
 * biomechanics.worker.ts
 * Computes GRIP_PRESSURE_VARIANCE — Stage 1 primary metric.
 *
 * Input:  { type: 'COMPUTE_PRESSURE', pressureSamples: number[] }
 * Output: { score: number }  // 0-1 (1 = perfect consistency)
 *
 * Algorithm:
 *   1. Calculate mean and σ (std dev) of pressure samples
 *   2. Score = clamp(1 - σ/0.15, 0, 1)
 *   3. If device doesn't report real pressure, caller passes
 *      velocity-derived values (lower velocity ≈ higher control)
 */

addEventListener('message', ({ data }) => {
    if (!data || data.type !== 'COMPUTE_PRESSURE') {
        postMessage({ score: 0, details: { error: 'Invalid message type' } });
        return;
    }

    const samples: number[] = data.pressureSamples;

    if (!samples || samples.length < 2) {
        postMessage({ score: 1.0, details: { sampleCount: samples?.length ?? 0 } });
        return;
    }

    const result = computePressureVariance(samples);
    postMessage(result);
});

function computePressureVariance(samples: number[]): { score: number; details: Record<string, number> } {
    const n = samples.length;

    // Mean
    const mean = samples.reduce((sum, v) => sum + v, 0) / n;

    // Standard deviation
    const variance = samples.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const sigma = Math.sqrt(variance);

    // Score: σ < 0.15 = excellent; σ >= 0.15 = poor
    const TARGET_SIGMA = 0.15;
    const score = Math.max(0, Math.min(1, 1 - (sigma / TARGET_SIGMA)));

    return {
        score,
        details: {
            n,
            mean: +mean.toFixed(4),
            sigma: +sigma.toFixed(4),
            target: TARGET_SIGMA
        }
    };
}
