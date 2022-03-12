import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GroupDetailsPageRoutingModule } from './group-details-routing.module';
import { GroupDetailsPage } from './group-details.page';
import { SharePipesModule } from 'src/app/pipes/sharepipe.module';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAoDJ4s8Sf-IdZrNNK58PTeTpmSr7KYAjw'
    }),
    SharePipesModule,
    GroupDetailsPageRoutingModule
  ],
  declarations: [GroupDetailsPage]
})
export class GroupDetailsPageModule {}
