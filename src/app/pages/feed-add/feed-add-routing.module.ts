import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeedAddPage } from './feed-add.page';

const routes: Routes = [
  {
    path: '',
    component: FeedAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedAddPageRoutingModule {}
