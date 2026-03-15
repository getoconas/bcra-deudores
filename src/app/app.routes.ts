import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '', 
    component: DashboardComponent,
    title: 'BCRA | Dashboard' // Angular 21 permite cambiar el título de la pestaña aquí mismo
  },
  {
    path: '**', // Wildcard: si el usuario tipea una URL que no existe
    redirectTo: '', // Lo redirigimos al inicio
    pathMatch: 'full'
  }
];
