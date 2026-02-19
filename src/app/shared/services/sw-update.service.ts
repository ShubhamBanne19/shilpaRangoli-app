import { Injectable, ApplicationRef, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';

/**
 * SwUpdateService
 * ─────────────────────────────────────────────────────
 * Wraps Angular's SwUpdate to detect new app versions and
 * prompt the user non-intrusively. Checks every 6 hours.
 *
 * ⚠️ Anti-Pattern Alert: Never call activateUpdate() without user
 * confirmation — it kills the current SW and reloads, which can
 * destroy an in-progress drawing session.
 */
@Injectable({ providedIn: 'root' })
export class SwUpdateService {
    private swUpdate = inject(SwUpdate);
    private appRef = inject(ApplicationRef);

    /** Whether a new version is available */
    updateAvailable = false;

    init(): void {
        if (!this.swUpdate.isEnabled) return;

        // Listen for version-ready events
        this.swUpdate.versionUpdates
            .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
            .subscribe(() => {
                this.updateAvailable = true;
            });

        // Poll for updates every 6 hours after app stabilizes
        const appStable$ = this.appRef.isStable.pipe(first(s => s === true));
        const every6h$ = interval(6 * 60 * 60 * 1000);

        concat(appStable$, every6h$).subscribe(() => {
            if (this.swUpdate.isEnabled) {
                this.swUpdate.checkForUpdate().catch(() => { /* offline */ });
            }
        });
    }

    /** User confirmed update — activate and reload */
    async applyUpdate(): Promise<void> {
        if (!this.swUpdate.isEnabled) return;
        try {
            await this.swUpdate.activateUpdate();
            document.location.reload();
        } catch {
            document.location.reload();
        }
    }
}
