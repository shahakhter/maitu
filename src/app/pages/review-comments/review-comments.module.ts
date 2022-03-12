import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewCommentsPageRoutingModule } from './review-comments-routing.module';

import { ReviewCommentsPage } from './review-comments.page';
import { SharePipesModule } from 'src/app/pipes/sharepipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharePipesModule,
    ReviewCommentsPageRoutingModule
  ],
  declarations: [ReviewCommentsPage]
})
export class ReviewCommentsPageModule {}
