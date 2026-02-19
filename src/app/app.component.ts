import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { A2hsPromptComponent } from './shared/components/a2hs-prompt/a2hs-prompt.component';
import { SwUpdateService } from './shared/services/sw-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, A2hsPromptComponent],
  template: `
    <router-outlet></router-outlet>
    <app-a2hs-prompt></app-a2hs-prompt>

    <!-- Non-intrusive update toast -->
    <div class="update-toast" *ngIf="swUpdate.updateAvailable" (click)="swUpdate.applyUpdate()">
      <span>🔄 New version available!</span>
      <button>Update</button>
    </div>
  `,
  styles: [`
    .update-toast {
      position: fixed;
      bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
      left: 50%;
      transform: translateX(-50%);
      background: hsl(240, 10%, 18%);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.35);
      z-index: 250;
      animation: toastIn 300ms ease;
      cursor: pointer;
    }
    .update-toast button {
      background: hsl(340, 95%, 65%);
      color: white;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'ShilpaRangoli';
  swUpdate = inject(SwUpdateService);

  ngOnInit(): void {
    this.swUpdate.init();
  }
}
