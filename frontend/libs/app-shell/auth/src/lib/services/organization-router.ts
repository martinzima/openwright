import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationExtras, Router, UrlTree } from '@angular/router';
import { getRouteParamRecursive } from '@openwright/shared-utils';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OrganizationRouter {
  private router = inject(Router);

  readonly organizationUrlSlug$ = this.router.events.pipe(
    map(() => this.organizationUrlSlug),
    startWith(this.organizationUrlSlug),
    distinctUntilChanged()
  );

  get organizationUrlSlug() {
    return this.mapOrganizationUrlSlug(this.router.routerState.snapshot.root);
  }

  getGlobalCommands(commands: any[], organizationUrlSlug?: string): any[] {
    let globalCommands = commands;
    if (commands?.length && commands[0]?.toString().startsWith('/')) {
      const destOrganizationSlug =
        (organizationUrlSlug === undefined ? this.organizationUrlSlug : organizationUrlSlug) ?? '_';
      globalCommands = ['/', destOrganizationSlug];

      for (const command of commands) {
        if (typeof command === 'string') {
          for (const token of command.split('/')) {
            if (token.length) {
              globalCommands.push(token);
            }
          }
        } else {
          globalCommands.push(command);
        }
      }
    }
    return globalCommands;
  }

  getGlobalUrl(url: string | UrlTree, organizationUrlSlug?: string): string {
    let globalUrl: string;

    if (url instanceof UrlTree) {
      globalUrl = url.toString();
    } else {
      globalUrl = url;
    }

    if (typeof globalUrl === 'string' && globalUrl.startsWith('/')) {
      const destOrganizationSlug =
        (organizationUrlSlug === undefined ? this.organizationUrlSlug : organizationUrlSlug) ?? '_';
      globalUrl = `/${destOrganizationSlug}${url}`;
    }

    return globalUrl;
  }

  createUrlTree(commands: any[],
    navigationExtras?: NavigationExtras,
    organizationUrlSlug?: string): UrlTree {
    const globalCommands = this.getGlobalCommands(commands, organizationUrlSlug);
    return this.router.createUrlTree(globalCommands ?? [], navigationExtras);
  }

  navigateByUrl(
    url: string | UrlTree,
    extras?: NavigationExtras,
    organizationUrlSlug?: string
  ): Promise<boolean> {
    const globalUrl = this.getGlobalUrl(url, organizationUrlSlug);
    return this.router.navigateByUrl(globalUrl, extras);
  }

  navigate(commands: any[], extras?: NavigationExtras, organizationUrlSlug?: string): Promise<boolean> {
    const urlTree = this.createUrlTree(commands, extras, organizationUrlSlug);
    return this.router.navigateByUrl(urlTree, extras);
  }

  private mapOrganizationUrlSlug(snapshot: ActivatedRouteSnapshot): string | null {
    const organizationSlug = getRouteParamRecursive(snapshot, 'organizationSlug') ?? null;
    return organizationSlug;
  }
}
