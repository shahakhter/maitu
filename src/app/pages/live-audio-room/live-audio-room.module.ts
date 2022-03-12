import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LiveAudioRoomPageRoutingModule } from './live-audio-room-routing.module';

import { LiveAudioRoomPage } from './live-audio-room.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LiveAudioRoomPageRoutingModule
  ],
  declarations: [LiveAudioRoomPage]
})
export class LiveAudioRoomPageModule {}
