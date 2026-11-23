import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Ahmed Ali Abdullah Ashour — Front-End Developer',
    loadComponent: () => import('./features/home/home').then((m) => m.HomePage),
  },
  {
    path: 'projects',
    title: 'Project archive — Ahmed Ashour',
    loadComponent: () =>
      import('./features/projects/pages/projects-page/projects-page').then((m) => m.ProjectsPage),
  },
  {
    path: 'admin/login',
    title: 'Admin Sign In — Portfolio',
    loadComponent: () =>
      import('./features/admin/pages/admin-login/admin-login').then((m) => m.AdminLoginPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    title: 'Page not found — Ahmed Ashour',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
