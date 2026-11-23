import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-shell/admin-shell').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        title: 'Dashboard — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-overview/admin-overview').then((m) => m.AdminOverviewPage),
      },
      {
        path: 'projects',
        title: 'Projects Management — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-projects/admin-projects').then((m) => m.AdminProjectsPage),
      },
      {
        path: 'skills',
        title: 'Skills Management — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-skills/admin-skills').then((m) => m.AdminSkillsPage),
      },
      {
        path: 'experience',
        title: 'Experience Timeline — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-experience/admin-experience').then((m) => m.AdminExperiencePage),
      },
      {
        path: 'education',
        title: 'Education Records — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-education/admin-education').then((m) => m.AdminEducationPage),
      },
      {
        path: 'settings',
        title: 'Portfolio Settings — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-settings/admin-settings').then((m) => m.AdminSettingsPage),
      },
      {
        path: 'about',
        title: 'About & Bio — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-settings/admin-settings').then((m) => m.AdminSettingsPage),
      },
      {
        path: 'profile',
        title: 'Profile Settings — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-settings/admin-settings').then((m) => m.AdminSettingsPage),
      },
      {
        path: 'cv',
        title: 'CV Management — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-settings/admin-settings').then((m) => m.AdminSettingsPage),
      },
      {
        path: 'messages',
        title: 'Messages & Inquiries — Portfolio Admin',
        loadComponent: () =>
          import('./pages/admin-messages/admin-messages').then((m) => m.AdminMessagesPage),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
