import { animate, style, transition, trigger } from '@angular/animations';

/**
 * Simple fade-in animation.
 * Apply to an element using [@fadeIn].
 */
export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ])
]);

// Add other common animations here as needed