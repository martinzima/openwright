import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideSvgIcons } from '@ngneat/svg-icon';
import { logoIcon } from '@openwright/svg/logo';
import { formlyTranslateExtensionProvider, formlyWrappers, OpenWrightPrimengPreset, registerReplaceFormFieldWrapperExtension } from '@openwright/ui-common';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { antiCsrfHeaderHttpInterceptor, apiUrlReplaceHttpInterceptor } from '@openwright/shared-utils';
import { provideFormlyCore } from '@ngx-formly/core';
import { withFormlyPrimeNG } from '@ngx-formly/primeng';
import { organizationIdHeaderHttpInterceptor } from '@openwright/app-shell-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideClientHydration(withEventReplay()),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: OpenWrightPrimengPreset
      }
    }),
    provideSvgIcons([logoIcon]),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        antiCsrfHeaderHttpInterceptor,
        organizationIdHeaderHttpInterceptor,
        apiUrlReplaceHttpInterceptor
      ])
    ),
    provideFormlyCore([
      {
        extras: {
          immutable: true
        }
      },
      ...withFormlyPrimeNG(),
      formlyWrappers,
      ...registerReplaceFormFieldWrapperExtension()
    ]),
    formlyTranslateExtensionProvider
  ],
};
