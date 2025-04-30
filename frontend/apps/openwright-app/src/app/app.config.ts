import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideSvgIcons } from '@ngneat/svg-icon';
import { logoIcon } from '@openwright/svg/logo';
import { formlyWrappers, OpenwrightPrimengPreset, registerReplaceFormFieldWrapperExtension } from '@openwright/ui-common';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiUrlReplaceHttpInterceptor } from '@openwright/shared-utils';
import { provideFormlyCore } from '@ngx-formly/core';
import { withFormlyPrimeNG } from '@ngx-formly/primeng';

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
    provideSvgIcons([logoIcon]),
    provideHttpClient(
      withFetch(),
      withInterceptors([apiUrlReplaceHttpInterceptor])
    ),
    provideFormlyCore([
      ...withFormlyPrimeNG(),
      formlyWrappers,
      ...registerReplaceFormFieldWrapperExtension()
    ])
  ],
};
