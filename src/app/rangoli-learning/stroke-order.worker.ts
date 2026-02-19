/// <reference lib="webworker" />
/**
 * stroke-order.worker.ts
 * Dual-purpose worker:
 *
 * 1. COMPUTE_ANGULAR_ERROR (Stage 3)
 *    Detects angular spacing between radial strokes and compares to
 *    ideal equidistant division for N-fold symmetry.
 *    Score = 1 - (meanError / 15°)   capped at 0-1
 *
 * 2. COMPUTE_LCS_COMPLIANCE (Stage 4)
 *    Uses Longest Common Subsequence algorithm to compute how closely
 *    the user's stroke sequence matches the required order.
 *    Score = LCS_length / required_length
 */

addEventListener('message', ({ data }) => {
    if (!data) {
        postMessage({ score: 0, details: { error: 'No data' } });
        return;
    }

    if (data.type === 'COMPUTE_ANGULAR_ERROR') {
        postMessage(computeAngularError(data.strokeAngles, data.symmetryAxes));
    } else if (data.type === 'COMPUTE_LCS_COMPLIANCE') {
        postMessage(computeLCSCompliance(data.requiredOrder, data.userOrder));
    } else {
        postMessage({ score: 0, details: { error: 'Unknown type: ' + data.type } });
    }
});

// ========== ANGULAR ERROR (Stage 3) ==========
function computeAngularError(
    strokeAngles: number[],
    symmetryAxes: number
): { score: number; details: Record<string, number> } {
    if (!strokeAngles || strokeAngles.length === 0) {
        return { score: 1.0, details: { strokeCount: 0 } };
    }

    // Ideal angles for the given symmetry
    const idealAngles: number[] = [];
    for (let i = 0; i < symmetryAxes; i++) {
        idealAngles.push((360 / symmetryAxes) * i);
    }

    // For each actual stroke angle, find closest ideal and compute error
    const errors: number[] = strokeAngles.map(actual => {
        const normalised = ((actual % 360) + 360) % 360;
        const minError = idealAngles.reduce((minE, ideal) => {
            let diff = Math.abs(normalised - ideal);
            if (diff > 180) diff = 360 - diff; // Wrap-around
            return Math.min(minE, diff);
        }, Infinity);
        return minError;
    });

    const meanError = errors.reduce((s, e) => s + e, 0) / errors.length;

    // Max forgiveness = 15° (score = 0 at 15° or more average error)
    const MAX_ERROR_DEG = 15;
    const score = Math.max(0, Math.min(1, 1 - (meanError / MAX_ERROR_DEG)));

    return {
        score: +score.toFixed(4),
        details: {
            strokeCount: strokeAngles.length,
            meanErrorDeg: +meanError.toFixed(2),
            maxErrorDeg: +Math.max(...errors).toFixed(2),
            symmetryAxes,
            targetErrorDeg: 3.0
        }
    };
}

// ========== LCS COMPLIANCE (Stage 4) ==========
function computeLCSCompliance(
    required: number[],
    user: number[]
): { score: number; details: Record<string, number> } {
    if (!required || required.length === 0) {
        return { score: 1.0, details: { lcsLength: 0, requiredLength: 0 } };
    }
    if (!user || user.length === 0) {
        return { score: 0, details: { lcsLength: 0, requiredLength: required.length } };
    }

    const lcsLen = lcs(required, user);
    const score = lcsLen / required.length;

    // Penalty for backtracking (later required element drawn before earlier one)
    const backtracks = countBacktracks(required, user);

    return {
        score: Math.max(0, +score.toFixed(4)),
        details: {
            lcsLength: lcsLen,
            requiredLength: required.length,
            userLength: user.length,
            backtracks,
            compliance: +(score * 100).toFixed(1)
        }
    };
}

// Standard LCS dynamic programming
function lcs(a: number[], b: number[]): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}

// Count how many times user drew a stroke with a LOWER required index
// after a stroke with a HIGHER required index (backtracking)
function countBacktracks(required: number[], user: number[]): number {
    // Map each stroke ID to its required position
    const posMap = new Map<number, number>();
    required.forEach((id, pos) => posMap.set(id, pos));

    let backtracks = 0;
    let maxSeenPos = -1;

    for (const strokeId of user) {
        const pos = posMap.get(strokeId);
        if (pos !== undefined) {
            if (pos < maxSeenPos) backtracks++;
            maxSeenPos = Math.max(maxSeenPos, pos);
        }
    }

    return backtracks;
}
