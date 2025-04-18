import { Route } from '@angular/router';
import { MainLayoutComponent, FrontLayoutComponent } from '@openwright/ui-common';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
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
        path: 'signup',
        loadComponent: () => import('@openwright/feature-auth').then(m => m.SignupPageComponent)
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
      }
    ]
  }
];
