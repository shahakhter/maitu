import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewCommentsPage } from './review-comments.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewCommentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewCommentsPageRoutingModule {}
