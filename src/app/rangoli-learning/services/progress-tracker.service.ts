import { Injectable } from '@angular/core';
import { PlayerProgress } from '../models/pattern.interface';

@Injectable({
    providedIn: 'root'
})
export class ProgressTrackerService {
    private readonly STORAGE_KEY = 'rangoli-learning-progress-v1';
    private progress: PlayerProgress;

    constructor() {
        this.progress = this.loadProgress();
    }

    private loadProgress(): PlayerProgress {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Default / New Player
        return {
            playerId: crypto.randomUUID(),
            patternsCompleted: {}, // Map of ID -> Stats
            totalXP: 0,
            badges: [],
            settings: {
                audioEnabled: true,
                showGuideGrid: true,
                targetOpacity: 50
            }
        };
    }

    saveProgress(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
    }

    getPatternStatus(id: number) {
        return this.progress.patternsCompleted[id];
    }

    isPatternUnlocked(id: number): boolean {
        if (id === 1) return true;
        // Unlock if previous pattern is completed
        const prev = this.progress.patternsCompleted[id - 1];
        return !!(prev && prev.completed);
    }

    completePattern(id: number, accuracy: number, timeSeconds: number): void {
        const existing = this.progress.patternsCompleted[id] || {
            completed: false,
            bestAccuracy: 0,
            stars: 0,
            attempts: 0,
            totalTimeSeconds: 0,
            completedAt: ''
        };

        existing.completed = true;
        existing.attempts++;
        existing.totalTimeSeconds += timeSeconds;
        existing.completedAt = new Date().toISOString();

        if (accuracy > existing.bestAccuracy) {
            existing.bestAccuracy = accuracy;
            // Calculate Stars
            if (accuracy >= 95) existing.stars = 5;
            else if (accuracy >= 85) existing.stars = 4;
            else if (accuracy >= 75) existing.stars = 3;
            else if (accuracy >= 60) existing.stars = 2;
            else existing.stars = 1;
        }

        // Award XP (First time bonus?)
        // Simple flat XP for now
        this.progress.totalXP += 10 + existing.stars * 5;

        this.progress.patternsCompleted[id] = existing;
        this.saveProgress();
    }

    getProgress(): PlayerProgress {
        return this.progress;
    }
}
