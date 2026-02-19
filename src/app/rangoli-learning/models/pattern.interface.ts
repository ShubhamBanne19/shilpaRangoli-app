export interface PatternLayer {
    type: 'circle' | 'petal' | 'dot' | 'line' | 'arc' | 'polygon';
    count: number;
    radius: number; // 0-1 normalized distance from center
    size: number;   // 0-1 normalized size
    rotation: number; // degrees
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
