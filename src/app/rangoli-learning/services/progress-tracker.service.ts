import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    SkillMetrics, MasteryProgress, StageCompletion,
    Achievement, SessionData, StrokeData, GuruStage,
    PlayerProgress
} from '../models/pattern.interface';

// ========== MINIMAL DEXIE-LIKE IndexedDB WRAPPER ==========
// Using native IndexedDB with a clean async API to avoid adding npm deps
// (Dexie.js would be added in a real production install)

class ShilpaDB {
    private dbPromise: Promise<IDBDatabase>;
    private readonly DB_NAME = 'ShilpaRangoliDB';
    private readonly DB_VERSION = 2;

    constructor() {
        this.dbPromise = this.openDB();
    }

    private openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('progress')) {
                    db.createObjectStore('progress', { keyPath: 'playerId' });
                }
                if (!db.objectStoreNames.contains('sessions')) {
                    const ss = db.createObjectStore('sessions', { keyPath: 'sessionId' });
                    ss.createIndex('stage', 'stage', { unique: false });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async get<T>(store: string, key: string): Promise<T | undefined> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readonly');
            const req = tx.objectStore(store).get(key);
            req.onsuccess = () => resolve(req.result as T);
            req.onerror = () => reject(req.error);
        });
    }

    async put<T>(store: string, value: T): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).put(value);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async clear(store: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async delete(store: string, key: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}

// =======================================================================

@Injectable({ providedIn: 'root' })
export class ProgressTrackerService {
    private readonly STORAGE_KEY = 'rangoli-learning-progress-v1';
    private readonly GURU_KEY = 'shilparangoli-guru-progress';
    private readonly PLAYER_KEY = 'shilparangoli-player-id';
    private db = new ShilpaDB();
    private playerId = this.getOrCreatePlayerId();

    // ── Angular Signals (synchronous state) ──
    currentStage = signal<number>(1);
    guruScore = signal<number>(0);

    // ── RxJS async stream ──
    private progressSubject = new BehaviorSubject<MasteryProgress | null>(null);
    public progress$: Observable<MasteryProgress | null> = this.progressSubject.asObservable();

    constructor() {
        this.loadProgress();
    }

    // ──────────────────────────────────────────────────────────────
    // LEGACY API (backward-compat for pattern gallery)
    // ──────────────────────────────────────────────────────────────

    private legacyProgress: PlayerProgress = this.loadLegacyProgress();

    private loadLegacyProgress(): PlayerProgress {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) { try { return JSON.parse(stored); } catch { /* ignore */ } }
        return {
            playerId: this.playerId,
            patternsCompleted: {},
            totalXP: 0,
            badges: [],
            settings: { audioEnabled: true, showGuideGrid: true, targetOpacity: 50 }
        };
    }

    private saveLegacyProgress(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.legacyProgress));
    }

    isPatternUnlocked(id: number): boolean {
        if (id === 1) return true;
        const prev = this.legacyProgress.patternsCompleted[id - 1];
        return !!(prev && prev.completed);
    }

    completePattern(id: number, accuracy: number, timeSeconds: number): void {
        const existing = this.legacyProgress.patternsCompleted[id] || {
            completed: false, bestAccuracy: 0, stars: 0,
            attempts: 0, totalTimeSeconds: 0, completedAt: ''
        };
        existing.completed = true;
        existing.attempts++;
        existing.totalTimeSeconds += timeSeconds;
        existing.completedAt = new Date().toISOString();
        if (accuracy > existing.bestAccuracy) {
            existing.bestAccuracy = accuracy;
            if (accuracy >= 95) existing.stars = 5;
            else if (accuracy >= 85) existing.stars = 4;
            else if (accuracy >= 75) existing.stars = 3;
            else if (accuracy >= 60) existing.stars = 2;
            else existing.stars = 1;
        }
        this.legacyProgress.totalXP += 10 + existing.stars * 5;
        this.legacyProgress.patternsCompleted[id] = existing;
        this.saveLegacyProgress();
    }

    getPatternStatus(id: number) {
        return this.legacyProgress.patternsCompleted[id];
    }

    getProgress(): PlayerProgress { return this.legacyProgress; }

    // ──────────────────────────────────────────────────────────────
    // GURU PROTOCOL API
    // ──────────────────────────────────────────────────────────────

    private getOrCreatePlayerId(): string {
        let id = localStorage.getItem(this.PLAYER_KEY);
        if (!id) {
            id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem(this.PLAYER_KEY, id);
        }
        return id;
    }

    private async loadProgress(): Promise<void> {
        try {
            let progress = await this.db.get<MasteryProgress>('progress', this.playerId);
            if (!progress) {
                progress = this.createFreshProgress();
                await this.db.put('progress', progress);
            }
            this.applyProgress(progress);
        } catch (err) {
            console.warn('[ProgressTracker] IndexedDB unavailable, falling back to localStorage', err);
            this.loadFromLocalStorage();
        }
    }

    private createFreshProgress(): MasteryProgress {
        return {
            playerId: this.playerId,
            currentStage: 1,
            stageCompletions: Array.from({ length: 5 }, (_, i) => ({
                stage: i + 1,
                isUnlocked: i === 0,
                isCompleted: false,
                attemptCount: 0,
                bestMetrics: {
                    pressureConsistency: 0,
                    velocityConsistency: 0,
                    angularPrecision: 0,
                    strokeOrderCompliance: 0,
                    flowStateIndex: 0
                }
            })),
            guruScore: 0,
            totalPracticeTime: 0,
            achievements: [],
            lastSession: Date.now()
        };
    }

    private applyProgress(p: MasteryProgress): void {
        this.currentStage.set(p.currentStage);
        this.guruScore.set(p.guruScore);
        this.progressSubject.next(p);
    }

    // ── Session Lifecycle ──────────────────────────────────────────

    async startSession(patternId: number, stage: number): Promise<string> {
        const sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const session: SessionData = {
            sessionId, patternId, stage,
            startTime: Date.now(), endTime: 0,
            metrics: { pressureConsistency: 0, velocityConsistency: 0, angularPrecision: 0, strokeOrderCompliance: 0, flowStateIndex: 0 },
            strokes: []
        };
        try { await this.db.put('sessions', session); } catch { /* offline ok */ }
        return sessionId;
    }

    async completeSession(
        sessionId: string,
        stage: number,
        patternId: number,
        metrics: SkillMetrics,
        durationMs: number
    ): Promise<{ passed: boolean; guruScore: number; feedback: string[]; newAchievements: Achievement[] }> {

        // Persist session
        const session: SessionData = {
            sessionId, patternId, stage,
            startTime: Date.now() - durationMs,
            endTime: Date.now(),
            metrics, strokes: []
        };
        try { await this.db.put('sessions', session); } catch { /* offline ok */ }

        // Load & mutate progress
        let progress: MasteryProgress;
        try {
            progress = (await this.db.get<MasteryProgress>('progress', this.playerId)) ?? this.createFreshProgress();
        } catch {
            progress = this.loadLocalProgress() ?? this.createFreshProgress();
        }

        const threshold = this.getThreshold(stage);
        const composite = this.compositeScore(metrics, stage);
        const passed = composite >= threshold;

        const completion = progress.stageCompletions[stage - 1];
        completion.attemptCount++;

        if (passed && !completion.isCompleted) {
            completion.isCompleted = true;
            completion.completedAt = Date.now();
            if (stage < 5) {
                progress.stageCompletions[stage].isUnlocked = true;
                progress.currentStage = stage + 1;
                this.currentStage.set(stage + 1);
            }
        }

        if (this.isBetter(metrics, completion.bestMetrics)) {
            completion.bestMetrics = metrics;
        }

        const newAchievements = this.checkAchievements(progress, metrics);
        progress.guruScore = this.calcGuruScore(progress);
        this.guruScore.set(progress.guruScore);
        progress.totalPracticeTime += durationMs;
        progress.lastSession = Date.now();

        try { await this.db.put('progress', progress); } catch (e) { this.saveLocalProgress(progress); }
        this.progressSubject.next(progress);

        const feedback = this.buildFeedback(metrics, stage, passed);
        return { passed, guruScore: progress.guruScore, feedback, newAchievements };
    }

    // ── Scoring Algorithms ─────────────────────────────────────────

    private getThreshold(stage: number): number {
        return [0, 0.70, 0.75, 0.80, 0.85, 0.90][stage] ?? 0.80;
    }

    compositeScore(metrics: SkillMetrics, stage: number): number {
        const w = this.stageWeights(stage);
        const score = (
            metrics.pressureConsistency * w['pressure'] +
            metrics.velocityConsistency * w['velocity'] +
            metrics.angularPrecision * w['angular'] +
            metrics.strokeOrderCompliance * w['strokeOrder'] +
            metrics.flowStateIndex * w['flowState']
        );
        return score;
    }

    private stageWeights(stage: number): Record<string, number> {
        const map: Record<number, Record<string, number>> = {
            1: { pressure: 0.40, velocity: 0.20, angular: 0.20, strokeOrder: 0.10, flowState: 0.10 },
            2: { pressure: 0.25, velocity: 0.35, angular: 0.20, strokeOrder: 0.10, flowState: 0.10 },
            3: { pressure: 0.20, velocity: 0.20, angular: 0.40, strokeOrder: 0.10, flowState: 0.10 },
            4: { pressure: 0.15, velocity: 0.15, angular: 0.20, strokeOrder: 0.35, flowState: 0.15 },
            5: { pressure: 0.15, velocity: 0.15, angular: 0.20, strokeOrder: 0.20, flowState: 0.30 }
        };
        return map[stage] ?? map[1];
    }

    private calcGuruScore(p: MasteryProgress): number {
        const completed = p.stageCompletions.filter(s => s.isCompleted);
        if (completed.length === 0) return 0;
        const avg = completed.reduce((sum, s) => sum + this.compositeScore(s.bestMetrics, s.stage), 0) / completed.length;
        const completionBonus = completed.length === 5 ? 0.10 : 0;
        const hours = p.totalPracticeTime / 3_600_000;
        const timeBonus = Math.min(0.10, Math.log10(hours + 1) * 0.05);
        return Math.min(100, Math.round((avg + completionBonus + timeBonus) * 100));
    }

    private isBetter(a: SkillMetrics, b: SkillMetrics): boolean {
        const sum = (m: SkillMetrics) =>
            m.pressureConsistency + m.velocityConsistency +
            m.angularPrecision + m.strokeOrderCompliance + m.flowStateIndex;
        return sum(a) > sum(b);
    }

    // ── Achievements ───────────────────────────────────────────────

    private checkAchievements(p: MasteryProgress, metrics: SkillMetrics): Achievement[] {
        const earned: Achievement[] = [];
        const has = (id: string) => p.achievements.some(a => a.id === id);
        const add = (a: Achievement) => { earned.push(a); p.achievements.push(a); };

        if (p.stageCompletions[0].isCompleted && !has('first_blood')) {
            add({ id: 'first_blood', name: 'First Steps', description: 'Completed the Foundation stage!', unlockedAt: Date.now(), icon: '🌱' });
        }
        if (Object.values(metrics).some(v => v > 0.95) && !has('perfect_precision')) {
            add({ id: 'perfect_precision', name: 'Perfect Precision', description: 'Achieved 95%+ in a skill metric', unlockedAt: Date.now(), icon: '🎯' });
        }
        if (metrics.flowStateIndex > 0.90 && !has('flow_master')) {
            add({ id: 'flow_master', name: 'Flow Master', description: 'Entered a true flow state', unlockedAt: Date.now(), icon: '🌊' });
        }
        if (p.totalPracticeTime >= 3_600_000 && !has('marathon')) {
            add({ id: 'marathon', name: 'Marathon', description: 'Over 1 hour of practice!', unlockedAt: Date.now(), icon: '⏱️' });
        }
        if (p.stageCompletions.every(s => s.isCompleted) && !has('guru')) {
            add({ id: 'guru', name: 'Guru', description: 'Mastered all 5 stages. You are ready to teach.', unlockedAt: Date.now(), icon: '🏆' });
        }
        return earned;
    }

    // ── Feedback ───────────────────────────────────────────────────

    private buildFeedback(metrics: SkillMetrics, stage: number, passed: boolean): string[] {
        const feedback: string[] = [];
        const w = this.stageWeights(stage);
        const weighted: Record<string, number> = {
            pressure: metrics.pressureConsistency * w['pressure'],
            velocity: metrics.velocityConsistency * w['velocity'],
            angular: metrics.angularPrecision * w['angular'],
            strokeOrder: metrics.strokeOrderCompliance * w['strokeOrder'],
            flowState: metrics.flowStateIndex * w['flowState']
        };
        const weakest = Object.entries(weighted).sort((a, b) => a[1] - b[1])[0][0];

        const msg: Record<number, Record<string, string>> = {
            1: { pressure: 'Grip pressure varies too much. Try the "grain of rice" hold.', velocity: 'Focus on steady hand movement—draw as if underwater.' },
            2: { velocity: 'Work on constant speed. Use a metronome at 60 BPM.', flowState: 'Too tense. Try the 4-2-6 breathing exercise first.' },
            3: { angular: 'Angles are off. Use the clock-face visualization: 12, 3, 6, 9.' },
            4: { strokeOrder: 'Stroke sequence matters! Review the inside-out principle.' },
            5: { flowState: 'Not in flow yet. Eliminate distractions and do 30-min uninterrupted practice.' }
        };
        const stageMsg = msg[stage];
        const weakMsg = stageMsg ? stageMsg[weakest] : undefined;
        if (weakMsg) feedback.push(weakMsg);
        feedback.unshift(passed
            ? '✨ Stage passed! Excellent technique — ready for the next challenge.'
            : '💡 Not quite there yet. Keep at it:');
        return feedback;
    }

    // ── LocalStorage Fallback ──────────────────────────────────────

    private loadFromLocalStorage(): void {
        const p = this.loadLocalProgress();
        if (p) this.applyProgress(p);
        else this.applyProgress(this.createFreshProgress());
    }

    private loadLocalProgress(): MasteryProgress | null {
        try {
            const raw = localStorage.getItem(this.GURU_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    private saveLocalProgress(p: MasteryProgress): void {
        try { localStorage.setItem(this.GURU_KEY, JSON.stringify(p)); } catch { /* storage full */ }
    }

    // ── Public Accessors ───────────────────────────────────────────

    getMasteryProgress(): Observable<MasteryProgress | null> { return this.progress$; }

    isStageUnlocked(stage: number): boolean {
        const p = this.progressSubject.getValue();
        if (!p) return stage === 1;
        return p.stageCompletions[stage - 1]?.isUnlocked ?? false;
    }

    async resetGuruProgress(): Promise<void> {
        try {
            await this.db.delete('progress', this.playerId);
            await this.db.clear('sessions');
        } catch { /* offline ok */ }
        localStorage.removeItem(this.GURU_KEY);
        const fresh = this.createFreshProgress();
        this.applyProgress(fresh);
    }
}
