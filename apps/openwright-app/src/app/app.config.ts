import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideSvgIcons } from '@ngneat/svg-icon';
import { logoIcon } from '@openwright/svg/logo';
import { OpenwrightPrimengPreset } from '@openwright/ui-common';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideClientHydration(withEventReplay()),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: OpenwrightPrimengPreset
      }
    }),
    provideSvgIcons([logoIcon])
  ],
};
