import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-game-mode-selector',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './game-mode-selector.component.html',
    styleUrls: ['./game-mode-selector.component.scss']
})
export class GameModeSelectorComponent {
    modes = [
        {
            id: 'learn',
            title: 'Course Mode',
            description: 'Master 50 traditional patterns with step-by-step guidance.',
            icon: '🎓',
            route: '/learn',
            color: 'var(--accent-learning)'
        },
        {
            id: 'freeplay',
            title: 'Freeplay',
            description: 'Relax with anti-gravity particles and physics simulation.',
            icon: '✨',
            route: '/freeplay',
            color: 'var(--accent-freeplay)'
        }
    ];
}
