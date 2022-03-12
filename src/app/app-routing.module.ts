import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'live-audio-room',
    loadChildren: () => import('./pages/live-audio-room/live-audio-room.module').then( m => m.LiveAudioRoomPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canLoad: [AutoLoginGuard]
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'message-chat',
    loadChildren: () => import('./pages/message-chat/message-chat.module').then( m => m.MessageChatPageModule)
  },
  {
    path: 'my-profile',
    loadChildren: () => import('./pages/my-profile/my-profile.module').then( m => m.MyProfilePageModule)
  },
  {
    path: 'comments',
    loadChildren: () => import('./pages/comments/comments.module').then( m => m.CommentsPageModule)
  },
  {
    path: 'add-location',
    loadChildren: () => import('./pages/add-location/add-location.module').then( m => m.AddLocationPageModule)
  },
  {
    path: 'group-details',
    loadChildren: () => import('./pages/group-details/group-details.module').then( m => m.GroupDetailsPageModule)
  },
  {
    path: 'user-details',
    loadChildren: () => import('./pages/user-details/user-details.module').then( m => m.UserDetailsPageModule)
  },
  {
    path: 'feed-add',
    loadChildren: () => import('./pages/feed-add/feed-add.module').then( m => m.FeedAddPageModule)
  },
  {
    path: 'complete-profile',
    loadChildren: () => import('./pages/complete-profile/complete-profile.module').then( m => m.CompleteProfilePageModule)
  },
  {
    path: 'user-location',
    loadChildren: () => import('./pages/user-location/user-location.module').then( m => m.UserLocationPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'profile-modal',
    loadChildren: () => import('./pages/profile-modal/profile-modal.module').then( m => m.ProfileModalPageModule)
  },
  {
    path: 'search-location',
    loadChildren: () => import('./pages/search-location/search-location.module').then( m => m.SearchLocationPageModule)
  },
  {
    path: 'add-rate-review',
    loadChildren: () => import('./pages/add-rate-review/add-rate-review.module').then( m => m.AddRateReviewPageModule)
  },
  {
    path: 'review-comments',
    loadChildren: () => import('./pages/review-comments/review-comments.module').then( m => m.ReviewCommentsPageModule)
  },
  {
    path: 'feed-details',
    loadChildren: () => import('./pages/feed-details/feed-details.module').then( m => m.FeedDetailsPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
