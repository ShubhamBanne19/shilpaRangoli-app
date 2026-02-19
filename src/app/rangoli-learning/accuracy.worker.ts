/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
    const { playerImageData, targetImageData, tolerance } = data;

    if (!playerImageData || !targetImageData) {
        postMessage(0);
        return;
    }

    // Grid-based similarity score
    const score = calculateGridSimilarity(playerImageData, targetImageData, 50, tolerance || 15);

    // Guard against NaN
    const safeScore = isNaN(score) ? 0 : score;

    postMessage(safeScore);
});

function calculateGridSimilarity(
    player: Uint8ClampedArray,
    target: Uint8ClampedArray,
    gridSize: number,
    tolerancePx: number
): number {
    const totalPixels = player.length / 4;
    if (totalPixels === 0) return 0;

    const width = Math.sqrt(totalPixels);
    const height = width;

    const stepX = Math.floor(width / gridSize);
    const stepY = Math.floor(height / gridSize);

    let totalScore = 0;
    const cells = gridSize * gridSize;
    if (cells === 0) return 0;

    const maxDist = Math.sqrt(3 * 255 * 255); // ~441.67

    for (let gy = 0; gy < gridSize; gy++) {
        for (let gx = 0; gx < gridSize; gx++) {
            // Sample center of cell
            const cx = Math.floor(gx * stepX + stepX / 2);
            const cy = Math.floor(gy * stepY + stepY / 2);

            const idx = (cy * width + cx) * 4;

            // Boundary check
            if (idx < 0 || idx >= player.length) continue;

            const tr = target[idx];
            const tg = target[idx + 1];
            const tb = target[idx + 2];

            const pr = player[idx];
            const pg = player[idx + 1];
            const pb = player[idx + 2];

            const dist = Math.sqrt(
                Math.pow(tr - pr, 2) +
                Math.pow(tg - pg, 2) +
                Math.pow(tb - pb, 2)
            );

            // Normalize to 0-1
            let cellScore = 1 - (dist / maxDist);
            if (cellScore < 0) cellScore = 0;

            totalScore += cellScore;
        }
    }

    return (totalScore / cells) * 100;
}
