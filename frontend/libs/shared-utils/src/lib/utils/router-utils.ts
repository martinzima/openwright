import { Type } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export function isComponentActiveInRoute<T>(snapshot: RouterStateSnapshot, componentClass: Type<T>): boolean {
  return isComponentActiveInActivatedRouteSnapshot(snapshot.root, componentClass);
}

export function isComponentActiveInActivatedRouteSnapshot<T>(snapshot: ActivatedRouteSnapshot, componentClass: Type<T>): boolean {
  if (snapshot.component === componentClass) {
    return true;
  }

  for (const child of snapshot.children) {
    if (isComponentActiveInActivatedRouteSnapshot(child, componentClass)) {
      return true;
    }
  }

  return false;
}

export function getRouteParamRecursive(snapshot: ActivatedRouteSnapshot, paramName: string): string | undefined {
  if (snapshot.params[paramName]) {
    return snapshot.params[paramName];
  }

  for (const child of snapshot.children) {
    const value = getRouteParamRecursive(child, paramName);
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function getRouteResolvedUrl(route: ActivatedRouteSnapshot): string {
  return route.pathFromRoot
      .map(v => v.url.map(segment => segment.toString()).join('/'))
      .join('/');
}

export function getRouteConfiguredUrl(route: ActivatedRouteSnapshot): string {
  return route.pathFromRoot
      .filter(v => v.routeConfig)
      .map(v => v.routeConfig?.path)
      .filter(v => !!v)
      .join('/');
}
