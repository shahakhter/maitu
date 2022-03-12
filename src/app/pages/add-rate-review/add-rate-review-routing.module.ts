import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddRateReviewPage } from './add-rate-review.page';

const routes: Routes = [
  {
    path: '',
    component: AddRateReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddRateReviewPageRoutingModule {}
