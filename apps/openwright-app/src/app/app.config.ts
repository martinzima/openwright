import { ApplicationConfig, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideClientHydration(withEventReplay()),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ],
};
