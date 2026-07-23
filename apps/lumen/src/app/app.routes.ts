import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page.component').then(m => m.LoginPageComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup-page.component').then(m => m.SignupPageComponent),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery-page.component').then(m => m.GalleryPageComponent),
  },
  {
    path: 'collections',
    loadComponent: () => import('./features/collections/collections-page.component').then(m => m.CollectionsPageComponent),
  },
  {
    path: 'collections/:slug',
    loadComponent: () => import('./features/collections/collection-detail-page.component').then(m => m.CollectionDetailPageComponent),
  },
  {
    path: 'favourites',
    loadComponent: () => import('./features/favourites/favourites-page.component').then(m => m.FavouritesPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about-page.component').then(m => m.AboutPageComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact-page.component').then(m => m.ContactPageComponent),
  },
  {
    path: 'payment',
    loadComponent: () => import('./features/payment/payment-page.component').then(m => m.PaymentPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payment/checkout',
    loadComponent: () => import('./features/payment/checkout-page.component').then(m => m.CheckoutPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'checkout/success',
    loadComponent: () => import('./features/payment/checkout-success-page.component').then(m => m.CheckoutSuccessPageComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'collections',
        loadComponent: () => import('./features/admin/admin-collections.component').then(m => m.AdminCollectionsComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/admin-orders.component').then(m => m.AdminOrdersComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];