import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserDetailsPageRoutingModule } from './user-details-routing.module';
import { UserDetailsPage } from './user-details.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuperTabsModule,
    UserDetailsPageRoutingModule
  ],
  declarations: [UserDetailsPage]
})
export class UserDetailsPageModule {}
