import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRateReviewPageRoutingModule } from './add-rate-review-routing.module';

import { AddRateReviewPage } from './add-rate-review.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAoDJ4s8Sf-IdZrNNK58PTeTpmSr7KYAjw'
    }),
    AddRateReviewPageRoutingModule
  ],
  declarations: [AddRateReviewPage]
})
export class AddRateReviewPageModule {}
