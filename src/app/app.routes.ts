import { Routes } from '@angular/router';
import { GameModeSelectorComponent } from './game-mode-selector/game-mode-selector.component';
import { RangoliCanvasComponent } from './rangoli-canvas/rangoli-canvas.component';

export const routes: Routes = [
    { path: '', redirectTo: 'game-mode', pathMatch: 'full' },
    { path: 'game-mode', component: GameModeSelectorComponent },
    { path: 'freeplay', component: RangoliCanvasComponent },
    {
        path: 'learn',
        loadComponent: () => import('./rangoli-learning/rangoli-learning.component').then(m => m.RangoliLearningComponent)
    }
];
