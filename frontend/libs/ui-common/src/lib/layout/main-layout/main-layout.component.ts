import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService, OrganizationContextService } from '@openwright/app-shell-auth';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { injectParams } from 'ngxtension/inject-params';
import { explicitEffect } from 'ngxtension/explicit-effect';

enum MainLayoutState {
  Loading = 'Loading',
  Loaded = 'Loaded',
  Unauthenticated = 'Unauthenticated',
  RedirectToOrganization = 'RedirectToOrganization',
  CreateOrganization = 'CreateOrganization',
  CreateAccount = 'CreateAccount',
  Unauthorized = 'Unauthorized'
}

@Component({
  selector: 'ow-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    ProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './main-layout.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly organizationContextService = inject(OrganizationContextService);
  private readonly router = inject(Router);
  private readonly routeOrganizationSlug = injectParams<string>('organizationSlug');

  readonly organization = this.organizationContextService.organization;
  readonly currentYear = new Date().getFullYear();
  readonly isLoadingAuth = this.authService.isLoading;
  readonly MainLayoutState = MainLayoutState;

  readonly hasPermissions = computed(() => {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    const routeOrganizationSlug = this.routeOrganizationSlug();
    if (!routeOrganizationSlug) {
      return true;
    }

    const roleGrants = this.authService.roleGrants();
    return !!roleGrants?.find(grant => grant.organization.urlSlug === routeOrganizationSlug);
  });

  readonly state = computed(() => {
    if (this.isLoadingAuth()
        || !this.routeOrganizationSlug()
        || (this.hasPermissions() && !this.organization())
      ) {
      return MainLayoutState.Loading;
    }

    if (!this.authService.isAuthenticated()) {
      return MainLayoutState.Unauthenticated;
    }

    if (!this.authService.user()) {
      return MainLayoutState.CreateAccount;
    }

    const roleGrants = this.authService.roleGrants();
    if (!roleGrants
      || roleGrants.length === 0) {
      return MainLayoutState.CreateOrganization;
    }

    if (this.routeOrganizationSlug() === '_') {
      return MainLayoutState.RedirectToOrganization;
    }

    return this.hasPermissions() ? MainLayoutState.Loaded : MainLayoutState.Unauthorized;
  });

  constructor() {
    explicitEffect([this.routeOrganizationSlug, this.authService.roleGrants], ([routeOrganizationSlug, roleGrants]) => {
      if (!routeOrganizationSlug || !roleGrants) {
        this.organizationContextService.setOrganization(null);
      }

      const organization = roleGrants?.find(grant => grant.organization.urlSlug === routeOrganizationSlug);
      this.organizationContextService.setOrganization(organization?.organization ?? null);
    });

    explicitEffect([this.state], ([state]) => {
      switch (state) {
        case MainLayoutState.Unauthenticated:
          this.router.navigate(['/login']);
          break;
        case MainLayoutState.Unauthorized:
          this.router.navigate(['/unauthorized']);
          break;
        case MainLayoutState.CreateOrganization:
          this.router.navigate(['/create-organization']);
          break;
        case MainLayoutState.CreateAccount:
          this.router.navigate(['/create-account']);
          break;
        case MainLayoutState.RedirectToOrganization: {
          const roleGrants = this.authService.roleGrants();
          if (roleGrants && roleGrants.length > 0) {
            this.router.navigate(['/', roleGrants[0].organization.urlSlug, 'dashboard']);
          }
          break;
        }
      }
    });
  }
}