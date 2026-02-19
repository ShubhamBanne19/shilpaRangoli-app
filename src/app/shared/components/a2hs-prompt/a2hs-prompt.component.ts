import {
    Component, OnInit, OnDestroy, signal, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A2hsPromptComponent — "Add to Home Screen" Bottom-Sheet
 * ─────────────────────────────────────────────────────
 * Mimics an app store install card. Handles:
 *   • Chrome/Android `beforeinstallprompt` interception
 *   • iOS Safari detection with custom instructional tooltip
 *   • 7-day dismiss cooldown via localStorage
 *   • `appinstalled` success tracking
 */
@Component({
    selector: 'app-a2hs-prompt',
    standalone: true,
    imports: [CommonModule],
    template: `
    <!-- Android/Chrome install prompt -->
    <div class="a2hs-backdrop" *ngIf="showPrompt()" (click)="dismiss()">
      <div class="a2hs-sheet" (click)="$event.stopPropagation()" role="dialog" aria-label="Install ShilpaRangoli">

        <div class="sheet-header">
          <div class="app-icon">🪷</div>
          <div class="app-info">
            <h3>ShilpaRangoli</h3>
            <div class="app-meta">
              <span class="rating">★ 4.8</span>
              <span class="badge">Free</span>
            </div>
            <p class="app-desc">Master traditional Rangoli art with guided lessons</p>
          </div>
        </div>

        <ul class="perms">
          <li>✓ Works offline</li>
          <li>✓ No app store needed</li>
          <li>✓ Auto-updates</li>
        </ul>

        <div class="sheet-actions">
          <button class="btn-install" (click)="install()">Install App</button>
          <button class="btn-dismiss" (click)="dismiss()">Not Now</button>
        </div>
      </div>
    </div>

    <!-- iOS Safari instruction tooltip -->
    <div class="ios-tooltip" *ngIf="showIosHint()" (click)="dismissIos()">
      <div class="ios-card">
        <p>To install, tap <span class="share-icon">⬆</span> then <strong>"Add to Home Screen"</strong></p>
        <div class="ios-arrow"></div>
      </div>
    </div>
    `,
    styles: [`
    .a2hs-backdrop {
      position: fixed;
      inset: 0;
      background: hsla(240, 20%, 5%, 0.65);
      z-index: 300;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 200ms ease;
    }
    .a2hs-sheet {
      width: min(420px, 100vw);
      background: hsl(240, 10%, 13%);
      border-radius: 24px 24px 0 0;
      padding: 2rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
      animation: slideUp 300ms cubic-bezier(0, 0, 0.2, 1);
    }
    .sheet-header {
      display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1rem;
    }
    .app-icon {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, hsl(340,95%,65%), hsl(45,100%,55%));
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem;
    }
    .app-info h3 {
      margin: 0; font-size: 1.1rem; color: white; font-weight: 700;
    }
    .app-meta {
      display: flex; gap: 0.5rem; align-items: center; margin: 0.25rem 0;
    }
    .rating { color: hsl(45, 100%, 55%); font-size: 0.82rem; font-weight: 600; }
    .badge {
      background: hsl(145, 65%, 50%);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .app-desc {
      margin: 0; font-size: 0.82rem; color: hsla(0,0%,100%,0.55);
    }
    .perms {
      list-style: none; padding: 0; margin: 0 0 1.25rem;
      display: flex; flex-direction: column; gap: 0.3rem;
    }
    .perms li {
      font-size: 0.82rem; color: hsla(0,0%,100%,0.65);
    }
    .sheet-actions {
      display: flex; flex-direction: column; gap: 0.5rem;
    }
    .btn-install {
      background: linear-gradient(135deg, hsl(340,95%,65%), hsl(10,85%,55%));
      color: white; border: none; padding: 0.85rem; border-radius: 14px;
      font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: opacity 200ms;
    }
    .btn-install:active { opacity: 0.85; transform: scale(0.97); }
    .btn-dismiss {
      background: transparent; color: hsla(0,0%,100%,0.4); border: none;
      padding: 0.5rem; cursor: pointer; font-size: 0.85rem;
    }

    /* iOS tooltip */
    .ios-tooltip {
      position: fixed; bottom: calc(20px + env(safe-area-inset-bottom, 0px));
      left: 50%; transform: translateX(-50%);
      z-index: 300; animation: fadeIn 300ms ease;
    }
    .ios-card {
      background: white; color: hsl(240, 10%, 15%);
      padding: 0.75rem 1.25rem; border-radius: 12px;
      font-size: 0.88rem; white-space: nowrap;
      box-shadow: 0 8px 30px hsla(0,0%,0%,0.25);
    }
    .ios-card p { margin: 0; }
    .share-icon { font-size: 1rem; vertical-align: middle; }
    .ios-arrow {
      position: absolute; bottom: -8px; left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid white;
    }

    @keyframes fadeIn   { from { opacity: 0; }  to { opacity: 1; } }
    @keyframes slideUp  { from { transform: translateY(100%); } to { transform: translateY(0); } }
    `]
})
export class A2hsPromptComponent implements OnInit, OnDestroy {
    private readonly COOLDOWN_KEY = 'shilparangoli-a2hs-dismissed';
    private readonly COOLDOWN_DAYS = 7;

    showPrompt = signal<boolean>(false);
    showIosHint = signal<boolean>(false);

    private deferredPrompt: any = null;
    private beforeInstallHandler: ((e: Event) => void) | null = null;
    private appInstalledHandler: (() => void) | null = null;

    ngOnInit(): void {
        if (this.isInCooldown()) return;

        // iOS Safari detection
        if (this.isIosSafari() && !this.isStandalone()) {
            this.showIosHint.set(true);
            return;
        }

        // Chrome / Android: intercept beforeinstallprompt
        this.beforeInstallHandler = (e: Event) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showPrompt.set(true);
        };
        window.addEventListener('beforeinstallprompt', this.beforeInstallHandler);

        // Track successful install
        this.appInstalledHandler = () => {
            this.showPrompt.set(false);
            this.deferredPrompt = null;
        };
        window.addEventListener('appinstalled', this.appInstalledHandler);
    }

    ngOnDestroy(): void {
        if (this.beforeInstallHandler) {
            window.removeEventListener('beforeinstallprompt', this.beforeInstallHandler);
        }
        if (this.appInstalledHandler) {
            window.removeEventListener('appinstalled', this.appInstalledHandler);
        }
    }

    async install(): Promise<void> {
        if (!this.deferredPrompt) return;
        this.deferredPrompt.prompt();
        const result = await this.deferredPrompt.userChoice;
        if (result.outcome === 'accepted') {
            // installed
        }
        this.deferredPrompt = null;
        this.showPrompt.set(false);
    }

    dismiss(): void {
        this.showPrompt.set(false);
        this.setCooldown();
    }

    dismissIos(): void {
        this.showIosHint.set(false);
        this.setCooldown();
    }

    private isInCooldown(): boolean {
        const ts = localStorage.getItem(this.COOLDOWN_KEY);
        if (!ts) return false;
        const dismissed = parseInt(ts, 10);
        return (Date.now() - dismissed) < this.COOLDOWN_DAYS * 86400000;
    }

    private setCooldown(): void {
        localStorage.setItem(this.COOLDOWN_KEY, Date.now().toString());
    }

    private isIosSafari(): boolean {
        const ua = navigator.userAgent;
        return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
    }

    private isStandalone(): boolean {
        return (window.matchMedia('(display-mode: standalone)').matches) ||
            ('standalone' in navigator && (navigator as any).standalone === true);
    }
}
