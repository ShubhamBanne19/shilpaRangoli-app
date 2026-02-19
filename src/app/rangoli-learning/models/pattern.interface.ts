export interface PatternLayer {
    type: 'circle' | 'petal' | 'dot' | 'line' | 'arc' | 'polygon';
    count: number;
    radius: number;
    size: number;
    rotation: number;
    color: string;
    strokeWeight: number;
    filled?: boolean;
}

export interface IPatternGenerator {
    id: number;
    name: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    symmetryAxes: number;
    layers: PatternLayer[];
    culturalNote: string;
    requiredStrokeOrder?: number[]; // Stage 4: ordered stroke IDs
    generate(p: any, centerX: number, centerY: number, size: number): void;
}

export interface PlayerProgress {
    playerId: string;
    patternsCompleted: {
        [patternId: number]: {
            completed: boolean;
            bestAccuracy: number;
            stars: number;
            attempts: number;
            totalTimeSeconds: number;
            completedAt: string;
        }
    };
    totalXP: number;
    badges: string[];
    settings: {
        audioEnabled: boolean;
        showGuideGrid: boolean;
        targetOpacity: number;
    };
}

export enum Difficulty {
    Beginner = 1,
    Easy = 2,
    Intermediate = 3,
    Hard = 4,
    Expert = 5
}

// =======================================================================
// GURU PROTOCOL — NEW TYPES
// =======================================================================

export enum GuruStage {
    Foundation = 1,  // Pinch Grip Mastery
    Control = 2,  // Controlled Release Dynamics
    Symmetry = 3,  // Radial Precision
    Composition = 4,  // Stroke Order Mastery
    Mastery = 5   // Flow State Achievement
}

export interface SkillMetrics {
    pressureConsistency: number;    // 0-1 (1 = best, low σ)
    velocityConsistency: number;    // 0-1 (1 = best, low CV)
    angularPrecision: number;       // 0-1 (1 = perfect spacing)
    strokeOrderCompliance: number;  // 0-1 (1 = 100% correct sequence)
    flowStateIndex: number;         // 0-1 (composite flow)
}

export interface StrokePoint {
    timestamp: number;
    x: number;
    y: number;
    pressure: number;   // 0-1 (from PointerEvent or velocity-simulated)
    velocity: number;   // px/ms
    angle: number;      // degrees from canvas center
}

export interface StrokeData {
    strokeId: number;
    points: StrokePoint[];
    startTime: number;
    endTime: number;
    centerOrigin: boolean; // true if stroke starts near canvas center
}

export interface SessionData {
    sessionId: string;
    patternId: number;
    stage: number;
    startTime: number;
    endTime: number;
    metrics: SkillMetrics;
    strokes: StrokeData[];
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockedAt: number;
    icon: string;
}

export interface StageCompletion {
    stage: number;
    isUnlocked: boolean;
    isCompleted: boolean;
    attemptCount: number;
    bestMetrics: SkillMetrics;
    completedAt?: number;
}

export interface MasteryProgress {
    playerId: string;
    currentStage: number;
    stageCompletions: StageCompletion[];
    guruScore: number;           // 0-100 composite mastery
    totalPracticeTime: number;   // ms
    achievements: Achievement[];
    lastSession: number;         // timestamp
}

// Worker message types
export interface BiomechanicsRequest {
    type: 'COMPUTE_PRESSURE';
    pressureSamples: number[];  // 0-1 values
}

export interface FlowStateRequest {
    type: 'COMPUTE_VELOCITY_CV';
    points: { x: number; y: number; t: number }[];
}

export interface StrokeOrderRequest {
    type: 'COMPUTE_ANGULAR_ERROR' | 'COMPUTE_LCS_COMPLIANCE';
    strokeAngles?: number[];           // For angular check
    requiredOrder?: number[];          // For LCS check
    userOrder?: number[];              // For LCS check
    symmetryAxes?: number;
}

export interface WorkerResult {
    score: number; // 0-1 normalized
    details?: Record<string, number>;
}
