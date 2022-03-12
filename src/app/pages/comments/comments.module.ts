import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommentsPageRoutingModule } from './comments-routing.module';

import { CommentsPage } from './comments.page';
import { SharePipesModule } from 'src/app/pipes/sharepipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharePipesModule,
    CommentsPageRoutingModule
  ],
  declarations: [CommentsPage]
})
export class CommentsPageModule {}
