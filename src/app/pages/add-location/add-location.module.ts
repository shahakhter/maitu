import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddLocationPageRoutingModule } from './add-location-routing.module';
import { AddLocationPage } from './add-location.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAoDJ4s8Sf-IdZrNNK58PTeTpmSr7KYAjw'
    }),
    IonicModule,
    AddLocationPageRoutingModule
  ],
  declarations: [AddLocationPage]
})
export class AddLocationPageModule { }
