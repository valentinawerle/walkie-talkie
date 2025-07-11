import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
  {
    path: 'rooms',
    loadComponent: () => import('./components/rooms/rooms').then(m => m.RoomsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'room/:id',
    loadComponent: () => import('./components/room-chat/room-chat').then(m => m.RoomChatComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
