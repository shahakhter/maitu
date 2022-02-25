import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedDetailsPageRoutingModule } from './feed-details-routing.module';

import { FeedDetailsPage } from './feed-details.page';
import { SharePipesModule } from 'src/app/pipes/sharepipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharePipesModule,
    FeedDetailsPageRoutingModule
  ],
  declarations: [FeedDetailsPage]
})
export class FeedDetailsPageModule {}
