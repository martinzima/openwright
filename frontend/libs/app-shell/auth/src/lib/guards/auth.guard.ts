import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, RedirectCommand, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<GuardResult> {
    if (this.authService.isLoading()) {
      await firstValueFrom(
        toObservable(this.authService.isLoading)
        .pipe(filter(isLoading => !isLoading)));
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }

    return new RedirectCommand(
      this.router.parseUrl('/login'),
      {
        state: {
          redirectUrl: state.url
        }
      }
    );
  }
}
