import { Route, UrlSegment } from '@angular/router';
import { MainLayoutComponent, FrontLayoutComponent } from '@openwright/ui-common';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/_/dashboard',
    pathMatch: 'full'
  },
  {
    path: ':organizationSlug',
    canMatch: [
      (route: Route, segments: UrlSegment[]) => segments.length > 1
    ],
    component: MainLayoutComponent,
    //canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
      },
      {
        path: '**',
        loadComponent: () => import('@openwright/feature-auth').then(m => m.NotFoundPageComponent)
      }
    ]
  },
  {
    path: '',
    component: FrontLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('@openwright/feature-auth').then(m => m.LoginPageComponent)
      },
      {
        path: 'sign-up',
        loadComponent: () => import('@openwright/feature-auth').then(m => m.SignupPageComponent)
      },
      {
        path: 'create-account',
        loadComponent: () => import('@openwright/feature-auth').then(m => m.CreateAccountPageComponent)
      },
      {
        path: '**',
        loadComponent: () => import('@openwright/feature-auth').then(m => m.NotFoundPageComponent)
      }
    ],
  }
];
